import React, { useState, useEffect, useId } from 'react';
import { Volume2, Sparkles, Loader2, RefreshCw, AlertCircle, MessageSquare, Mic, User } from 'lucide-react';
import { Voice, ToneStyleId, SpeechItem, DialogueSpeakerConfig } from './types';
import { VOICES, TONE_STYLES, SAMPLE_TEXTS, SAMPLE_DIALOGUES } from './data/presets';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { DialogueEditor } from './components/DialogueEditor';
import { HistoryList } from './components/HistoryList';

export default function App() {
  const [mode, setMode] = useState<'single' | 'dialogue'>('single');
  const [text, setText] = useState<string>(SAMPLE_TEXTS[0].text);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('Kore');
  const [selectedToneId, setSelectedToneId] = useState<ToneStyleId>('natural');
  
  // Dialogue state
  const [dialogueSpeakers, setDialogueSpeakers] = useState<[DialogueSpeakerConfig, DialogueSpeakerConfig]>([
    { name: 'Alex', voiceName: 'Fenrir' },
    { name: 'Maya', voiceName: 'Kore' },
  ]);
  const [dialogueScript, setDialogueScript] = useState<string>(SAMPLE_DIALOGUES[0].script);

  // Audio generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const [currentSpeech, setCurrentSpeech] = useState<SpeechItem | null>(null);
  const [history, setHistory] = useState<SpeechItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gemini_tts_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistory(parsed);
          setCurrentSpeech(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load speech history', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: SpeechItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((i) => i.id !== item.id)].slice(0, 10);
      try {
        localStorage.setItem('gemini_tts_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage full or error', e);
      }
      return updated;
    });
  };

  const handleGenerate = async () => {
    setErrorMessage(null);

    const payload: any = {
      mode,
    };

    if (mode === 'single') {
      if (!text.trim()) {
        setErrorMessage('Please enter some text to generate speech.');
        return;
      }
      payload.text = text.trim();
      payload.voiceName = selectedVoiceId;
      payload.toneStyle = selectedToneId;
    } else {
      if (!dialogueScript.trim()) {
        setErrorMessage('Please enter dialogue lines to generate conversation speech.');
        return;
      }
      payload.dialogueScript = dialogueScript.trim();
      payload.dialogueSpeakers = dialogueSpeakers;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate speech. Please try again.');
      }

      const audioDataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;

      const newSpeech: SpeechItem = {
        id: `speech_${Date.now()}`,
        text: mode === 'single' ? text.trim() : dialogueScript.trim(),
        voiceName: data.voiceName,
        toneStyle: mode === 'single' ? selectedToneId : undefined,
        audioBase64: data.audioBase64,
        audioUrl: audioDataUrl,
        duration: data.duration || 0,
        createdAt: Date.now(),
        mode,
        dialogueSpeakers: mode === 'dialogue' ? dialogueSpeakers : undefined,
      };

      setCurrentSpeech(newSpeech);
      saveToHistory(newSpeech);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with Gemini TTS service.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceId) return;
    setPreviewingVoiceId(voice.id);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'single',
          text: voice.previewText,
          voiceName: voice.id,
          toneStyle: 'natural',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Voice sample preview failed');
      }

      const audioDataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
      const audio = new Audio(audioDataUrl);
      await audio.play();
    } catch (err: any) {
      console.error('Preview error:', err);
      setErrorMessage(`Could not preview ${voice.name}: ${err.message}`);
    } finally {
      setPreviewingVoiceId(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('gemini_tts_history');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('gemini_tts_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    if (currentSpeech?.id === id) {
      setCurrentSpeech(null);
    }
  };

  const applySampleText = (sample: (typeof SAMPLE_TEXTS)[0]) => {
    setText(sample.text);
    setSelectedVoiceId(sample.voice);
    setSelectedToneId(sample.tone);
  };

  // Word count & estimate duration (~140 words/min)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 140) * 60));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
                Text to Speech
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 font-mono border border-neutral-700">
                  gemini-3.1-flash-tts-preview
                </span>
              </h1>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/60">
            <button
              id="mode-single-speaker-tab"
              type="button"
              onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'single'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Single Speaker</span>
            </button>
            <button
              id="mode-dialogue-tab"
              type="button"
              onClick={() => setMode('dialogue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'dialogue'
                  ? 'bg-amber-400 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Dual Speaker Dialogue</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Error Alert */}
        {errorMessage && (
          <div
            id="app-error-banner"
            className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Generation Notice</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs text-red-400 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Configuration Box */}
        <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-sm space-y-6">
          {mode === 'single' ? (
            <>
              {/* Sample Prompts Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Quick Sample Presets
                  </span>
                  <span className="text-xs text-neutral-500">
                    Click to load sample script & tone
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample.title}
                      id={`sample-preset-${sample.title.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => applySampleText(sample)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition-colors"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="text-input"
                    className="text-sm font-semibold text-neutral-200"
                  >
                    Text to Speak
                  </label>
                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{text.length} chars</span>
                    <span>•</span>
                    <span>Est. ~{estimatedSeconds}s</span>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id="text-input"
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter or paste any text you would like Gemini TTS to speak..."
                    className="w-full text-base p-4 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y leading-relaxed font-normal"
                  />
                  {text.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setText('')}
                      className="absolute top-3 right-3 text-xs text-neutral-400 hover:text-neutral-200 px-2 py-0.5 rounded bg-neutral-800/80"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Tone / Emotion Style */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-200 block">
                  Delivery Style & Emotion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {TONE_STYLES.map((tone) => {
                    const isSelected = selectedToneId === tone.id;
                    return (
                      <button
                        key={tone.id}
                        id={`tone-button-${tone.id}`}
                        type="button"
                        onClick={() => setSelectedToneId(tone.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/40'
                            : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700 text-neutral-300'
                        }`}
                      >
                        <div className="text-xs font-semibold">{tone.label}</div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                          {tone.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Selection */}
              <VoiceSelector
                voices={VOICES}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={setSelectedVoiceId}
                onPreviewVoice={handlePreviewVoice}
                previewingVoiceId={previewingVoiceId}
              />
            </>
          ) : (
            /* Dialogue Mode */
            <DialogueEditor
              voices={VOICES}
              speakers={dialogueSpeakers}
              onChangeSpeakers={setDialogueSpeakers}
              script={dialogueScript}
              onChangeScript={setDialogueScript}
            />
          )}

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generates high-fidelity 24kHz audio via Gemini 3.1 Flash TTS</span>
            </div>

            <button
              id="generate-speech-button"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (mode === 'single' ? !text.trim() : !dialogueScript.trim())}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                isGenerating || (mode === 'single' ? !text.trim() : !dialogueScript.trim())
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                  <span>Synthesizing Voice...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Active Audio Player Section */}
        {currentSpeech && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Generated Audio Playback
            </h2>
            <AudioPlayer speech={currentSpeech} />
          </section>
        )}

        {/* History List */}
        <HistoryList
          items={history}
          activeSpeechId={currentSpeech?.id}
          onSelectSpeech={setCurrentSpeech}
          onClearHistory={handleClearHistory}
          onDeleteItem={handleDeleteHistoryItem}
        />
      </main>
    </div>
  );
}
