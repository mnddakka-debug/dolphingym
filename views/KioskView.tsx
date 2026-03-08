
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ScanLine, CheckCircle2, XCircle, Camera, UserSquare, LogOut, SmartphoneNfc, Hash, Delete } from 'lucide-react';
import jsQR from 'jsqr';
import * as faceapi from 'face-api.js';

const KioskView: React.FC = () => {
    const { language, setKioskMode, members, logAttendance, addLead } = useApp();
    const t = TRANSLATIONS[language];
    const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'denied' | 'guest_form' | 'pin_entry'>('idle');
    const [identifiedMember, setIdentifiedMember] = useState<any | null>(null);
    const [mode, setMode] = useState<'qr' | 'face' | 'nfc' | 'pin'>('qr');
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState(false);

    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestCode, setGuestCode] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);

    // Load Face Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                setModelsLoaded(true);
            } catch (e) {
                console.error("Failed to load models", e);
            }
        };
        loadModels();
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode === 'face' ? 'user' : 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true");
                videoRef.current.play();
                requestRef.current = requestAnimationFrame(tick);
            }
        } catch (err) {
            console.error("Camera error", err);
            setStatus('denied');
        }
    };

    const tick = () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                if (mode === 'qr') {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                    if (code) {
                        handleScan(code.data, 'qr');
                        return;
                    }
                } else if (mode === 'face' && modelsLoaded) {
                    // Simulate face detect trigger occasionally for demo
                    if (Math.random() < 0.05) { // 5% chance per frame to "detect"
                        // For demo: verify against random member
                        handleScan("FACE_DETECTED", 'face');
                        return;
                    }
                }
            }
        }
        if (status === 'scanning') {
            requestRef.current = requestAnimationFrame(tick);
        }
    };

    const handleScan = (data: string, type: 'qr' | 'face' | 'nfc') => {
        if (status !== 'scanning') return;
        setStatus('processing');
        stopCamera();

        // SIMULATION LOGIC
        setTimeout(() => {
            // Logic: Pick a random member to "identify"
            const activeMembers = members.filter(m => m.role === 'member');
            const randomMember = activeMembers[Math.floor(Math.random() * activeMembers.length)];

            if (randomMember) {
                setIdentifiedMember(randomMember);
                logAttendance(randomMember.id, randomMember.name, type);
                setStatus('success');
            } else {
                setStatus('denied');
            }

            // Auto reset
            setTimeout(() => {
                setStatus('idle');
                setIdentifiedMember(null);
            }, 5000);
        }, 1500);
    };

    const activate = (m: 'qr' | 'face' | 'nfc') => {
        setMode(m);
        setStatus('scanning');

        if (m === 'nfc') {
            // Simulate NFC tap immediately after a small delay
            setTimeout(() => {
                handleScan("NFC_TAP", 'nfc');
            }, 2000);
        } else {
            startCamera();
        }
    };

    const handleGuestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName || !guestPhone) return;

        // Mock identifying the referrer from the code
        // Normally you'd parse /guest/CODE to match an active pass.
        // For demo, we just assign to 'm1'.
        addLead({ name: guestName, phone: guestPhone, referredBy: 'm1' });

        setStatus('success');
        setIdentifiedMember({ name: guestName + ' (Guest)', role: 'Guest Pass', subscriptionEndDate: new Date().toISOString() });
        setTimeout(() => {
            setStatus('idle');
            setIdentifiedMember(null);
            setGuestName('');
            setGuestPhone('');
            setGuestCode('');
        }, 5000);
    };

    return (
        <div className="fixed inset-0 bg-black text-white z-[9999] flex flex-col font-sans">
            {/* Kiosk Header */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div>
                    <h1 className="text-4xl font-black blue-gradient uppercase tracking-widest">{t.appName}</h1>
                    <p className="text-xl text-gray-400 font-bold tracking-[0.3em] uppercase mt-2">{t.kioskWelcome}</p>
                </div>
                <button onClick={() => setKioskMode(false)} className="bg-white/10 p-4 rounded-full hover:bg-red-500 hover:text-white transition-all">
                    <LogOut size={24} />
                </button>
            </div>

            {status === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-in fade-in duration-500">
                    <div className="relative group cursor-pointer" onClick={() => activate('nfc')}>
                        <div className="w-48 h-48 border-2 border-green-500/30 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm group-hover:border-green-500 group-hover:scale-105 transition-all">
                            <SmartphoneNfc size={64} className="text-green-500" />
                            <span className="text-xl font-black uppercase tracking-widest">NFC</span>
                        </div>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => activate('face')}>
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all" />
                        <div className="w-48 h-48 border-2 border-blue-500/30 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm group-hover:border-blue-500 group-hover:scale-105 transition-all">
                            <UserSquare size={64} className="text-blue-500" />
                            <span className="text-xl font-black uppercase tracking-widest">Face ID</span>
                        </div>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => activate('qr')}>
                        <div className="w-48 h-48 border-2 border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm group-hover:border-white/30 group-hover:scale-105 transition-all">
                            <ScanLine size={64} className="text-white" />
                            <span className="text-xl font-black uppercase tracking-widest">QR Code</span>
                        </div>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => { setMode('pin'); setStatus('pin_entry'); setPinInput(''); setPinError(false); }}>
                        <div className="w-48 h-48 border-2 border-purple-500/30 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm group-hover:border-purple-500 group-hover:scale-105 transition-all">
                            <Hash size={64} className="text-purple-400" />
                            <span className="text-xl font-black uppercase tracking-widest">PIN</span>
                        </div>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => setStatus('guest_form')}>
                        <div className="w-48 h-48 border-2 border-green-500/30 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-black/50 backdrop-blur-sm group-hover:border-green-500 group-hover:scale-105 transition-all">
                            <UserSquare size={64} className="text-green-500" />
                            <span className="text-xl font-black uppercase tracking-widest text-center leading-tight">Guest<br />Pass</span>
                        </div>
                    </div>
                </div>
            )}

            {(status === 'scanning' || status === 'processing') && (
                <div className="flex-1 relative bg-black">
                    <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        {/* Scanner Frame */}
                        <div className={`w-[500px] h-[500px] border-[4px] rounded-[3rem] relative ${status === 'processing' ? 'border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] animate-pulse' :
                            mode === 'face' ? 'border-blue-500 shadow-[0_0_100px_rgba(59,130,246,0.3)]' :
                                'border-white/50 shadow-[0_0_100px_rgba(255,255,255,0.1)]'
                            }`}>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-black/50 backdrop-blur px-8 py-3 rounded-2xl border border-white/10">
                                <p className="text-xl font-black uppercase tracking-widest animate-pulse">
                                    {status === 'processing' ? 'Processing...' : mode === 'face' ? 'Align Face' : mode === 'nfc' ? 'Please Tap Phone' : 'Align QR Code'}
                                </p>
                            </div>

                            {/* Scanning Laser */}
                            {status === 'scanning' && (
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent animate-[scan_2s_ease-in-out_infinite]" />
                            )}
                        </div>

                        <button onClick={() => { setStatus('idle'); stopCamera(); }} className="mt-12 bg-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && identifiedMember && (
                <div className="flex-1 bg-green-500 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <div className="bg-black/20 p-8 rounded-[4rem] backdrop-blur-sm border border-white/20 text-center max-w-2xl w-full">
                        <CheckCircle2 size={120} className="text-white mx-auto mb-8 drop-shadow-xl" />
                        <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">{t.accessGranted}</h2>
                        <div className="h-px w-32 bg-white/30 mx-auto my-8" />
                        <h3 className="text-4xl font-black uppercase tracking-wide mb-2">{identifiedMember.name}</h3>
                        <p className="text-xl font-bold uppercase tracking-widest opacity-80 mb-8">{identifiedMember.role} • {t.active}</p>
                        <div className="bg-black/30 rounded-2xl p-6">
                            <p className="text-lg font-bold">Subscription Valid until {new Date(identifiedMember.subscriptionEndDate || '').toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Entry Mode */}
            {status === 'pin_entry' && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-300 bg-black">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-purple-400 uppercase tracking-widest mb-2">PIN Entry</h2>
                        <p className="text-lg text-gray-400 uppercase tracking-widest">Enter Member Access PIN</p>
                    </div>

                    {/* PIN Display */}
                    <div className="flex gap-4">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl font-black transition-all
                                ${pinError ? 'border-red-500 text-red-400 animate-pulse' : pinInput.length > i ? 'border-purple-500 text-white bg-purple-500/10' : 'border-white/20 text-gray-600'}`}>
                                {pinInput.length > i ? '●' : ''}
                            </div>
                        ))}
                    </div>

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <button key={n} onClick={() => {
                                if (pinInput.length < 4) {
                                    const next = pinInput + n;
                                    setPinInput(next);
                                    setPinError(false);
                                    if (next.length === 4) {
                                        // Verify PIN
                                        const found = members.find((m: any) => m.accessPin === next);
                                        if (found) {
                                            setIdentifiedMember(found);
                                            logAttendance(found.id, found.name, 'manual');
                                            setStatus('success');
                                            setTimeout(() => { setStatus('idle'); setIdentifiedMember(null); setPinInput(''); }, 5000);
                                        } else {
                                            setPinError(true);
                                            setTimeout(() => { setPinInput(''); setPinError(false); }, 1200);
                                        }
                                    }
                                }
                            }}
                                className="h-20 rounded-2xl bg-white/5 border border-white/10 text-3xl font-black hover:bg-purple-500/20 hover:border-purple-500/50 active:scale-95 transition-all">
                                {n}
                            </button>
                        ))}
                        <button onClick={() => { setPinInput(''); setPinError(false); }}
                            className="h-20 rounded-2xl bg-white/5 border border-white/10 text-lg font-black text-gray-400 hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 transition-all">
                            C
                        </button>
                        <button onClick={() => {
                            if (pinInput.length < 4) {
                                const next = pinInput + '0';
                                setPinInput(next);
                                setPinError(false);
                                if (next.length === 4) {
                                    const found = members.find((m: any) => m.accessPin === next);
                                    if (found) {
                                        setIdentifiedMember(found);
                                        logAttendance(found.id, found.name, 'manual');
                                        setStatus('success');
                                        setTimeout(() => { setStatus('idle'); setIdentifiedMember(null); setPinInput(''); }, 5000);
                                    } else {
                                        setPinError(true);
                                        setTimeout(() => { setPinInput(''); setPinError(false); }, 1200);
                                    }
                                }
                            }
                        }}
                            className="h-20 rounded-2xl bg-white/5 border border-white/10 text-3xl font-black hover:bg-purple-500/20 hover:border-purple-500/50 active:scale-95 transition-all">
                            0
                        </button>
                        <button onClick={() => setPinInput(p => p.slice(0, -1))}
                            className="h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
                            <Delete size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <button onClick={() => { setStatus('idle'); setPinInput(''); setPinError(false); }}
                        className="bg-white/5 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Cancel
                    </button>
                </div>
            )}

            {status === 'denied' && (
                <div className="flex-1 bg-red-600 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                    <div className="bg-black/20 p-8 rounded-[4rem] backdrop-blur-sm border border-white/20 text-center max-w-2xl w-full">
                        <XCircle size={120} className="text-white mx-auto mb-8 drop-shadow-xl" />
                        <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">{t.accessDenied}</h2>
                        <p className="text-2xl font-bold opacity-80">Invalid Credential or Expired Subscription</p>
                    </div>
                </div>
            )}

            {status === 'guest_form' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in duration-300 bg-black">
                    <form onSubmit={handleGuestSubmit} className="bg-[#0a0a0c] p-10 rounded-[4rem] border border-green-500/30 w-full max-w-xl text-center shadow-[0_0_100px_rgba(34,197,94,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <h2 className="text-4xl font-black uppercase tracking-widest mb-2 text-green-400">Guest Pass Details</h2>
                        <p className="text-lg font-bold text-gray-500 mb-10">Register to activate your 24hr access.</p>

                        <div className="space-y-6 text-left">
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-4 block mb-2">Full Name</label>
                                <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} type="text" className="w-full bg-black border border-white/10 p-5 rounded-3xl focus:border-green-500 focus:outline-none transition-colors text-lg" placeholder="e.g. John Smith" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-4 block mb-2">Phone Number</label>
                                <input required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} type="tel" className="w-full bg-black border border-white/10 p-5 rounded-3xl focus:border-green-500 focus:outline-none transition-colors text-lg" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest ml-4 block mb-2">Invite Code (from friend)</label>
                                <input required value={guestCode} onChange={(e) => setGuestCode(e.target.value)} type="text" className="w-full bg-black border border-white/10 p-5 rounded-3xl focus:border-green-500 focus:outline-none transition-colors text-lg uppercase font-mono" placeholder="ABC-123-XYZ" />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12">
                            <button type="button" onClick={() => setStatus('idle')} className="flex-1 py-5 rounded-full border border-white/20 font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400">Back</button>
                            <button type="submit" className="flex-1 py-5 rounded-full bg-green-600 hover:bg-green-500 font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all">Submit</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default KioskView;
