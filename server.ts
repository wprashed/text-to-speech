import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Convert 16-bit Mono PCM buffer to valid WAV container
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  // If already WAV formatted (starts with RIFF), return as is
  if (pcmBuffer.length >= 4 && pcmBuffer.subarray(0, 4).toString('ascii') === 'RIFF') {
    return pcmBuffer;
  }

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const wavBuffer = Buffer.alloc(totalSize);

  // RIFF header
  wavBuffer.write('RIFF', 0, 'ascii');
  wavBuffer.writeUInt32LE(totalSize - 8, 4);
  wavBuffer.write('WAVE', 8, 'ascii');

  // fmt subchunk
  wavBuffer.write('fmt ', 12, 'ascii');
  wavBuffer.writeUInt32LE(16, 16); // subchunk size (16 for PCM)
  wavBuffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  wavBuffer.write('data', 36, 'ascii');
  wavBuffer.writeUInt32LE(dataSize, 40);

  // Audio samples
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

// API Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', model: 'gemini-3.1-flash-tts-preview' });
});

// API Voice directory
app.get('/api/tts/voices', (_req, res) => {
  const voices = [
    {
      id: 'Kore',
      name: 'Kore',
      gender: 'Female',
      accent: 'Warm & Natural',
      description: 'Clear, balanced, and expressive voice. Ideal for narration, guides, and conversational reading.',
      previewText: 'Hello! I am Kore. I can help bring your words to life with clear, warm tone.',
    },
    {
      id: 'Puck',
      name: 'Puck',
      gender: 'Male',
      accent: 'Energetic & Playful',
      description: 'Dynamic, friendly, and lively voice. Great for storytelling, animations, and engaging announcements.',
      previewText: 'Hey there! Puck here, ready to bring high energy and enthusiasm to your audio.',
    },
    {
      id: 'Charon',
      name: 'Charon',
      gender: 'Male',
      accent: 'Deep & Grounded',
      description: 'Rich, resonant, and calm timbre. Perfect for documentaries, audiobooks, and reflective content.',
      previewText: 'Greetings. I am Charon. My deep tone lends weight and calmness to your message.',
    },
    {
      id: 'Fenrir',
      name: 'Fenrir',
      gender: 'Male',
      accent: 'Authoritative & Bold',
      description: 'Confident, articulate, and strong voice. Best for professional presentations, news, and executive briefings.',
      previewText: 'Good day. Fenrir speaking. Direct, articulate, and commanding presence.',
    },
    {
      id: 'Zephyr',
      name: 'Zephyr',
      gender: 'Female',
      accent: 'Soft & Serene',
      description: 'Gentle, soothing, and airy tone. Ideal for meditation, bedtime stories, and relaxed reading.',
      previewText: 'Welcome. I am Zephyr. Take a deep breath and let your thoughts slow down.',
    },
  ];
  res.json({ voices });
});

// API Generate speech
app.post('/api/tts/generate', async (req, res) => {
  try {
    const {
      mode = 'single', // 'single' or 'dialogue'
      text,
      voiceName = 'Kore',
      toneStyle = 'natural',
      dialogueSpeakers, // [{ name: 'Joe', voiceName: 'Kore' }, { name: 'Jane', voiceName: 'Puck' }]
      dialogueScript,
    } = req.body;

    const ai = getGenAI();

    let audioBase64: string | undefined;

    if (mode === 'dialogue') {
      if (!dialogueScript || !dialogueScript.trim()) {
        return res.status(400).json({ error: 'Dialogue script cannot be empty.' });
      }

      const sp1 = dialogueSpeakers?.[0] || { name: 'Speaker 1', voiceName: 'Kore' };
      const sp2 = dialogueSpeakers?.[1] || { name: 'Speaker 2', voiceName: 'Puck' };

      const prompt = `TTS the following conversation between ${sp1.name} and ${sp2.name}:\n${dialogueScript}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: sp1.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: sp1.voiceName },
                  },
                },
                {
                  speaker: sp2.name,
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: sp2.voiceName },
                  },
                },
              ],
            },
          },
        },
      });

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } else {
      // Single speaker mode
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Input text cannot be empty.' });
      }

      // Format prompt with tone if specified
      let speechPrompt = text.trim();
      if (toneStyle && toneStyle !== 'natural') {
        const tonePrefixes: Record<string, string> = {
          cheerful: 'Say cheerfully and enthusiastically: ',
          calm: 'Say calmly, smoothly and soothingly: ',
          serious: 'Say professionally and authoritatively: ',
          whisper: 'Say in a gentle, hushed whisper: ',
          dramatic: 'Say with dramatic narrative inflection: ',
          curious: 'Say with thoughtful curiosity: ',
        };
        const prefix = tonePrefixes[toneStyle] || '';
        speechPrompt = `${prefix}${speechPrompt}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: speechPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioBase64) {
      return res.status(500).json({
        error: 'No audio data was generated by the model. Please check the prompt and try again.',
      });
    }

    // Convert raw PCM to a universally playable 24kHz 16-bit WAV file
    const rawBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString('base64');

    // Calculate approximate duration in seconds (data bytes / (24000 samples/sec * 2 bytes/sample))
    const rawAudioBytes = wavBuffer.length > 44 ? wavBuffer.length - 44 : rawBuffer.length;
    const durationSeconds = Number((rawAudioBytes / (24000 * 2)).toFixed(2));

    return res.json({
      audioBase64: wavBase64,
      mimeType: 'audio/wav',
      duration: durationSeconds,
      voiceName: mode === 'single' ? voiceName : 'Dialogue',
      sampleRate: 24000,
    });
  } catch (error: any) {
    console.error('TTS Generation error:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred during speech generation.',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
