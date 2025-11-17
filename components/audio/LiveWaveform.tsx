import React, { useRef, useEffect } from 'react';

interface LiveWaveformProps {
    stream: MediaStream;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({ stream }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        if (!stream || !stream.active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        source.connect(analyser);
        
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(243 244 246)'; // gray-100
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(239 68 68)'; // red-500
            canvasCtx.beginPath();
            
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };

        draw();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        };
    }, [stream]);

    return <canvas ref={canvasRef} className="w-full h-16 bg-gray-100 rounded-lg"></canvas>;
};
