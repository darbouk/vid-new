import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import type { ChatMessage as ChatMessageType } from '../../lib/ai-agent/types';
import { AIAgentIcon } from '../icons/Icons';

const LoadingDots: React.FC = () => (
    <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);


export const ChatMessage: React.FC<{ message: ChatMessageType }> = ({ message }) => {
    const { role, text, isLoading } = message;
    
    if (role === 'system') {
        return (
            <div className="text-center text-xs text-red-500 py-2">
                {text}
            </div>
        );
    }

    const isModel = role === 'model';
    
    const createMarkup = () => {
        if (isModel && text) {
            const rawMarkup = marked.parse(text, { breaks: true, gfm: true }) as string;
            const sanitizedMarkup = DOMPurify.sanitize(rawMarkup);
            return { __html: sanitizedMarkup };
        }
        return { __html: '' };
    };

    return (
        <div className={`flex gap-3 my-4 ${isModel ? 'justify-start' : 'justify-end'}`}>
            {isModel && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <AIAgentIcon className="w-5 h-5 text-indigo-600" />
                </div>
            )}
            <div className={`p-3 rounded-xl max-w-sm md:max-w-md ${isModel ? 'bg-gray-200 text-gray-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-br-none'}`}>
                {isLoading ? (
                    <LoadingDots />
                ) : isModel ? (
                     <div 
                        className="chat-content text-sm leading-relaxed" 
                        dangerouslySetInnerHTML={createMarkup()} 
                    />
                ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
                )}
            </div>
        </div>
    );
};