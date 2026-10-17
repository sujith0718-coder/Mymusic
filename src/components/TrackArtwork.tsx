import { useState } from 'react';
import type { Recording } from '../data/recordings';

interface TrackArtworkProps {
  recording: Recording;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'featured';
  isPlaying?: boolean;
  className?: string;
}

export function TrackArtwork({
  recording,
  size = 'md',
  isPlaying = false,
  className = '',
}: TrackArtworkProps) {
  const [imgError, setImgError] = useState(false);
  // Deterministic seed based on track id for unique geometric ripples
  const trackNum = parseInt(recording.id.replace(/\D/g, ''), 10) || 1;
  const waveCount = 3 + (trackNum % 4);

  return (
    <div
      className={`track-artwork track-artwork--${size} ${isPlaying ? 'track-artwork--playing' : ''} ${className}`}
      style={{
        '--art-accent': recording.accentColor,
        '--art-secondary': recording.secondaryColor,
      } as React.CSSProperties}
    >
      {/* Background Gradient Mesh Fallback */}
      <div
        className="track-artwork__mesh"
        style={{
          background: `radial-gradient(circle at 25% 25%, ${recording.accentColor} 0%, transparent 60%), radial-gradient(circle at 75% 85%, ${recording.secondaryColor} 0%, transparent 65%), #0c0c16`,
        }}
      />

      {/* Real Hand-Painted Anime Artwork */}
      {recording.artwork && !imgError ? (
        <img
          src={recording.artwork}
          alt={`${recording.title} - Male Singer Cover Artwork`}
          className="track-artwork__img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Procedural Acoustic Lines & Geometry */
        <svg
          className="track-artwork__svg"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`grad-${recording.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Concentric sound ripple rings */}
          {Array.from({ length: waveCount }).map((_, i) => (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={20 + i * 14}
              stroke={`url(#grad-${recording.id})`}
              strokeWidth="1.2"
              strokeDasharray={i % 2 === 0 ? '4 3' : undefined}
              opacity={0.35 + i * 0.15}
            />
          ))}

          {/* Center acoustic waveform emblem */}
          <g transform="translate(60, 60)">
            <path
              d="M -16 0 C -12 -12 -6 -16 0 -16 C 6 -16 12 -12 16 0 C 12 12 6 16 0 16 C -6 16 -12 12 -16 0 Z"
              fill={recording.accentColor}
              fillOpacity="0.3"
            />
            <circle cx="0" cy="0" r="8" fill="#ffffff" fillOpacity="0.85" />
            <circle cx="0" cy="0" r="3" fill="#0c0c16" />
          </g>
        </svg>
      )}

      {/* Glass border & shine */}
      <div className="track-artwork__glass-shine" />

      {/* Playing pulse wave */}
      {isPlaying && <div className="track-artwork__playing-glow" />}
    </div>
  );
}

