import type { ChatMessage } from '../../lib/ai-agent/types';

export const AI_AGENT_SYSTEM_INSTRUCTION = `You are a helpful and creative AI video editing assistant. Your goal is to help users create compelling videos. You can provide suggestions for scripts, shot lists, music, pacing, and visual effects. You can also answer questions about video editing techniques. Keep your responses concise, friendly, and encouraging. You are an expert in video production and storytelling.`;

export const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'ai-welcome',
  role: 'model',
  text: "Hi! I'm your AI editing assistant. How can I help you brainstorm, script, or plan your next video?",
};

export const SUGGESTION_CHIPS = [
    "Suggest a video idea",
    "Help me write a script",
    "What's a good shot list for a tutorial?",
    "Find royalty-free music for a vlog",
];
