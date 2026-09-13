import React from 'react';
import { Voice, DialogueSpeakerConfig } from '../types';
import { Users, Plus, MessageSquare } from 'lucide-react';
import { SAMPLE_DIALOGUES } from '../data/presets';

interface DialogueEditorProps {
  voices: Voice[];
  speakers: [DialogueSpeakerConfig, DialogueSpeakerConfig];
  onChangeSpeakers: (speakers: [DialogueSpeakerConfig, DialogueSpeakerConfig]) => void;
  script: string;
  onChangeScript: (script: string) => void;
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  voices,
  speakers,
  onChangeSpeakers,
  script,
  onChangeScript,
}) => {
  const updateSpeaker = (index: 0 | 1, updates: Partial<DialogueSpeakerConfig>) => {
    const updated: [DialogueSpeakerConfig, DialogueSpeakerConfig] = [
      index === 0 ? { ...speakers[0], ...updates } : speakers[0],
      index === 1 ? { ...speakers[1], ...updates } : speakers[1],
    ];
    onChangeSpeakers(updated);
  };

  const handleAppendSpeakerLine = (speakerName: string) => {
    const newLine = script.endsWith('\n') || script.length === 0 ? '' : '\n';
    onChangeScript(`${script}${newLine}${speakerName}: `);
  };

  const loadDialoguePreset = (idx: number) => {
    const preset = SAMPLE_DIALOGUES[idx];
    if (!preset) return;
    onChangeSpeakers([
      { name: preset.speaker1.name, voiceName: preset.speaker1.voiceName },
      { name: preset.speaker2.name, voiceName: preset.speaker2.voiceName },
    ]);
    onChangeScript(preset.script);
  };

  return (
    <div className="space-y-4">
      {/* Speaker Configuration Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Speaker 1
            </span>
            <button
              type="button"
              id="insert-speaker-1-turn-btn"
              onClick={() => handleAppendSpeakerLine(speakers[0].name)}
              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
            >
              <Plus className="w-3 h-3" /> Add Turn
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Speaker Name</label>
              <input
                id="speaker-1-name-input"
                type="text"
                value={speakers[0].name}
                onChange={(e) => updateSpeaker(0, { name: e.target.value })}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Alex"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 block mb-1">Assigned Voice</label>
              <select
                id="speaker-1-voice-select"
                value={speakers[0].voiceName}
                onChange={(e) => updateSpeaker(0, { voiceName: e.target.value })}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender} - {v.accent})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Speaker 2 */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Speaker 2
            </span>
            <button
              type="button"
              id="insert-speaker-2-turn-btn"
              onClick={() => handleAppendSpeakerLine(speakers[1].name)}
              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100"
            >
              <Plus className="w-3 h-3" /> Add Turn
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">Speaker Name</label>
              <input
                id="speaker-2-name-input"
                type="text"
                value={speakers[1].name}
                onChange={(e) => updateSpeaker(1, { name: e.target.value })}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. Maya"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-500 block mb-1">Assigned Voice</label>
              <select
                id="speaker-2-voice-select"
                value={speakers[1].voiceName}
                onChange={(e) => updateSpeaker(1, { voiceName: e.target.value })}
                className="w-full text-sm px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender} - {v.accent})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preset dialogues picker */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> Sample Scripts:
        </span>
        {SAMPLE_DIALOGUES.map((preset, idx) => (
          <button
            key={preset.title}
            type="button"
            id={`dialogue-preset-${idx}`}
            onClick={() => loadDialoguePreset(idx)}
            className="text-xs px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Script Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Dialogue Script
          </label>
          <span className="text-xs text-neutral-400 font-mono">
            Format: "{speakers[0].name}: line"
          </span>
        </div>
        <textarea
          id="dialogue-script-textarea"
          rows={6}
          value={script}
          onChange={(e) => onChangeScript(e.target.value)}
          placeholder={`${speakers[0].name}: Hello, how are you today?\n${speakers[1].name}: I'm doing well, thanks for asking!`}
          className="w-full text-sm font-mono p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y leading-relaxed"
        />
      </div>
    </div>
  );
};
