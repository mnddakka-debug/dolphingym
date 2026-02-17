import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, MOCK_HISTORY } from '../constants';
import { Calendar, Timer, Zap, History, TrendingUp, ChevronRight } from 'lucide-react';
const HistoryView = () => {
    const { language } = useApp();
    const t = TRANSLATIONS[language];
    const isRTL = language === 'ar';
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    return (_jsxs("div", { className: "flex flex-col gap-6 animate-in slide-in-from-bottom duration-500 pb-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-black flex items-center gap-3", children: [_jsx(History, { className: "text-blue-400", size: 28 }), t.history] }), _jsxs("div", { className: "bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-2", children: [_jsx(TrendingUp, { size: 14, className: "text-blue-400" }), _jsx("span", { className: "text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none", children: "Monthly Progress +15%" })] })] }), _jsxs("div", { className: "bg-[#111111] p-5 rounded-3xl border border-white/5 shadow-xl", children: [_jsx("h3", { className: "text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-4", children: t.recentActivity }), _jsx("div", { className: "flex justify-between items-center px-1", children: Array.from({ length: 14 }).map((_, i) => {
                            const hasActivity = Math.random() > 0.4;
                            return (_jsx("div", { className: `w-3.5 h-3.5 rounded-sm transition-all ${hasActivity ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-white/5'}` }, i));
                        }) })] }), _jsx("div", { className: "space-y-4", children: MOCK_HISTORY.map((entry) => (_jsxs("div", { className: "bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-5 flex flex-col gap-4 group hover:border-blue-500/20 transition-all active:scale-[0.98]", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all", children: _jsx(Calendar, { size: 20 }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-black text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight", children: entry.title }), _jsxs("p", { className: "text-xs text-gray-500 font-bold tracking-wide", children: [formatDate(entry.date), " \u2022 ", formatTime(entry.date)] })] })] }), _jsx("div", { className: "bg-white/5 p-2 rounded-xl text-gray-400", children: _jsx(ChevronRight, { size: 18 }) })] }), _jsxs("div", { className: "flex items-center gap-6 pt-2 border-t border-white/5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 bg-blue-500/10 rounded-lg text-blue-400", children: _jsx(Timer, { size: 14 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-gray-500 font-black uppercase leading-none", children: t.avgDuration.split(' ')[1] }), _jsxs("p", { className: "text-sm font-black text-white mt-1", children: [entry.duration, " ", _jsx("span", { className: "text-[10px] opacity-60 uppercase", children: t.mins })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 bg-orange-500/10 rounded-lg text-orange-400", children: _jsx(Zap, { size: 14 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] text-gray-500 font-black uppercase leading-none", children: t.caloriesBurned.split(' ')[0] }), _jsxs("p", { className: "text-sm font-black text-white mt-1", children: [entry.calories, " ", _jsx("span", { className: "text-[10px] opacity-60 uppercase", children: "kcal" })] })] })] }), _jsx("div", { className: "ml-auto flex flex-col items-end", children: _jsx("span", { className: "text-[8px] font-black uppercase tracking-widest text-gray-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5", children: entry.category }) })] })] }, entry.id))) })] }));
};
export default HistoryView;
