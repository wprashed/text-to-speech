import React, { useState } from 'react';
import { Voice } from '../types';
import { Play, Loader2, Check } from 'lucide-react';

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onPreviewVoice?: (voice: Voice) => Promise<void>;
  previewingVoiceId?: string | null;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Select Prebuilt Voice
        </label>
        <span className="text-xs text-neutral-500">
          5 Gemini 3.1 Voices available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPreviewing = previewingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              id={`voice-card-${voice.id.toLowerCase()}`}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-500/80 shadow-sm ring-1 ring-amber-500/50'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                      {voice.name}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        voice.gender === 'Female'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {voice.gender}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">
                  {voice.accent}
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                  {voice.description}
                </p>
              </div>

              {onPreviewVoice && (
                <button
                  id={`preview-voice-btn-${voice.id.toLowerCase()}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewVoice(voice);
                  }}
                  disabled={isPreviewing}
                  className="flex items-center justify-center gap-1 w-full py-1 px-2 text-xs rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors font-medium"
                >
                  {isPreviewing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                      <span>Speaking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current opacity-75" />
                      <span>Sample</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
