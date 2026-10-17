import { motion } from 'motion/react';
import type { PlayerState, PlayerControls } from '../hooks/useAudioPlayer';
import type { Recording } from '../data/recordings';
import { AnimatedList } from './AnimatedList';
import { HoloCard } from './HoloCard';
import { ElasticSlider } from './ElasticSlider';
import { LineWaves } from './LineWaves';

interface NowPlayingExperienceProps {
  state: PlayerState;
  controls: PlayerControls;
  recordings: Recording[];
  onClose?: () => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NowPlayingExperience({
  state,
  controls,
  recordings,
  onClose,
}: NowPlayingExperienceProps) {
  const { currentTrack, isPlaying, currentTime, duration, shuffle, repeat, volume, isMuted } =
    state;

  // Active track fallback to first track if none active
  const activeTrack = currentTrack || recordings[0];
  const accentColor = activeTrack?.accentColor || '#a855f7';
  const secondaryColor = activeTrack?.secondaryColor || '#3b82f6';

  const safeDuration = duration > 0 ? duration : 35;

  return (
    <div className="relative min-h-screen text-white bg-neutral-950 overflow-hidden now-playing-view">
      {/* Dynamic Visualizer Background */}
      <LineWaves
        className="absolute inset-0 z-0 opacity-40"
        isPlaying={isPlaying}
        accentColor={accentColor}
        secondaryColor={secondaryColor}
      />

      {/* Top Header Bar with Close/Back and Badge */}
      <div className="relative z-20 flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="now-playing-back-btn flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              title="Return to browsing"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Studio Experience
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Lossless Vocal Archive</span>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-12 gap-6 p-4 sm:p-6 min-h-[calc(100vh-68px)] lg:h-[calc(100vh-68px)] lg:max-h-[920px]">
        {/* Sidebar / Queue List */}
        <div className="col-span-12 lg:col-span-4 bg-neutral-900/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col h-auto max-h-[380px] lg:max-h-none lg:h-full shadow-2xl overflow-hidden order-2 lg:order-1">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Up Next</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {recordings.length} acoustic vocal recordings in queue
              </p>
            </div>
            <button
              onClick={controls.toggleShuffle}
              className={`p-2 rounded-lg text-xs font-medium transition-colors border ${
                shuffle
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'text-neutral-400 border-white/10 hover:text-white'
              }`}
              title={shuffle ? 'Shuffle is active' : 'Shuffle queue'}
            >
              Shuffle
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <AnimatedList
              items={recordings}
              currentTrackId={activeTrack?.id}
              isPlaying={isPlaying}
              onItemSelect={(track) => controls.play(track)}
              theme="dark"
            />
          </div>
        </div>

        {/* Main Focus: Now Playing Cover & Details */}
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-center items-center py-2 lg:h-full text-center px-2 sm:px-4 order-1 lg:order-2">
          {/* Holographic Album Cover with male anime singer artwork */}
          <HoloCard
            glare={0.5}
            holo={0.3}
            className="now-playing-artwork-card w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mb-5 sm:mb-6 rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
            onClick={controls.togglePlay}
          >
            {activeTrack?.artwork ? (
              <img
                src={activeTrack.artwork}
                alt={`${activeTrack.title} - Male Singer Cover`}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
                }}
              >
                <span className="text-5xl font-bold">{activeTrack?.title[0]}</span>
              </div>
            )}
          </HoloCard>

          {/* Track Titles & Artist Information */}
          <div className="max-w-xl mb-4">
            <motion.h1
              key={activeTrack?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5"
            >
              {activeTrack?.title}
            </motion.h1>
            <p className="text-sm sm:text-base text-neutral-400 flex items-center justify-center gap-2">
              <span>{activeTrack?.mood}</span>
              <span className="text-neutral-600">•</span>
              <span>{activeTrack?.collection}</span>
            </p>
          </div>

          {/* Timeline Track Slider with Elastic Spring */}
          <div className="w-full max-w-lg mt-2 mb-4 px-2">
            <ElasticSlider
              min={0}
              max={safeDuration}
              value={currentTime}
              onChange={(val) => controls.seek(val)}
              accentColor={accentColor}
              secondaryColor={secondaryColor}
            />

            <div className="flex justify-between text-xs font-medium text-neutral-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(safeDuration)}</span>
            </div>
          </div>

          {/* Primary Playback Controls Bar */}
          <div className="flex items-center gap-4 sm:gap-6 mt-1">
            {/* Shuffle */}
            <button
              onClick={controls.toggleShuffle}
              className={`p-2.5 rounded-full transition-colors ${
                shuffle ? 'text-purple-400 bg-purple-500/10' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle (S)"
              aria-label="Shuffle"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            {/* Previous Track */}
            <button
              onClick={controls.prevTrack}
              className="p-3 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
              title="Previous Track (Alt + Left)"
              aria-label="Previous"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            </button>

            {/* Big Play/Pause Toggle */}
            <motion.button
              onClick={controls.togglePlay}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-shadow"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
                boxShadow: `0 8px 30px ${accentColor}66`,
              }}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '3px' }}>
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              )}
            </motion.button>

            {/* Next Track */}
            <button
              onClick={controls.nextTrack}
              className="p-3 text-neutral-300 hover:text-white hover:scale-110 active:scale-95 transition-transform"
              title="Next Track (Alt + Right)"
              aria-label="Next"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            </button>

            {/* Repeat Mode */}
            <button
              onClick={controls.toggleRepeat}
              className={`p-2.5 rounded-full transition-colors relative ${
                repeat !== 'off'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={`Repeat: ${repeat}`}
              aria-label={`Repeat: ${repeat}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {repeat === 'one' && (
                <span className="absolute -top-1 -right-1 text-[9px] font-bold w-3.5 h-3.5 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 mt-4 text-neutral-400 max-w-xs w-full justify-center">
            <button
              onClick={controls.toggleMute}
              className="hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0a7 7 0 0 1-.11 1.23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
              className="w-28 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export default alias as MusicPlayerApp for direct matching with user request
export default NowPlayingExperience;
