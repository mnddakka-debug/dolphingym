import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
const CoachView = () => {
    const { language, user } = useApp();
    const t = TRANSLATIONS[language];
    const [messages, setMessages] = useState([
        { role: 'coach', text: language === 'en' ? "Hey! I'm your Elite AI Coach. Ready to crush your fitness goals today?" : "مرحباً! أنا مدربك الذكي. هل أنت مستعد لتحقيق أهدافك الرياضية اليوم؟" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || loading)
            return;
        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMessage,
                config: {
                    systemInstruction: `You are a professional gym trainer and nutritionist named 'Elite Coach'. 
          You provide concise, motivating, and scientifically-backed fitness advice. 
          Respond in ${language === 'en' ? 'English' : 'Arabic'}. 
          The user is ${user?.name}, age ${user?.age}, goal is ${user?.goal}.`,
                    temperature: 0.7,
                }
            });
            const aiText = response.text || "I'm having trouble thinking right now. Let's try again!";
            setMessages(prev => [...prev, { role: 'coach', text: aiText }]);
        }
        catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'coach', text: "Service unavailable. Please check your connection." }]);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-[calc(100vh-180px)] animate-in zoom-in-95 duration-500", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400", children: _jsx(Bot, { size: 24 }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-bold text-lg", children: t.aiCoach }), _jsxs("p", { className: "text-[10px] text-green-500 flex items-center gap-1 font-bold tracking-widest uppercase", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" }), " Online"] })] })] }), _jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar", children: [messages.map((m, i) => (_jsx("div", { className: `flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                ? 'bg-[#d4af37] text-[#0a0a0b] font-medium rounded-tr-none'
                                : 'bg-white/5 border border-white/10 rounded-tl-none'}`, children: m.text }) }, i))), loading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none", children: _jsx(Loader2, { size: 20, className: "animate-spin text-blue-400" }) }) }))] }), _jsxs("div", { className: "mt-4 relative", children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSend(), placeholder: t.askCoach, className: "w-full bg-[#111111] border border-white/10 rounded-2xl py-4 px-6 pr-14 focus:outline-none focus:border-[#d4af37] transition-colors" }), _jsx("button", { onClick: handleSend, className: "absolute right-3 top-2 w-10 h-10 gold-bg rounded-xl flex items-center justify-center text-[#0a0a0b] shadow-lg disabled:opacity-50", disabled: loading, children: _jsx(Send, { size: 18 }) })] })] }));
};
export default CoachView;
