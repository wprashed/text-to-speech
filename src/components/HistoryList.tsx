import React from 'react';
import { SpeechItem } from '../types';
import { Play, Download, Trash2, Clock, Volume2 } from 'lucide-react';

interface HistoryListProps {
  items: SpeechItem[];
  activeSpeechId?: string;
  onSelectSpeech: (item: SpeechItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  activeSpeechId,
  onSelectSpeech,
  onClearHistory,
  onDeleteItem,
}) => {
  if (items.length === 0) {
    return null;
  }

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="speech-history-section" className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-500" />
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Recent Speech Generations ({items.length})
          </h3>
        </div>
        <button
          id="clear-history-button"
          type="button"
          onClick={onClearHistory}
          className="text-xs text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isActive = item.id === activeSpeechId;

          return (
            <div
              key={item.id}
              id={`history-item-${item.id}`}
              onClick={() => onSelectSpeech(item)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-amber-500" />
                      {item.mode === 'dialogue' ? 'Dialogue' : item.voiceName}
                    </span>
                    {item.toneStyle && item.toneStyle !== 'natural' && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 capitalize font-medium">
                        {item.toneStyle}
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {item.duration.toFixed(1)}s
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono">
                    {formatTimestamp(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  "{item.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/60 mt-1">
                <button
                  type="button"
                  id={`play-history-${item.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSpeech(item);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isActive ? 'Playing' : 'Load & Play'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    id={`download-history-${item.id}`}
                    href={item.audioUrl}
                    download={`speech-${item.voiceName.toLowerCase()}-${item.id}.wav`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title="Download audio WAV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    id={`delete-history-${item.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-500"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
