import { motion } from 'motion/react';
import type { Recording } from '../data/recordings';

interface AnimatedListProps {
  items: Recording[];
  currentTrackId?: string | null;
  isPlaying?: boolean;
  onItemSelect?: (track: Recording) => void;
  theme?: 'dark' | 'light';
  className?: string;
}

export function AnimatedList({
  items,
  currentTrackId,
  isPlaying = false,
  onItemSelect,
  theme = 'dark',
  className = '',
}: AnimatedListProps) {
  return (
    <div
      className={`animated-list-container ${theme === 'dark' ? 'animated-list--dark' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '100%',
        overflowY: 'auto',
        paddingRight: '6px',
      }}
    >
      {items.map((track, idx) => {
        const isCurrent = currentTrackId === track.id;
        const isTrackActive = isCurrent && isPlaying;

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: Math.min(idx * 0.035, 0.35) }}
            whileHover={{ scale: 1.015, x: 4 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onItemSelect?.(track)}
            className={`animated-list-item ${isCurrent ? 'animated-list-item--active' : ''}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onItemSelect?.(track);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '12px',
              background: isCurrent
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.025)',
              border: isCurrent
                ? `1px solid ${track.accentColor || 'rgba(168, 85, 247, 0.6)'}`
                : '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: isCurrent
                ? `0 4px 20px ${track.accentColor ? track.accentColor.replace(/hsl\(([^)]+)\)/, 'hsla($1, 0.25)') : 'rgba(168, 85, 247, 0.25)'}`
                : 'none',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left: Track Index or Equalizer */}
            <div
              style={{
                width: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isTrackActive ? (
                <div
                  className="animated-list-eq"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '2px',
                    height: '14px',
                  }}
                  aria-label="Playing"
                >
                  <span
                    className="eq-bar eq-bar--1"
                    style={{ background: track.accentColor || '#a855f7' }}
                  />
                  <span
                    className="eq-bar eq-bar--2"
                    style={{ background: track.accentColor || '#a855f7' }}
                  />
                  <span
                    className="eq-bar eq-bar--3"
                    style={{ background: track.accentColor || '#a855f7' }}
                  />
                </div>
              ) : (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isCurrent ? track.accentColor : 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Thumbnail Artwork */}
            <div
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#0c0c16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {track.artwork ? (
                <img
                  src={track.artwork}
                  alt={track.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${track.accentColor}, ${track.secondaryColor})`,
                  }}
                />
              )}
            </div>

            {/* Title & Mood Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.92)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: '-0.01em',
                }}
              >
                {track.title}
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  color: 'rgba(255, 255, 255, 0.45)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {track.mood} • {track.collection}
              </span>
            </div>

            {/* Duration */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: isCurrent ? track.accentColor : 'rgba(255, 255, 255, 0.35)',
                flexShrink: 0,
              }}
            >
              {track.durationApprox || '0:35'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
