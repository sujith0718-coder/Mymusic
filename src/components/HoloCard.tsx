import { useState, useRef, useCallback } from 'react';

interface HoloCardProps {
  glare?: number;
  holo?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function HoloCard({
  glare = 0.5,
  holo = 0.3,
  className = '',
  children,
  onClick,
  style = {},
}: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setCoords({ x, y });
  }, []);

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setCoords(null);
  };

  // Rotation calculations: tilt towards cursor
  const rotateX = coords ? (0.5 - coords.y) * 26 : 0;
  const rotateY = coords ? (coords.x - 0.5) * 26 : 0;
  const glareX = coords ? coords.x * 100 : 50;
  const glareY = coords ? coords.y * 100 : 50;
  const holoAngle = coords ? 115 + coords.x * 90 : 135;

  return (
    <div
      ref={cardRef}
      className={`holo-card-root ${className}`}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: '1000px',
        ...style,
      }}
    >
      <div
        className="holo-card-inner"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: 'inherit',
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isHovered
            ? '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(255, 255, 255, 0.15)'
            : '0 12px 35px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Content Container */}
        <div
          className="holo-card-content"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          {children}
        </div>

        {/* Dynamic Holographic Rainbow Sheen */}
        {holo > 0 && (
          <div
            className="holo-card-rainbow"
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 3,
              opacity: isHovered ? holo : holo * 0.4,
              mixBlendMode: 'color-dodge',
              background: `linear-gradient(${holoAngle}deg, 
                rgba(255, 0, 128, 0.6) 0%, 
                rgba(255, 215, 0, 0.5) 25%, 
                rgba(0, 255, 180, 0.6) 50%, 
                rgba(0, 150, 255, 0.6) 75%, 
                rgba(200, 50, 255, 0.6) 100%)`,
              transition: isHovered ? 'opacity 0.2s ease' : 'opacity 0.6s ease',
            }}
          />
        )}

        {/* Dynamic Specular Glare */}
        {glare > 0 && (
          <div
            className="holo-card-glare"
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 4,
              opacity: isHovered ? glare : 0,
              mixBlendMode: 'overlay',
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 65%)`,
              transition: isHovered ? 'opacity 0.15s ease' : 'opacity 0.5s ease',
            }}
          />
        )}

        {/* Metallic Bevel Border */}
        <div
          className="holo-card-border"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      </div>
    </div>
  );
}
