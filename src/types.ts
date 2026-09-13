export interface Voice {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  accent: string;
  description: string;
  previewText: string;
}

export type ToneStyleId = 'natural' | 'cheerful' | 'calm' | 'serious' | 'whisper' | 'dramatic' | 'curious';

export interface ToneStyle {
  id: ToneStyleId;
  label: string;
  description: string;
}

export interface DialogueSpeakerConfig {
  name: string;
  voiceName: string;
}

export interface SpeechItem {
  id: string;
  text: string;
  voiceName: string;
  toneStyle?: ToneStyleId;
  audioBase64: string;
  audioUrl: string;
  duration: number;
  createdAt: number;
  mode: 'single' | 'dialogue';
  dialogueSpeakers?: DialogueSpeakerConfig[];
}
