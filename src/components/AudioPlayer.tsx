import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Sparkles } from 'lucide-react';
import { SpeechItem } from '../types';

interface AudioPlayerProps {
  speech: SpeechItem;
  onPlayNext?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ speech }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(speech.duration || 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Number of visual bars in the waveform
  const BAR_COUNT = 48;
  // Seeded bar heights to create a natural speech waveform shape
  const waveformHeights = useRef<number[]>(
    Array.from({ length: BAR_COUNT }, (_, i) => {
      const normalized = i / BAR_COUNT;
      const bellCurve = Math.sin(normalized * Math.PI);
      const noise = ((i * 37) % 23) / 23;
      return Math.max(15, Math.min(95, Math.round((bellCurve * 0.7 + noise * 0.3) * 100)));
    })
  ).current;

  // When speech prop changes, reset and autoplay
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
      setCurrentTime(0);
      setIsPlaying(false);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [speech.id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration || duration <= 0) {
        setDuration(audioRef.current.duration || speech.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleWaveformClick = (index: number) => {
    if (audioRef.current && duration > 0) {
      const targetTime = (index / BAR_COUNT) * duration;
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
      audioRef.current.volume = volume || 1;
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      id="active-audio-player"
      className="bg-neutral-900 text-neutral-100 rounded-2xl p-6 shadow-xl border border-neutral-800 transition-all"
    >
      <audio
        ref={audioRef}
        src={speech.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-100 tracking-tight text-base">
                {speech.mode === 'dialogue' ? 'Dual Speaker Dialogue' : `Voice: ${speech.voiceName}`}
              </span>
              {speech.toneStyle && speech.toneStyle !== 'natural' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium capitalize">
                  {speech.toneStyle}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Gemini 3.1 Flash TTS • 24 kHz Hi-Fi Audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="player-speed-button"
            type="button"
            onClick={cycleSpeed}
            className="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors font-mono"
            title="Change Playback Speed"
          >
            {playbackRate}x
          </button>
          <a
            id="player-download-button"
            href={speech.audioUrl}
            download={`gemini-tts-${speech.voiceName.toLowerCase()}-${Date.now()}.wav`}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
            title="Download WAV audio"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download WAV</span>
          </a>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="mb-4">
        <div
          id="waveform-container"
          className="h-20 bg-neutral-950/70 rounded-xl p-3 flex items-end justify-between gap-1 cursor-pointer select-none overflow-hidden"
          title="Click anywhere to scrub"
        >
          {waveformHeights.map((baseHeight, idx) => {
            const barFraction = idx / BAR_COUNT;
            const isPassed = barFraction <= progressPercent / 100;
            // Add subtle dynamic animation while playing
            const dynamicScale = isPlaying
              ? Math.sin((currentTime * 8) + idx * 0.4) * 15
              : 0;
            const currentBarHeight = Math.max(12, Math.min(100, baseHeight + dynamicScale));

            return (
              <div
                key={idx}
                onClick={() => handleWaveformClick(idx)}
                className={`w-full rounded-sm transition-all duration-75 ${
                  isPassed
                    ? 'bg-amber-400'
                    : 'bg-neutral-700 hover:bg-neutral-500'
                }`}
                style={{ height: `${currentBarHeight}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Range Slider */}
      <div className="space-y-1 mb-4">
        <input
          id="player-timeline-slider"
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Play / Restart Controls */}
        <div className="flex items-center gap-3">
          <button
            id="player-play-pause-button"
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 flex items-center justify-center transition-all shadow-md"
            aria-label={isPlaying ? 'Pause speech' : 'Play speech'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
          <button
            id="player-restart-button"
            type="button"
            onClick={handleRestart}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
            title="Replay from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Text Excerpt */}
        <div className="hidden sm:block max-w-sm truncate text-xs text-neutral-400 italic px-2">
          "{speech.text}"
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            id="player-mute-button"
            type="button"
            onClick={toggleMute}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            id="player-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-200"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};
