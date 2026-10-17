import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { PlayerState, PlayerControls } from '../hooks/useAudioPlayer';
import { TrackArtwork } from './TrackArtwork';

interface AudioPlayerProps {
  state: PlayerState;
  controls: PlayerControls;
  onExpand?: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ state, controls, onExpand }: AudioPlayerProps) {
  const shouldReduce = useReducedMotion();
  const progressRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    shuffle,
    repeat,
  } = state;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const accentColor = currentTrack?.accentColor || 'hsl(265, 80%, 65%)';

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar || !duration) return;
      const rect = bar.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      controls.seek(fraction * duration);
    },
    [duration, controls]
  );

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(fraction * duration);
    setHoverX(x);
  };

  const handleProgressMouseLeave = () => {
    setHoverTime(null);
  };

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          className="spotify-player"
          initial={shouldReduce ? {} : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="region"
          aria-label="Music playback bar"
        >
          {/* Top Thin Scrub Bar on Mobile */}
          <div
            className="player-mobile-progress"
            ref={progressRef}
            onClick={handleProgressClick}
            aria-hidden="true"
          >
            <div
              className="player-mobile-progress__fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${accentColor}, ${currentTrack.secondaryColor})`,
              }}
            />
          </div>

          <div className="spotify-player__inner">
            {/* LEFT SECTION: Track Info & Artwork */}
            <div
              className="spotify-player__left"
              onClick={onExpand}
              style={{ cursor: onExpand ? 'pointer' : 'default' }}
              title={onExpand ? 'Open Studio Experience (HoloCard & Visualizer)' : undefined}
            >
              <TrackArtwork recording={currentTrack} size="sm" isPlaying={isPlaying} />
              <div className="spotify-player__track-details">
                <span className="spotify-player__track-title" title={currentTrack.title}>
                  {currentTrack.title}
                </span>
                <span className="spotify-player__track-desc" title={currentTrack.description}>
                  {currentTrack.mood} • {currentTrack.collection}
                </span>
              </div>
            </div>

            {/* CENTRE SECTION: Controls & Timeline */}
            <div className="spotify-player__center">
              <div className="spotify-player__controls">
                {/* Genuine Shuffle */}
                <button
                  className={`player-btn player-btn--subtle ${shuffle ? 'player-btn--active' : ''}`}
                  onClick={controls.toggleShuffle}
                  title={shuffle ? 'Shuffle enabled' : 'Enable shuffle'}
                  aria-label="Shuffle"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 3 21 3 21 8" />
                    <line x1="4" y1="20" x2="21" y2="3" />
                    <polyline points="21 16 21 21 16 21" />
                    <line x1="15" y1="15" x2="21" y2="21" />
                    <line x1="4" y1="4" x2="9" y2="9" />
                  </svg>
                  {shuffle && <span className="player-btn__dot" style={{ background: accentColor }} />}
                </button>

                {/* Previous */}
                <button
                  className="player-btn"
                  onClick={controls.prevTrack}
                  title="Previous recording (Alt + ←)"
                  aria-label="Previous recording"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </button>

                {/* Big Play/Pause */}
                <motion.button
                  className="player-btn player-btn--play"
                  onClick={controls.togglePlay}
                  whileHover={shouldReduce ? {} : { scale: 1.08 }}
                  whileTap={shouldReduce ? {} : { scale: 0.94 }}
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${currentTrack.secondaryColor})`,
                  }}
                >
                  {isLoading ? (
                    <div className="player-spinner" />
                  ) : isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  )}
                </motion.button>

                {/* Next */}
                <button
                  className="player-btn"
                  onClick={controls.nextTrack}
                  title="Next recording (Alt + →)"
                  aria-label="Next recording"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
                  </svg>
                </button>

                {/* Genuine Repeat */}
                <button
                  className={`player-btn player-btn--subtle ${repeat !== 'off' ? 'player-btn--active' : ''}`}
                  onClick={controls.toggleRepeat}
                  title={`Repeat: ${repeat}`}
                  aria-label={`Repeat mode: ${repeat}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  {repeat === 'one' && <span className="player-btn__badge">1</span>}
                  {repeat === 'all' && <span className="player-btn__dot" style={{ background: accentColor }} />}
                </button>
              </div>

              {/* Progress Bar & Timestamps */}
              <div className="spotify-player__timeline">
                <span className="spotify-player__time">{formatTime(currentTime)}</span>

                <div
                  className="player-scrubber"
                  ref={progressRef}
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressMouseMove}
                  onMouseLeave={handleProgressMouseLeave}
                  role="slider"
                  aria-valuenow={Math.round(currentTime)}
                  aria-valuemin={0}
                  aria-valuemax={Math.round(duration)}
                  aria-label="Scrubber"
                  tabIndex={0}
                >
                  <div className="player-scrubber__track">
                    <div
                      className="player-scrubber__fill"
                      style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${accentColor}, ${currentTrack.secondaryColor})`,
                      }}
                    />
                    <div
                      className="player-scrubber__thumb"
                      style={{
                        left: `${progress}%`,
                        background: '#ffffff',
                      }}
                    />
                  </div>

                  {hoverTime !== null && (
                    <div
                      className="player-scrubber__tooltip"
                      style={{ left: `${hoverX}px` }}
                    >
                      {formatTime(hoverTime)}
                    </div>
                  )}
                </div>

                <span className="spotify-player__time">
                  {duration > 0 ? formatTime(duration) : currentTrack.durationApprox || '0:35'}
                </span>
              </div>
            </div>

            {/* RIGHT SECTION: Real Volume Control */}
            <div className="spotify-player__right">
              <div className="spotify-player__volume">
                <button
                  className="player-btn player-btn--subtle"
                  onClick={controls.toggleMute}
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {isMuted || volume === 0 ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </>
                    ) : volume < 0.5 ? (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </>
                    ) : (
                      <>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </>
                    )}
                  </svg>
                </button>

                <input
                  type="range"
                  className="player-volume-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => controls.setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  style={{
                    background: `linear-gradient(to right, ${accentColor} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>

              {onExpand && (
                <button
                  className="player-btn player-btn--subtle"
                  onClick={onExpand}
                  title="Open Studio Experience (Fullscreen HoloCard & Visualizer)"
                  aria-label="Open Studio Experience"
                  style={{ marginLeft: '4px' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Error notice if playback failed */}
          {error && (
            <div className="spotify-player__error" role="alert">
              <span>{error}</span>
              <button onClick={() => controls.setError(null)} aria-label="Dismiss error">✕</button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
