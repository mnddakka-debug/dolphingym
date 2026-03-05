import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: string;
}

const DEFAULT_REPLY_EN = "That's an interesting question! While I'm still learning, I recommend asking one of our trainers on the floor, or switching over to the Trainer Dashboard for personalized assistance.";
const DEFAULT_REPLY_AR = "سؤال مثير للاهتمام! ما زلت أتعلم، لذا أنصحك بسؤال أحد مدربينا في الصالة، أو مراجعة المدربين عبر التطبيق للحصول على مساعدة مخصصة.";

const CoachDolphinChat: React.FC = () => {
    const { language, user } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'init',
                sender: 'bot',
                text: language === 'en' ? "Hey there! I'm Coach Dolphin 🐬 Your AI gym assistant. I can help with workout alternatives, nutrition guidance, or general fitness questions. What's on your mind today?" : "أهلاً بك! أنا كابتن دولفين 🐬 مساعدك الذكي في النادي. يمكنني إرشادك ببدائل التمارين أو أسئلة اللياقة البدنية. كيف يمكنني مساعدتك اليوم؟",
                timestamp: new Date().toISOString()
            }]);
        }
    }, [isOpen, language, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const generateResponse = async (text: string) => {
        try {
            const chatLog = messages.filter(m => m.id !== 'init').map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            chatLog.push({ role: 'user', content: text });
            chatLog.unshift({
                role: 'system',
                content: `You are Coach Dolphin, an AI fitness assistant at Dolphin Gym. The user's name is ${user?.name}. Answer in ${language === 'en' ? 'English' : 'Arabic'}. Keep it short, encouraging, and gym-focused.`
            });

            // Try local backend first (works in dev mode)
            let replyText: string | null = null;
            try {
                const res = await fetch('/api/ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(4000),
                    body: JSON.stringify({ model: 'keyless-gpt-4o-mini', messages: chatLog, stream: false })
                });
                if (res.ok) {
                    const data = await res.json();
                    replyText = data.choices[0].message.content;
                }
            } catch {
                // Local backend unavailable — fall through to Gemini
            }

            // Fallback: Gemini API (works on Netlify/cloud)
            if (!replyText) {
                const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
                    const geminiRes = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: chatLog
                                    .filter(m => m.role !== 'system')
                                    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
                                systemInstruction: { parts: [{ text: chatLog[0].content }] }
                            })
                        }
                    );
                    if (geminiRes.ok) {
                        const gData = await geminiRes.json();
                        replyText = gData.candidates?.[0]?.content?.parts?.[0]?.text || null;
                    }
                }
            }

            setMessages(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                sender: 'bot',
                text: replyText || (language === 'en' ? DEFAULT_REPLY_EN : DEFAULT_REPLY_AR),
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                sender: 'bot',
                text: language === 'en' ? DEFAULT_REPLY_EN : DEFAULT_REPLY_AR,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsTyping(false);
        }
    };


    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMsg: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            sender: 'user',
            text: inputValue.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        generateResponse(newMsg.text);
    };

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <>
            {/* Floating Avatar Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
            >
                <Bot size={32} className="group-hover:animate-bounce-subtle" />
                <span className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, originX: 1, originY: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[60] w-[90vw] max-w-[400px] h-[600px] max-h-[85vh] bg-[#0c0c0e] border border-blue-500/30 rounded-[2.5rem] shadow-2xl shadow-blue-900/40 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 p-5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/50 flex items-center justify-center relative shadow-inner">
                                    <Bot size={22} className="text-blue-300" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2">
                                        Coach Dolphin <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full lowercase tracking-normal">beta</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-blue-200/70">{language === 'en' ? 'AI Gym Assistant' : 'المساعد الذكي للنادي'}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                            <div className="text-center pb-4 border-b border-white/5 mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Today</p>
                            </div>

                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg.id}
                                    className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${msg.sender === 'user' ? 'bg-white/10' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20'}`}>
                                        {msg.sender === 'user' ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-white" />}
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-gradient-to-br from-gray-800 to-[#1a1a1a] border border-white/5 rounded-tr-sm text-gray-200'
                                        : 'bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 rounded-tl-sm text-white shadow-inner'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3 max-w-[85%]"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shrink-0 flex items-center justify-center">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/20 rounded-tl-sm flex gap-1.5 items-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-4 bg-[#050505] border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={language === 'en' ? 'Ask Coach Dolphin...' : 'اسأل كابتن دولفين...'}
                                className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm font-medium"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isTyping}
                                className="w-[56px] h-[56px] rounded-2xl bg-blue-600 flex shrink-0 items-center justify-center text-white disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 transition-colors hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={language === 'ar' ? '-scale-x-100' : ''} />}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CoachDolphinChat;
