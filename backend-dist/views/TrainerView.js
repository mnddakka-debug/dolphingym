import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Globe, LogOut, Bell, TrendingUp, Send, Users, Search, ChevronRight, Activity, ScanLine, X, CheckCircle2, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
const TrainerView = () => {
    const { language, setLanguage, logout, notificationsEnabled, setNotificationsEnabled, expiryDays, setExpiryDays, triggerTestNotification, members } = useApp();
    const t = TRANSLATIONS[language];
    const [searchTerm, setSearchTerm] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle');
    const [scannedPlayer, setScannedPlayer] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(0);
    const trainees = members.filter(m => m.role === 'member' &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const validateToken = useCallback(async (token) => {
        setScanStatus('scanning');
        // Simulate API Validation as defined in attendance.controller.ts
        // In a real app, this would be: await fetch('/api/attendance/validate', { method: 'POST', body: JSON.stringify({ qrToken: token }) })
        await new Promise(resolve => setTimeout(resolve, 800));
        if (token.startsWith('DOLPHIN_SECURE_')) {
            setScanStatus('success');
            setScannedPlayer("Verified Player");
            setTimeout(() => {
                setIsScanning(false);
                setScanStatus('idle');
                setScannedPlayer(null);
            }, 3000);
        }
        else {
            setScanStatus('error');
            setTimeout(() => setScanStatus('scanning'), 2000);
        }
    }, []);
    const tick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                if (code && scanStatus === 'scanning') {
                    validateToken(code.data);
                    return; // Stop the loop for a moment while validating
                }
            }
        }
        requestRef.current = requestAnimationFrame(tick);
    }, [scanStatus, validateToken]);
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
                    videoRef.current.play();
                    requestRef.current = requestAnimationFrame(tick);
                }
            }
            catch (err) {
                console.error("Camera access denied", err);
                setScanStatus('error');
            }
        };
        if (isScanning) {
            setScanStatus('scanning');
            startCamera();
        }
        else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(requestRef.current);
        };
    }, [isScanning, tick]);
    return (_jsxs("div", { className: "flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold", children: t.trainer }), _jsxs("button", { onClick: () => setIsScanning(true), className: "blue-bg blue-glow px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all", children: [_jsx(ScanLine, { size: 18 }), t.scanPlayer] })] }), isScanning && (_jsxs("div", { className: "fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300", children: [_jsxs("div", { className: "w-full max-w-sm aspect-square relative border-2 border-white/20 rounded-[3rem] overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center", children: [scanStatus === 'scanning' && (_jsxs(_Fragment, { children: [_jsx("video", { ref: videoRef, className: "absolute inset-0 w-full h-full object-cover opacity-60" }), _jsx("canvas", { ref: canvasRef, className: "hidden" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent animate-pulse pointer-events-none" }), _jsx("div", { className: "w-64 h-64 border-2 border-blue-500/30 rounded-3xl relative pointer-events-none", children: _jsx("div", { className: "absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_blue] animate-[scan_2s_ease-in-out_infinite]" }) }), _jsx("p", { className: "mt-8 text-blue-400 font-black animate-pulse uppercase tracking-[0.3em] text-xs relative z-10", children: t.alignQR })] })), scanStatus === 'success' && (_jsxs("div", { className: "flex flex-col items-center animate-in zoom-in duration-300", children: [_jsx(CheckCircle2, { size: 80, className: "text-green-500 mb-4" }), _jsx("h2", { className: "text-xl font-black text-white uppercase", children: t.accessGranted }), _jsx("p", { className: "text-xs text-gray-400 mt-2 font-bold", children: scannedPlayer })] })), scanStatus === 'error' && (_jsxs("div", { className: "flex flex-col items-center animate-in zoom-in duration-300", children: [_jsx(AlertCircle, { size: 80, className: "text-red-500 mb-4" }), _jsx("h2", { className: "text-xl font-black text-white uppercase", children: t.invalidToken }), _jsx("p", { className: "text-xs text-gray-400 mt-2 font-bold", children: "Token invalid or camera error" })] })), _jsx("button", { onClick: () => setIsScanning(false), className: "absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-20", children: _jsx(X, { size: 20 }) })] }), _jsx("p", { className: "mt-8 text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center", children: t.scanDescription })] })), _jsx("div", { className: "grid grid-cols-1 gap-4", children: _jsxs("div", { className: "bg-[#111111] border border-white/5 rounded-3xl p-6 flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400", children: _jsx(TrendingUp, { size: 28 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold", children: "12%" }), _jsx("p", { className: "text-[10px] text-gray-500 uppercase font-bold tracking-widest", children: t.traineeProgress })] })] }) }), _jsxs("div", { className: "bg-[#111111] p-5 rounded-3xl border border-white/5 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h3", { className: "font-bold flex items-center gap-2", children: [_jsx(Users, { size: 20, className: "text-blue-400" }), t.assignedTrainees] }), _jsx("span", { className: "bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-lg", children: trainees.length })] }), _jsxs("div", { className: "relative", children: [_jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" }), _jsx("input", { type: "text", placeholder: t.searchMembers, value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500" })] }), _jsxs("div", { className: "space-y-2 max-h-60 overflow-y-auto pr-1", children: [trainees.map(trainee => (_jsxs("div", { className: "p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm", children: trainee.name[0] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold group-hover:text-blue-400 transition-colors", children: trainee.name }), _jsxs("p", { className: "text-[10px] text-gray-500 flex items-center gap-1", children: [_jsx(Activity, { size: 10 }), " Progress: 75%"] })] })] }), _jsx(ChevronRight, { size: 16, className: "text-gray-600 group-hover:text-blue-400" })] }, trainee.id))), trainees.length === 0 && (_jsx("p", { className: "text-center text-xs text-gray-600 py-4 italic", children: "No trainees found" }))] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-[#111111] p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("h3", { className: "font-bold flex items-center gap-2", children: [_jsx(Bell, { size: 20, className: "text-blue-400" }), t.notifications] }), _jsxs("button", { onClick: triggerTestNotification, className: "text-[10px] text-[#d4af37] font-bold uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1.5 rounded-lg border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all flex items-center gap-1.5", children: [_jsx(Send, { size: 12 }), t.testNotify] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-gray-200", children: t.expiryNotifyToggle }), _jsx("p", { className: "text-[10px] text-gray-500", children: notificationsEnabled ? t.notifyEnabled : t.notifyDisabled })] }), _jsx("button", { onClick: () => setNotificationsEnabled(!notificationsEnabled), className: `w-14 h-8 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'gold-bg' : 'bg-white/10'}`, children: _jsx("div", { className: `absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${notificationsEnabled ? 'left-7' : 'left-1'}` }) })] }), _jsxs("div", { className: "pt-2 border-t border-white/5", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-bold uppercase block mb-3", children: t.expiryDaysLabel }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { type: "range", min: "1", max: "30", value: expiryDays, onChange: (e) => setExpiryDays(parseInt(e.target.value, 10)), className: "flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d4af37]" }), _jsx("div", { className: "w-12 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-[#d4af37]", children: expiryDays })] })] })] }), _jsxs("div", { className: "bg-[#111111] p-5 rounded-3xl border border-white/5", children: [_jsxs("h3", { className: "font-bold flex items-center gap-2 mb-4", children: [_jsx(Globe, { size: 20, className: "text-[#d4af37]" }), t.language] }), _jsxs("div", { className: "flex bg-white/5 p-1 rounded-2xl", children: [_jsx("button", { onClick: () => setLanguage('en'), className: `flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'gold-bg text-[#0a0a0b]' : 'text-gray-400'}`, children: "English" }), _jsx("button", { onClick: () => setLanguage('ar'), className: `flex-1 py-3 rounded-xl font-bold transition-all font-arabic ${language === 'ar' ? 'gold-bg text-[#0a0a0b]' : 'text-gray-400'}`, children: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" })] })] })] }), _jsxs("button", { onClick: logout, className: "w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95", children: [_jsx(LogOut, { size: 20 }), t.logout] })] }));
};
export default TrainerView;
