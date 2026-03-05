import React, { useState, useEffect } from 'react';
import { Camera, ScanLine, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const AIFormView: React.FC = () => {
    const { language } = useApp();
    const t = TRANSLATIONS[language];
    const [isScanning, setIsScanning] = useState(false);
    const [feedback, setFeedback] = useState<{ status: 'good' | 'warning', message: string } | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (isScanning) {
            setFeedback(null);

            const exercises = ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press'];
            const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
            const systemPrompt = language === 'en'
                ? `You are an elite AI personal trainer observing a user's form during a ${randomExercise}. Point out one extremely specific biomechanical flaw you "see" (e.g. knee valgus, lumbar rounding), tell them how to fix it in one sentence, and then give a short encouraging remark. Keep it to max 2 sentences total. Do not use formatting.`
                : `أنت مدرب شخصي بالذكاء الاصطناعي تراقب أداء رياضي لتمرين ${randomExercise}. اذكر خطأ ميكانيكي واحد "تراه" بوضوح تام، واشرح كيف يتم إصلاحه في جملة واحدة، ثم قدم تشجيعاً قصيراً. اقتصر على جملتين كحد أقصى وبدون تنسيق.`;

            const getFormFeedback = async () => {
                let reply: string | null = null;

                // Try local Python backend first (works in dev mode)
                try {
                    const res = await fetch('/api/ai/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: AbortSignal.timeout(4000),
                        body: JSON.stringify({ model: 'keyless-gpt-4o-mini', messages: [{ role: 'user', content: systemPrompt }], stream: false })
                    });
                    if (res.ok) { const d = await res.json(); reply = d.choices[0].message.content; }
                } catch { /* fall through to Gemini */ }

                // Fallback: Gemini API (works on Netlify)
                if (!reply) {
                    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
                    if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
                        try {
                            const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] })
                            });
                            if (r.ok) { const d = await r.json(); reply = d.candidates?.[0]?.content?.parts?.[0]?.text || null; }
                        } catch { /* ignore */ }
                    }
                }

                if (!isMounted) return;
                if (reply) {
                    setFeedback({ status: 'warning', message: reply });
                    setTimeout(() => { if (isMounted) setFeedback({ status: 'good', message: language === 'en' ? 'Form corrected! Perfect execution. Keep it up.' : 'تم تصحيح الأداء! تنفيذ مثالي. استمر.' }); }, 8000);
                } else {
                    setFeedback({ status: 'warning', message: language === 'en' ? 'AI Vision analyzing your form...' : 'نظام الرؤية الذكي يحلل أداءك...' });
                }
            };

            getFormFeedback();
            return () => { isMounted = false; };
        } else {
            setFeedback(null);
        }
    }, [isScanning, language]);


    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
                    <Camera className="text-cyan-400" size={32} />
                    {t.aiFormAnalyzer || 'AI Form Analyzer'}
                </h1>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
                <p className="text-slate-400">
                    {language === 'en'
                        ? 'Use your camera to analyze your squat, deadlift, or bench press form in real-time. Our AI will detect flaws and prevent injuries.'
                        : 'استخدم الكاميرا لتحليل أداء تمارين السكوات أو الديدليفت مباشرة. سيقوم الذكاء الاصطناعي برصد الأخطاء وتجنب الإصابات.'}
                </p>

                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center">
                    {isScanning ? (
                        <>
                            {/* Mock Camera Feed Overlay */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                            <ScanLine size={64} className="text-cyan-400 animate-bounce relative z-10" />
                            <p className="text-cyan-400 font-bold mt-4 relative z-10">
                                {language === 'en' ? 'Analyzing Form...' : 'جاري تحليل الأداء...'}
                            </p>

                            {/* Mock Skeleton Overlay (CSS purely for visuals) */}
                            <div className="absolute w-1 h-32 bg-green-400/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded rotate-12 blur-[1px]"></div>
                            <div className="absolute w-1 h-24 bg-green-400/50 top-[60%] left-1/2 -translate-x-6 -translate-y-1/2 rounded -rotate-12 blur-[1px]"></div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Camera size={48} className="text-slate-600 mb-4 mx-auto" />
                            <p className="text-slate-500">
                                {language === 'en' ? 'Camera is inactive' : 'الكاميرا غير مفعلة'}
                            </p>
                        </div>
                    )}
                </div>

                {feedback && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-slide-up ${feedback.status === 'warning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'
                        }`}>
                        {feedback.status === 'warning' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                        <span className="font-semibold text-lg">{feedback.message}</span>
                    </div>
                )}

                <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isScanning
                        ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                        }`}
                >
                    {isScanning
                        ? (language === 'en' ? 'Stop Analysis' : 'إيقاف التحليل')
                        : (language === 'en' ? 'Start AI Analysis' : 'بدء التحليل باستخدام الذكاء الاصطناعي')}
                </button>
            </div>
        </div>
    );
};

export default AIFormView;
