import { useState, useRef, useCallback, Dispatch } from 'react';
import { Action } from '../app/store/EditorProvider';
import { addAudioClipAndAsset } from '../app/actions/timelineActions';

export const useAudioRecorder = (dispatch: Dispatch<Action>) => {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async (startTime: number) => {
        if (isRecording) return;
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);
            setIsRecording(true);
            dispatch({ type: 'START_RECORDING' });

            const recorder = new MediaRecorder(audioStream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                addAudioClipAndAsset(dispatch, new File([audioBlob], `Recording-${new Date().toISOString()}.webm`), startTime);
                
                audioStream.getTracks().forEach(track => track.stop());
                setStream(null);
                setIsRecording(false);
                dispatch({ type: 'STOP_RECORDING' });
            };

            recorder.start();
        } catch (err) {
            console.error("Error starting recording:", err);
            setIsRecording(false);
            dispatch({ type: 'STOP_RECORDING' });
        }
    }, [dispatch, isRecording]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    return { isRecording, stream, startRecording, stopRecording };
};
