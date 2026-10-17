import { useState, useRef, useCallback, useEffect } from 'react';

interface ElasticSliderProps {
  min?: number;
  max?: number;
  value?: number;
  onChange?: (val: number) => void;
  accentColor?: string;
  secondaryColor?: string;
  className?: string;
  formatTooltip?: (seconds: number) => string;
}

function defaultFormatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ElasticSlider({
  min = 0,
  max = 100,
  value = 0,
  onChange,
  accentColor = '#a855f7',
  secondaryColor = '#6366f1',
  className = '',
  formatTooltip = defaultFormatTime,
}: ElasticSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value when not dragging
  useEffect(() => {
    if (!isDragging) {
      setInternalValue(value);
    }
  }, [value, isDragging]);

  const safeMax = max > min ? max : min + 1;
  const progressPct = Math.max(0, Math.min(100, ((internalValue - min) / (safeMax - min)) * 100));

  const calculateValueFromPointer = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return min + fraction * (safeMax - min);
    },
    [min, safeMax]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newVal = calculateValueFromPointer(e.clientX);
    setInternalValue(newVal);
    onChange?.(newVal);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (track) {
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      setHoverX(x);
      const val = min + (x / rect.width) * (safeMax - min);
      setHoverVal(val);
    }

    if (isDragging) {
      const newVal = calculateValueFromPointer(e.clientX);
      setInternalValue(newVal);
      onChange?.(newVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if not captured
      }
      setIsDragging(false);
      const finalVal = calculateValueFromPointer(e.clientX);
      setInternalValue(finalVal);
      onChange?.(finalVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowRight') delta = 5;
    else if (e.key === 'ArrowLeft') delta = -5;
    else if (e.key === 'PageUp') delta = 15;
    else if (e.key === 'PageDown') delta = -15;

    if (delta !== 0) {
      e.preventDefault();
      const updated = Math.max(min, Math.min(safeMax, internalValue + delta));
      setInternalValue(updated);
      onChange?.(updated);
    }
  };

  const isExpanded = isHovered || isDragging;

  return (
    <div
      className={`elastic-slider-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        padding: '10px 0',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setHoverVal(null);
      }}
    >
      {/* Elastic Floating Tooltip Bubble */}
      {isExpanded && hoverVal !== null && (
        <div
          className="elastic-slider-tooltip"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-28px',
            left: `${hoverX}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(15, 15, 25, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            transition: 'top 0.15s ease',
          }}
        >
          {formatTooltip(hoverVal)}
        </div>
      )}

      {/* Main Slider Track */}
      <div
        ref={trackRef}
        className="elastic-slider-track"
        role="slider"
        aria-valuemin={Math.round(min)}
        aria-valuemax={Math.round(safeMax)}
        aria-valuenow={Math.round(internalValue)}
        aria-label="Playback timeline"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        style={{
          position: 'relative',
          width: '100%',
          height: isExpanded ? '8px' : '5px',
          background: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          transition: 'height 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
      >
        {/* Glow & Progress Fill */}
        <div
          className="elastic-slider-fill"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${secondaryColor})`,
            borderRadius: 'inherit',
            boxShadow: isExpanded ? `0 0 16px ${accentColor}` : 'none',
            transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
          }}
        />

        {/* Magnetic Elastic Thumb */}
        <div
          className="elastic-slider-thumb"
          style={{
            position: 'absolute',
            left: `${progressPct}%`,
            top: '50%',
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.3 : isHovered ? 1.15 : 1})`,
            width: isExpanded ? '16px' : '12px',
            height: isExpanded ? '16px' : '12px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.6), 0 0 ${isExpanded ? '14px' : '6px'} ${accentColor}`,
            transition: isDragging
              ? 'transform 0.08s ease, width 0.18s ease, height 0.18s ease'
              : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), width 0.18s ease, height 0.18s ease',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
