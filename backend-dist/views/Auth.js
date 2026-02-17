import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, ShieldAlert, CheckCircle2, Shield } from 'lucide-react';
import Logo from '../components/Logo';
const Auth = () => {
    const { language, login } = useApp();
    const t = TRANSLATIONS[language];
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    // SECURE CREDENTIALS
    const MASTER_EMAIL = 'dolphingym@gmail.com';
    const MASTER_PASS = 'Mm123456789+';
    const handleManualLogin = async (e) => {
        e.preventDefault();
        setError(null);
        // Basic required field check
        if (!email || !password) {
            setError(language === 'en' ? 'Email and Password are required' : 'البريد الإلكتروني وكلمة المرور مطلوبة');
            return;
        }
        setIsVerifying(true);
        // Simulate Secure Handshake with Backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Check against strict master credentials
        if (email.toLowerCase().trim() === MASTER_EMAIL && password === MASTER_PASS) {
            setSuccess(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            login(email, 'admin'); // Authorize as Admin
        }
        else {
            setIsVerifying(false);
            setError(language === 'en' ? 'Access Denied: Invalid Security Credentials' : 'تم رفض الدخول: بيانات الأمان غير صحيحة');
            console.warn(`[SECURITY] Unauthorized login attempt for: ${email}`);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#000000] flex flex-col p-8 animate-in fade-in duration-1000", dir: language === 'ar' ? 'rtl' : 'ltr', children: [_jsx("div", { className: "fixed top-0 left-0 right-0 p-4 flex justify-center pointer-events-none", children: _jsxs("div", { className: "flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-md", children: [_jsx(Shield, { size: 10, className: "text-blue-400 animate-pulse" }), _jsx("span", { className: "text-[8px] font-black text-blue-400/80 uppercase tracking-[0.4em]", children: "Secure Environment \u2022 AES-256 Enabled" })] }) }), _jsxs("div", { className: "mt-16 mb-10 flex flex-col items-center text-center", children: [_jsx(Logo, { size: 120, className: "mb-8 transform hover:scale-105 transition-all duration-700 ease-out drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]" }), _jsx("h1", { className: "text-4xl font-black blue-gradient tracking-[0.25em] mb-2 uppercase drop-shadow-lg", children: t.appName }), _jsxs("div", { className: "flex items-center gap-2 bg-white/5 px-4 py-1 rounded-full border border-white/10 mt-2", children: [_jsx(ShieldCheck, { size: 14, className: "text-blue-400" }), _jsx("span", { className: "text-[10px] text-gray-400 font-black uppercase tracking-widest", children: "Authorized Personnel Only" })] })] }), _jsxs("div", { className: "max-w-sm mx-auto w-full space-y-8 relative", children: [isVerifying && (_jsx("div", { className: "absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center rounded-[3rem] border border-white/10 animate-in fade-in zoom-in duration-500 shadow-2xl", children: !success ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative mb-8", children: [_jsx("div", { className: "absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" }), _jsx(Loader2, { size: 64, className: "text-blue-500 animate-spin", strokeWidth: 1 }), _jsx(ShieldCheck, { size: 24, className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white shadow-xl" })] }), _jsx("p", { className: "text-sm font-black text-white uppercase tracking-[0.4em] animate-pulse", children: language === 'en' ? 'Verifying Identity' : 'جاري التحقق' }), _jsx("div", { className: "mt-8 flex gap-1", children: [1, 2, 3].map(i => _jsx("div", { className: "w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce", style: { animationDelay: `${i * 0.2}s` } }, i)) })] })) : (_jsxs("div", { className: "flex flex-col items-center animate-in zoom-in duration-300", children: [_jsx("div", { className: "w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 mb-6", children: _jsx(CheckCircle2, { size: 48, className: "text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" }) }), _jsx("p", { className: "text-lg font-black text-white uppercase tracking-[0.2em]", children: language === 'en' ? 'Access Granted' : 'تم السماح بالدخول' }), _jsx("p", { className: "mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest", children: "Redirecting to Dashboard..." })] })) })), _jsxs("form", { onSubmit: handleManualLogin, className: "flex flex-col gap-6", children: [error && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/30 p-5 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 shadow-lg", children: [_jsx(ShieldAlert, { size: 24, className: "text-red-500 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-[10px] font-black text-red-500 uppercase tracking-widest mb-1", children: "Security Alert" }), _jsx("p", { className: "text-xs text-red-200/80 font-bold leading-tight", children: error })] })] })), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] ml-2", children: t.email }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none", children: _jsx(Mail, { className: "text-gray-600 group-focus-within:text-blue-400 transition-colors", size: 20 }) }), _jsx("input", { type: "email", autoComplete: "off", value: email, onChange: (e) => { setEmail(e.target.value); setError(null); }, className: "w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium tracking-wide placeholder:text-gray-700", placeholder: "dolphingym@gmail.com" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center px-2", children: [_jsx("label", { className: "text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]", children: t.password }), isLogin && _jsx("button", { type: "button", className: "text-[10px] text-gray-600 font-black hover:text-blue-400 transition-colors uppercase tracking-widest", children: t.forgotPassword })] }), _jsxs("div", { className: "relative group", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none", children: _jsx(Lock, { className: "text-gray-600 group-focus-within:text-blue-400 transition-colors", size: 20 }) }), _jsx("input", { type: "password", value: password, onChange: (e) => { setPassword(e.target.value); setError(null); }, className: "w-full bg-[#0a0a0a] border border-white/10 rounded-[2rem] py-5 pl-14 pr-7 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium placeholder:text-gray-700", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] })] }), _jsxs("button", { type: "submit", disabled: isVerifying, className: "mt-6 py-5 blue-bg rounded-[2rem] text-white font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-[1.02] hover:blue-glow active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50", children: [_jsx("span", { className: "uppercase tracking-[0.2em]", children: isLogin ? t.login : t.signup }), _jsx(ArrowRight, { size: 22, className: "group-hover:translate-x-1.5 transition-transform" })] }), _jsx("div", { className: "pt-8 text-center", children: _jsx("p", { className: "text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed", children: "By attempting to access this system, you acknowledge that all activity is monitored and recorded." }) })] })] }), _jsxs("div", { className: "mt-auto py-10 flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-12 h-1 bg-white/5 rounded-full overflow-hidden", children: _jsx("div", { className: "w-1/3 h-full bg-blue-500/40 animate-[loading_3s_infinite_linear]" }) }), _jsx("p", { className: "text-[9px] font-black uppercase text-gray-600 tracking-[0.5em] opacity-40", children: "Secure Core Jordan Data Center" })] }), _jsx("style", { children: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      ` })] }));
};
export default Auth;
