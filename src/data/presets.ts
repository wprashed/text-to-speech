import { Voice, ToneStyle } from '../types';

export const VOICES: Voice[] = [
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Female',
    accent: 'Warm & Natural',
    description: 'Clear, balanced, and expressive. Excellent for guides, narrations, and natural reading.',
    previewText: 'Hello! I am Kore. I can help bring your words to life with a clear, warm tone.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Male',
    accent: 'Playful & Energetic',
    description: 'Dynamic, friendly, and upbeat. Great for storytelling, animations, and announcements.',
    previewText: 'Hey there! Puck here, ready to bring high energy and enthusiasm to your audio.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Male',
    accent: 'Deep & Grounded',
    description: 'Rich, resonant, and calm. Perfect for documentaries, audiobooks, and reflective content.',
    previewText: 'Greetings. I am Charon. My deep tone lends weight and calmness to your message.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Male',
    accent: 'Authoritative & Bold',
    description: 'Confident, articulate, and strong. Best for presentations, briefings, and news.',
    previewText: 'Good day. Fenrir speaking. Direct, articulate, and commanding presence.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Female',
    accent: 'Soft & Serene',
    description: 'Gentle, soothing, and airy. Ideal for meditation, bedtime stories, and relaxed reading.',
    previewText: 'Welcome. I am Zephyr. Take a deep breath and let your thoughts slow down.',
  },
];

export const TONE_STYLES: ToneStyle[] = [
  { id: 'natural', label: 'Natural', description: 'Standard balanced speaking tone' },
  { id: 'cheerful', label: 'Cheerful', description: 'Upbeat, friendly, and lively delivery' },
  { id: 'calm', label: 'Calm', description: 'Smooth, relaxing, and soothing pace' },
  { id: 'serious', label: 'Professional', description: 'Formal, articulate, and business-ready' },
  { id: 'whisper', label: 'Whisper', description: 'Gentle, intimate, and hushed voice' },
  { id: 'dramatic', label: 'Dramatic', description: 'Cinematic storytelling with vivid inflection' },
  { id: 'curious', label: 'Curious', description: 'Inquisitive, thoughtful, and engaging' },
];

export const SAMPLE_TEXTS = [
  {
    title: 'Technology News',
    text: 'Artificial intelligence has revolutionized speech synthesis. Models can now interpret emotional context, speaking naturally with lifelike rhythm and genuine warmth.',
    voice: 'Fenrir',
    tone: 'serious' as const,
  },
  {
    title: 'Mindfulness',
    text: 'Take a gentle breath in through your nose, filling your chest with stillness. As you exhale, let go of any tension you might be carrying today.',
    voice: 'Zephyr',
    tone: 'calm' as const,
  },
  {
    title: 'Storytelling',
    text: 'Far beyond the misty mountains, the ancient clock tower struck midnight. The gears hummed with an iridescent golden light never before seen by mortal eyes.',
    voice: 'Puck',
    tone: 'dramatic' as const,
  },
  {
    title: 'Daily Inspiration',
    text: 'Every morning brings a new beginning, a blank canvas upon which you can paint your dreams. Embrace today with courage and an open heart.',
    voice: 'Kore',
    tone: 'cheerful' as const,
  },
  {
    title: 'Nature Documentary',
    text: 'Beneath the canopy of the rainforest, life awakens at twilight. Nocturnal creatures begin their symphony as shadows stretch across the moss-covered branches.',
    voice: 'Charon',
    tone: 'natural' as const,
  },
];

export const SAMPLE_DIALOGUES = [
  {
    title: 'Tech Podcast Discussion',
    speaker1: { name: 'Alex', voiceName: 'Fenrir' },
    speaker2: { name: 'Maya', voiceName: 'Kore' },
    script: `Alex: Welcome back to The Audio Frontier. Today we're exploring breakthroughs in real-time neural speech generation.
Maya: Thanks Alex! It's astonishing how nuanced speech has become. You can barely distinguish synthetic voices from human speech now.
Alex: Absolutely. The emotional inflections and natural pauses make a tremendous difference.`,
  },
  {
    title: 'Coffee Shop Catchup',
    speaker1: { name: 'Sam', voiceName: 'Puck' },
    speaker2: { name: 'Chloe', voiceName: 'Zephyr' },
    script: `Sam: Chloe! It feels like forever since we caught up. How was your trip to the mountains?
Chloe: Oh Sam, it was absolutely breathtaking. The pine forests and the cool morning air were so peaceful.
Sam: That sounds incredible. Next time you go, you definitely have to bring me along!`,
  },
];
