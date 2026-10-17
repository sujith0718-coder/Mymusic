import { useEffect, useRef } from 'react';

interface LineWavesProps {
  className?: string;
  isPlaying?: boolean;
  accentColor?: string;
  secondaryColor?: string;
  waveCount?: number;
}

export function LineWaves({
  className = '',
  isPlaying = true,
  accentColor = 'rgba(147, 51, 234, 0.45)',
  secondaryColor = 'rgba(59, 130, 246, 0.35)',
  waveCount = 5,
}: LineWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 800;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 600;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    // Floating particles
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Increment wave phase faster when playing, gentle drift when paused
      phaseRef.current += isPlaying ? 0.022 : 0.006;
      const phase = phaseRef.current;

      // Draw subtle background radial glow
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.6,
        10,
        width * 0.5,
        height * 0.6,
        width * 0.65
      );
      grad.addColorStop(0, accentColor.replace(/[\d.]+\)$/, '0.12)'));
      grad.addColorStop(0.5, secondaryColor.replace(/[\d.]+\)$/, '0.06)'));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating luminous particles
      for (const p of particles) {
        p.x += p.speedX * (isPlaying ? 1.5 : 0.6);
        p.y += p.speedY * (isPlaying ? 1.5 : 0.6);
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.4})`;
        ctx.fill();
      }

      // Draw multi-layered flowing harmonic wave lines
      for (let i = 0; i < waveCount; i++) {
        const progress = i / (waveCount - 1 || 1);
        const yBase = height * 0.45 + (progress - 0.5) * (height * 0.35);
        const amplitude = (height * 0.08 + i * 8) * (isPlaying ? 1.0 : 0.4);
        const freq1 = 0.0022 + i * 0.0006;
        const freq2 = 0.004 + i * 0.0008;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y =
            yBase +
            Math.sin(x * freq1 + phase + i * 0.8) * amplitude * 0.65 +
            Math.cos(x * freq2 - phase * 0.7 + i) * amplitude * 0.35;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineWidth = 1.8 + (1 - progress) * 1.5;
        const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
        strokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
        strokeGrad.addColorStop(0.25, secondaryColor);
        strokeGrad.addColorStop(0.65, accentColor);
        strokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

        ctx.strokeStyle = strokeGrad;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = isPlaying ? 16 : 6;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [isPlaying, accentColor, secondaryColor, waveCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`line-waves-canvas ${className}`}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
