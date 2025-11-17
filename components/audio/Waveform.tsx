import React, { useRef, useEffect } from 'react';

interface WaveformProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  data,
  width = 300,
  height = 40,
  color = 'rgba(255, 255, 255, 0.7)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    
    const sliceWidth = width / data.length;
    let x = 0;
    
    for (let i = 0; i < data.length; i++) {
        const v = data[i] || 0;
        const y = (1 - v) * height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y + v * height / 2);
        } else {
            ctx.lineTo(x, y + v * height / 2);
        }
        x += sliceWidth;
    }
    
    ctx.stroke();

  }, [data, width, height, color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};