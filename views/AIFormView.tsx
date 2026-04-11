import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, ScanLine, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const AIFormView: React.FC = () => {
    const { language } = useApp();
    const t = TRANSLATIONS[language];
    const [isScanning, setIsScanning] = useState(false);
    const [feedback, setFeedback] = useState<{ status: 'good' | 'warning', message: string } | null>(null);
    const [camError, setCamError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        setCamError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch {
            setCamError(language === 'en' ? 'Camera access denied. Please allow camera permissions.' : 'تم رفض الوصول للكاميرا. يرجى السماح بصلاحيات الكاميرا.');
            setIsScanning(false);
        }
    }, [language]);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    useEffect(() => {
        if (isScanning) {
            startCamera();
        } else {
            stopCamera();
            setFeedback(null);
        }
        return () => { stopCamera(); };
    }, [isScanning]);

    useEffect(() => {
        let isMounted = true;
        if (!isScanning) return;
        setFeedback(null);

        const exercises = ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press'];
        const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
        const systemPrompt = language === 'en'
            ? `You are an elite AI personal trainer observing a user's form during a ${randomExercise}. Point out one extremely specific biomechanical flaw you "see" (e.g. knee valgus, lumbar rounding), tell them how to fix it in one sentence, and then give a short encouraging remark. Keep it to max 2 sentences total. Do not use formatting.`
            : `أنت مدرب شخصي بالذكاء الاصطناعي تراقب أداء رياضي لتمرين ${randomExercise}. اذكر خطأ ميكانيكي واحد "تراه" بوضوح تام، واشرح كيف يتم إصلاحه في جملة واحدة، ثم قدم تشجيعاً قصيراً. اقتصر على جملتين كحد أقصى وبدون تنسيق.`;

        const getFormFeedback = async () => {
            let reply: string | null = null;
            try {
                const res = await fetch('/api/ai/v1/chat/completions', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(4000),
                    body: JSON.stringify({ model: 'keyless-gpt-4o-mini', messages: [{ role: 'user', content: systemPrompt }], stream: false })
                });
                if (res.ok) { const d = await res.json(); reply = d.choices[0].message.content; }
            } catch { /* fall through */ }

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
                            {/* Real live camera feed — mirrored like a selfie */}
                            <video
                                ref={videoRef}
                                autoPlay playsInline muted
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            {/* Scanning overlay */}
                            <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                                <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl-md" />
                                <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
                            </div>
                            <div className="absolute bottom-10 left-4 right-4 flex justify-between pointer-events-none">
                                <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />
                                <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br-md" />
                            </div>
                            <ScanLine size={48} className="text-cyan-400/70 animate-bounce relative z-10" />
                            <p className="text-cyan-400 font-bold mt-2 relative z-10 text-sm bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
                                {language === 'en' ? 'Analyzing Form...' : 'جاري تحليل الأداء...'}
                            </p>
                        </>
                    ) : (
                        <div className="text-center">
                            {camError ? (
                                <p className="text-red-400 text-sm font-bold px-6">{camError}</p>
                            ) : (
                                <>
                                    <Camera size={48} className="text-slate-600 mb-4 mx-auto" />
                                    <p className="text-slate-500">
                                        {language === 'en' ? 'Camera is inactive' : 'الكاميرا غير مفعلة'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {feedback && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${feedback.status === 'warning' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
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
