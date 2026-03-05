import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Globe, LogOut, Bell, TrendingUp, Send, ShieldCheck, Users, Search, ChevronRight, Activity, ScanLine, X, CheckCircle2, AlertCircle, Camera, HelpCircle } from 'lucide-react';
import * as faceapi from 'face-api.js';
import jsQR from 'jsqr';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';


const TrainerView: React.FC = () => {
  const {
    language, setLanguage, logout,
    notificationsEnabled, setNotificationsEnabled,
    expiryDays, setExpiryDays, triggerTestNotification,
    members,
    updateCurrentUserProfile,
    helpRequests, resolveHelpRequest
  } = useApp();

  const t = TRANSLATIONS[language];
  const activeSOS = helpRequests.filter(r => r.status === 'active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedPlayer, setScannedPlayer] = useState<string | null>(null);

  // Face Scan State
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [faceScanStatus, setFaceScanStatus] = useState<'loading' | 'detecting' | 'success' | 'error'>('loading');
  const [loadingMessage, setLoadingMessage] = useState<string>("Initializing...");
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const faceVideoRef = useRef<HTMLVideoElement>(null);
  const faceIntervalRef = useRef<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Load Face API Models
  useEffect(() => {
    let isMounted = true;
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        if (isMounted) {
          setModelsLoaded(true);
          console.log('Face API models loaded');
        }
      } catch (err) {
        console.error('Failed to load Face API models', err);
      }
    };
    loadModels();
    return () => { isMounted = false; };
  }, []);

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

  // إضافة لاعب جديد إلى Firestore عند فتح الصفحة (مثال عملي)
  useEffect(() => {
    const addPlayerToFirestore = async (playerName: string) => {
      try {
        await addDoc(collection(db, 'DOLPHENGYM'), { NAME: playerName });
        // يمكنك استبدال alert بأي إشعار آخر أو تجاهله
        alert('تمت إضافة اللاعب MOHANNAD إلى Firestore!');
      } catch (error) {
        alert('حدث خطأ أثناء الإضافة إلى Firestore');
      }
    };
    addPlayerToFirestore('MOHANNAD');
  }, []);

  const faceTick = useCallback(async () => {
    if (!isFaceScanning) return;
    if (faceVideoRef.current && faceVideoRef.current.readyState === faceVideoRef.current.HAVE_ENOUGH_DATA) {
      try {
        const detection = await faceapi.detectSingleFace(faceVideoRef.current, new faceapi.TinyFaceDetectorOptions());
        if (detection) {
          // Face found, auto capture!
          const canvas = document.createElement('canvas');
          canvas.width = faceVideoRef.current.videoWidth;
          canvas.height = faceVideoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(faceVideoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setFacePhoto(dataUrl);
            setFaceScanStatus('success');
            updateCurrentUserProfile({ profileImage: dataUrl }); // Save to global context
            // Auto close after 3s
            setTimeout(() => {
              setIsFaceScanning(false);
            }, 3000);
            return; // Stop the detection loop
          }
        }
      } catch (e) {
        console.error("Face detection error:", e);
      }
    }
    faceIntervalRef.current = setTimeout(faceTick, 400); // check roughly 2.5 times a second
  }, [isFaceScanning]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timeoutId: any = null;

    const startFaceCamera = async () => {
      if (!modelsLoaded) {
        setLoadingMessage("Waiting for AI Models...");
        return;
      }

      try {
        setFaceScanStatus('loading');
        setLoadingMessage("Checking Camera Permissions...");

        // Add timeout to getUserMedia to prevent silent hangs
        const streamPromise = navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("Camera access timeout. Check browser permissions.")), 15000);
        });

        setLoadingMessage("Waiting for Camera Feed... (Please click Allow)");
        stream = await Promise.race([streamPromise, timeoutPromise]);
        clearTimeout(timeoutId);

        setLoadingMessage("Camera Connected. Starting Video Engine...");
        if (faceVideoRef.current) {
          faceVideoRef.current.srcObject = stream;
          faceVideoRef.current.setAttribute("playsinline", "true");
          faceVideoRef.current.muted = true; // Required for auto-play in many browsers

          setLoadingMessage("Starting AI Detection...");
          faceVideoRef.current.play().catch(e => console.error("Video play error:", e));
          setFaceScanStatus('detecting');
          faceTick();
        }
      } catch (err: any) {
        console.error("Face Camera Access Denied or Timeout", err);
        setLoadingMessage(`Error: ${err.message || 'Camera Access Denied'}`);
        setFaceScanStatus('error');
      }
    };

    if (isFaceScanning) {
      startFaceCamera();
    } else {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (faceIntervalRef.current) clearTimeout(faceIntervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
      if (faceVideoRef.current?.dataset.playInterval) clearInterval(Number(faceVideoRef.current.dataset.playInterval));
      setFacePhoto(null);
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (faceIntervalRef.current) clearTimeout(faceIntervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
      if (faceVideoRef.current?.dataset.playInterval) clearInterval(Number(faceVideoRef.current.dataset.playInterval));
    };
  }, [isFaceScanning, faceTick, modelsLoaded]);

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.trainer}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFaceScanning(true)}
            className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          >
            <Camera size={18} />
            SCAN FACE
          </button>
          <button
            onClick={() => setIsScanning(true)}
            className="blue-bg blue-glow px-4 py-2 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
          >
            <ScanLine size={18} />
            {t.scanPlayer}
          </button>
        </div>
      </div>

      {/* SOS ALERTS */}
      {activeSOS.length > 0 && (
        <div className="flex flex-col gap-3">
          {activeSOS.map(sos => (
            <div key={sos.id} className="bg-red-950/50 border border-red-500 rounded-3xl p-5 flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-in slide-in-from-top group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                    SOS Alert
                    <span className="bg-red-500 text-[9px] px-2 py-0.5 rounded-full animate-pulse">URGENT</span>
                  </h3>
                  <p className="text-sm text-red-200 mt-1">
                    <strong className="text-white">{sos.memberName}</strong> needs help at <strong className="text-white">{sos.location}</strong>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold">{new Date(sos.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <button
                onClick={() => resolveHelpRequest(sos.id)}
                className="bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-widest text-[10px] px-4 py-3 rounded-xl transition-all active:scale-95 shadow-lg"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FACE SCANNING OVERLAY */}
      {isFaceScanning && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-sm aspect-[3/4] relative border-2 border-indigo-500/20 rounded-[3rem] overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center">

            {/* Always render video so ref is available for camera assignment */}
            <video
              ref={faceVideoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${faceScanStatus === 'detecting' ? 'opacity-80' : 'opacity-0'}`}
            />

            {faceScanStatus === 'loading' && (
              <div className="absolute inset-0 z-10 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="text-indigo-400 font-bold animate-pulse text-sm">
                  {loadingMessage}
                </div>
                <div className="text-[10px] text-gray-500 max-w-[200px] mt-2 leading-relaxed">
                  If prompted, please click "Allow" on the camera permission request in your browser.
                </div>
              </div>
            )}

            {faceScanStatus === 'detecting' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent animate-pulse pointer-events-none" />
                <div className="w-56 h-56 border-2 border-indigo-500/50 rounded-full relative pointer-events-none shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <div className="absolute top-0 left-0 w-full h-full border-t-4 border-indigo-400 rounded-full animate-spin [animation-duration:3s]" />
                </div>
                <p className="mt-8 text-indigo-400 font-black animate-pulse uppercase tracking-[0.2em] text-xs relative z-10 drop-shadow-md">DETECTING FACE...</p>
              </>
            )}

            {faceScanStatus === 'success' && facePhoto && (
              <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full h-full relative">
                <img src={facePhoto} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
                <div className="relative z-10 flex flex-col items-center mt-auto pb-12 w-full">
                  <div className="w-32 h-32 rounded-full border-4 border-green-500 overflow-hidden mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <img src={facePhoto} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase drop-shadow-lg tracking-wider">Face Captured!</h2>
                  <p className="text-xs text-green-400 mt-2 font-bold drop-shadow-md uppercase tracking-widest">Profile photo updated</p>
                </div>
              </div>
            )}

            {faceScanStatus === 'error' && (
              <div className="flex flex-col items-center animate-in zoom-in duration-300 text-center px-4">
                <AlertCircle size={60} className="text-red-500 mb-4" />
                <h2 className="text-lg font-black text-white uppercase leading-tight mb-2">Camera Error</h2>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">{loadingMessage}</p>
                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed max-w-[220px]">
                  Make sure your browser has permission to access the camera, and no other app is currently using it.
                </p>
                <button
                  onClick={() => setIsFaceScanning(false)}
                  className="mt-6 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all"
                >
                  CLOSE
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFaceScanning(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-all z-20"
            >
              <X size={20} />
            </button>
          </div>

          <p className="mt-8 text-indigo-400/50 text-[10px] font-bold uppercase tracking-widest text-center max-w-xs">
            Look directly at the camera. The system will automatically capture your face when detected perfectly.
          </p>
        </div>
      )}

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
              className="text-[10px] text-[#3b82f6] font-bold uppercase tracking-widest bg-[#3b82f6]/10 px-3 py-1.5 rounded-lg border border-[#3b82f6]/20 hover:bg-[#3b82f6]/20 transition-all flex items-center gap-1.5"
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
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${notificationsEnabled ? 'blue-bg' : 'bg-white/10'}`}
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
                className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
              />
              <div className="w-12 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-[#3b82f6]">{expiryDays}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-5 rounded-3xl border border-white/5">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Globe size={20} className="text-[#3b82f6]" />
            {t.language}
          </h3>
          <div className="flex bg-white/5 p-1 rounded-2xl">
            <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'blue-bg text-[#0a0a0b]' : 'text-gray-400'}`}>English</button>
            <button onClick={() => setLanguage('ar')} className={`flex-1 py-3 rounded-xl font-bold transition-all font-arabic ${language === 'ar' ? 'blue-bg text-[#0a0a0b]' : 'text-gray-400'}`}>العربية</button>
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

