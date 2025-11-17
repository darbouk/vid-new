// FIX: Add a global declaration for `webkitAudioContext` for cross-browser compatibility.
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const getAudioWaveform = async (audioUrl: string): Promise<number[]> => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const rawData = audioBuffer.getChannelData(0);
        const samples = 100; // Number of samples to generate for the waveform
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }

        // Normalize the data
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        return filteredData.map(n => n * multiplier);
    } catch (error) {
        console.error("Failed to generate waveform:", error);
        return Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.1);
    }
};