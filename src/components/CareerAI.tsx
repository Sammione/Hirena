import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot } from 'lucide-react';
import { cn } from '../utils/cn';
import { answerCareerQuestion } from '../lib/openai';

export default function CareerAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Hello! I'm your Hirena Career Assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await answerCareerQuestion(userMessage);
            setMessages(prev => [...prev, { role: 'ai', content: response || "I'm sorry, I couldn't process that." }]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-4 bg-brand-blue-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Career Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-white/60 font-medium">Online & Ready</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex flex-col max-w-[80%] space-y-1",
                                m.role === 'user' ? "ml-auto items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed",
                                    m.role === 'user'
                                        ? "bg-brand-emerald-500 text-white rounded-tr-none"
                                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start max-w-[80%]">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <Loader2 className="w-4 h-4 text-brand-emerald-500 animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald-500 text-sm font-medium"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-brand-blue-900 text-white rounded-lg hover:bg-brand-blue-800 disabled:opacity-50 transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group",
                    isOpen ? "bg-slate-900 text-white" : "bg-brand-emerald-500 text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : (
                    <div className="relative">
                        <MessageSquare className="w-6 h-6" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-blue-900 border-2 border-brand-emerald-500 rounded-full"></div>
                    </div>
                )}
            </button>
        </div>
    );
}
