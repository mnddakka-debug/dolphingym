
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Globe, LogOut, Bell, TrendingUp, Send, ShieldCheck, Users, Search, ChevronRight, Activity, ScanLine, X, CheckCircle2, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

const TrainerView: React.FC = () => {
  const { 
    language, setLanguage, logout, 
    notificationsEnabled, setNotificationsEnabled, 
    expiryDays, setExpiryDays, triggerTestNotification,
    members 
  } = useApp();
  
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedPlayer, setScannedPlayer] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  const trainees = members.filter(m => 
    m.role === 'member' && 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateToken = useCallback(async (token: string) => {
    setScanStatus('scanning');
    try {
      const response = await fetch('/api/attendance/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // أضف التوكن الخاص بالمدرب إذا كان مطلوبًا
        },
        body: JSON.stringify({ qrToken: token })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setScanStatus('success');
        setScannedPlayer(data.player || "Verified Player");
        setTimeout(() => {
          setIsScanning(false);
          setScanStatus('idle');
          setScannedPlayer(null);
        }, 3000);
      } else {
        setScanStatus('error');
        setTimeout(() => setScanStatus('scanning'), 2000);
      }
    } catch (err) {
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
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setScanStatus('error');
        // إظهار رسالة خطأ مخصصة
        alert("تعذر الوصول إلى الكاميرا. يرجى التأكد من السماح للتطبيق باستخدام الكاميرا.");
      }
    };

    if (isScanning) {
      setScanStatus('scanning');
      startCamera();
    } else {
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

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.trainer}</h1>
        <button 
          onClick={() => setIsScanning(true)}
          className="blue-bg blue-glow px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <ScanLine size={18} />
          {t.scanPlayer}
        </button>
      </div>

      {/* SCANNING OVERLAY */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="w-full max-w-sm aspect-square relative border-2 border-white/20 rounded-[3rem] overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center">
              
              {scanStatus === 'scanning' && (
                <>
                  <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent animate-pulse pointer-events-none" />
                  <div className="w-64 h-64 border-2 border-blue-500/30 rounded-3xl relative pointer-events-none">
                     <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_blue] animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                  <p className="mt-8 text-blue-400 font-black animate-pulse uppercase tracking-[0.3em] text-xs relative z-10">{t.alignQR}</p>
                </>
              )}

              {scanStatus === 'success' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                   <CheckCircle2 size={80} className="text-green-500 mb-4" />
                   <h2 className="text-xl font-black text-white uppercase">{t.accessGranted}</h2>
                   <p className="text-xs text-gray-400 mt-2 font-bold">{scannedPlayer}</p>
                </div>
              )}

              {scanStatus === 'error' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                   <AlertCircle size={80} className="text-red-500 mb-4" />
                   <h2 className="text-xl font-black text-white uppercase">{t.invalidToken}</h2>
                   <p className="text-xs text-gray-400 mt-2 font-bold">Token invalid or camera error</p>
                </div>
              )}
              
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all z-20"
              >
                <X size={20} />
              </button>
           </div>
           
           <p className="mt-8 text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center">
             {t.scanDescription}
           </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp size={28} />
           </div>
           <div>
              <p className="text-2xl font-bold">12%</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{t.traineeProgress}</p>
           </div>
        </div>
      </div>

      {/* Trainee Management Section */}
      <div className="bg-[#111111] p-5 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center gap-2">
            <Users size={20} className="text-blue-400" />
            {t.assignedTrainees}
          </h3>
          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-lg">{trainees.length}</span>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder={t.searchMembers} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {trainees.map(trainee => (
            <div key={trainee.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {trainee.name[0]}
                 </div>
                 <div>
                    <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">{trainee.name}</p>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                       <Activity size={10} /> Progress: 75%
                    </p>
                 </div>
               </div>
               <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400" />
            </div>
          ))}
          {trainees.length === 0 && (
            <p className="text-center text-xs text-gray-600 py-4 italic">No trainees found</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Notification Settings */}
        <div className="bg-[#111111] p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold flex items-center gap-2">
              <Bell size={20} className="text-blue-400" />
              {t.notifications}
            </h3>
            <button 
              onClick={triggerTestNotification}
              className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1.5 rounded-lg border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all flex items-center gap-1.5"
            >
              <Send size={12} />
              {t.testNotify}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-200">{t.expiryNotifyToggle}</p>
              <p className="text-[10px] text-gray-500">{notificationsEnabled ? t.notifyEnabled : t.notifyDisabled}</p>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'gold-bg' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-3">{t.expiryDaysLabel}</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="1" max="30" value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
              <div className="w-12 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-[#d4af37]">{expiryDays}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-5 rounded-3xl border border-white/5">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Globe size={20} className="text-[#d4af37]" />
            {t.language}
          </h3>
          <div className="flex bg-white/5 p-1 rounded-2xl">
            <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'gold-bg text-[#0a0a0b]' : 'text-gray-400'}`}>English</button>
            <button onClick={() => setLanguage('ar')} className={`flex-1 py-3 rounded-xl font-bold transition-all font-arabic ${language === 'ar' ? 'gold-bg text-[#0a0a0b]' : 'text-gray-400'}`}>العربية</button>
          </div>
        </div>
      </div>

      <button onClick={logout} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
        <LogOut size={20} />
        {t.logout}
      </button>
    </div>
  );
};

export default TrainerView;
