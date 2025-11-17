import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import type { ChatMessage } from '../../lib/ai-agent/types';
import { AI_AGENT_SYSTEM_INSTRUCTION, INITIAL_AI_MESSAGE } from '../../data/ai-agent/constants';

export const useAIAgent = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AI_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: AI_AGENT_SYSTEM_INSTRUCTION,
                },
            });
        } catch (e) {
            console.error("Failed to initialize AI Agent:", e);
            setMessages(prev => [...prev, {id: 'error-init', role: 'system', text: 'Error: Could not initialize the AI Agent. Please check your API key and network connection.'}]);
        }
    }, []);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Remove loading indicator from previous turn if it exists
        setMessages(prev => prev.filter(m => m.id !== 'loading'));
        
        const loadingIndicatorMessage: ChatMessage = {
            id: 'loading',
            role: 'model',
            text: '',
            isLoading: true,
        };
        setMessages(prev => [...prev, loadingIndicatorMessage]);

        try {
            const result = await chatRef.current.sendMessageStream({ message: text });
            
            let accumulatedText = '';
            setMessages(prev => prev.filter(m => m.id !== 'loading'));

            const modelMessageId = Date.now().toString() + '-model';
            let modelMessage: ChatMessage = {
                id: modelMessageId,
                role: 'model',
                text: '',
            };
            setMessages(prev => [...prev, modelMessage]);

            for await (const chunk of result) {
                const c = chunk as GenerateContentResponse;
                const chunkText = c.text;
                if(chunkText) {
                    accumulatedText += chunkText;
                    setMessages(prev => prev.map(m => 
                        m.id === modelMessageId ? { ...m, text: accumulatedText } : m
                    ));
                }
            }
        } catch (e: any) {
            console.error("AI Agent error:", e);

            let errorText = 'An unexpected error occurred. Please try again.';
            if (e.message?.includes("API key") || e.message?.includes("PERMISSION_DENIED")) {
                errorText = 'There seems to be an issue with your API Key. Please ensure it is configured correctly and has the necessary permissions.';
            } else if (e instanceof TypeError && e.message.includes('fetch')) {
                errorText = 'Network error. Please check your internet connection and try again.';
            } else if (e.message) {
                errorText = `An error occurred: ${e.message}`;
            }

            const errorMessage: ChatMessage = {
                id: 'error-' + Date.now(),
                role: 'system',
                text: errorText,
            };
            setMessages(prev => prev.filter(m => m.isLoading !== true).concat(errorMessage));
        } finally {
            setIsLoading(false);
            setMessages(prev => prev.filter(m => m.isLoading !== true));
        }
    };
    
    return { messages, isLoading, sendMessage };
};