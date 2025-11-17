import React, { useState, useRef, useEffect } from 'react';
import { useAIAgent } from '../../hooks/ai-agent/useAIAgent';
import { ChatMessage } from './ChatMessage';
import { SendIcon, GenerateIcon, XIcon, MicrophoneIcon } from '../icons/Icons';
import { SUGGESTION_CHIPS } from '../../data/ai-agent/constants';

// Augment the Window interface for vendor-prefixed SpeechRecognition API
declare global {
    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        grammars: any; // Simplified for this use case
        interimResults: boolean;
        lang: string;
        maxAlternatives: number;
        onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
        onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
        serviceURI: string;
        abort(): void;
        start(): void;
        stop(): void;
    }

    interface SpeechRecognitionStatic {
        new (): SpeechRecognition;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        error: string;
        message: string;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionAlternative {
        readonly confidence: number;
        readonly transcript: string;
    }

    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


interface AIAgentPanelProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    isGenerating: boolean;
    onGenerate: () => void;
    onCancel: () => void;
}

// Check for SpeechRecognition API
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognitionAPI ? new SpeechRecognitionAPI() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
}

export const AIAgentPanel: React.FC<AIAgentPanelProps> = ({ prompt, setPrompt, isGenerating, onGenerate, onCancel }) => {
    const { messages, isLoading, sendMessage } = useAIAgent();
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        }

    }, []);

    const handleListen = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setIsListening(true);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleChipClick = (chipText: string) => {
        sendMessage(chipText);
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">AI Agent</h2>
                <p className="text-sm text-gray-500">Your creative partner for video editing.</p>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <ChatMessage key={msg.id + '-' + index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                    {SUGGESTION_CHIPS.map((chip) => (
                        <button 
                            key={chip}
                            onClick={() => handleChipClick(chip)}
                            disabled={isLoading}
                            className="px-3 py-1.5 text-sm rounded-lg whitespace-nowrap bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {chip}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isListening ? "Listening..." : "Ask the AI agent..."}
                        disabled={isLoading}
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 disabled:opacity-50"
                        aria-label="Chat input"
                    />
                    {recognition && (
                        <button
                            type="button"
                            onClick={handleListen}
                            disabled={isLoading}
                            className={`p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors ${isListening ? 'text-red-500 bg-red-100' : 'text-gray-600'}`}
                            aria-label={isListening ? "Stop listening" : "Start listening"}
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
                        aria-label="Send message"
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>

                 {/* --- Video Generation Section --- */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Generate Video</h3>
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-500">Prompt</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Use the AI Agent to craft the perfect prompt, then generate your video here."
                            className="w-full h-24 p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                            disabled={isGenerating}
                        />
                    </div>
                    <div className="mt-4">
                        {isGenerating ? (
                            <button
                                onClick={onCancel}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors"
                            >
                                <XIcon className="w-5 h-5" />
                                <span>Cancel</span>
                            </button>
                        ) : (
                            <button 
                                onClick={onGenerate}
                                disabled={!prompt.trim()}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                <GenerateIcon />
                                <span>Generate Video</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
