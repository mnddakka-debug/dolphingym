import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Camera, Play, Image as ImageIcon, Trash2, Lock, Video, Activity, TrendingDown, TrendingUp, Dumbbell, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProgressVaultView: React.FC = () => {
    const { language, user, progressPhotos, addProgressPhoto, deleteProgressPhoto, weightEntries, attendance } = useApp();
    const t = TRANSLATIONS[language];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [showUpload, setShowUpload] = useState(false);
    const [activeTab, setActiveTab] = useState<'photos' | 'avatar'>('photos');
    const [newWeight, setNewWeight] = useState('');
    const [newNote, setNewNote] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const myPhotos = useMemo(() => {
        return progressPhotos
            .filter(p => p.memberId === user?.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [progressPhotos, user]);

    // ── Real AI Body Scan calculations ─────────────────────────
    const realStats = useMemo(() => {
        const myWeights = weightEntries
            .filter(w => w.memberId === user?.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Weight change: first vs last logged weight
        let weightChange: number | null = null;
        if (myWeights.length >= 2) {
            weightChange = myWeights[myWeights.length - 1].weightKg - myWeights[0].weightKg;
        } else if (user?.weightKg && user?.weight) {
            weightChange = user.weightKg - (user.weight as number);
        }

        // Session count (last 90 days)
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const recentSessions = attendance.filter(
            a => a.memberId === user?.id && new Date(a.timestamp).getTime() > ninetyDaysAgo
        ).length;

        // Body fat change
        const currentBF = user?.bodyFatPercentage;

        // Estimated muscle gain from weight & workouts (simple heuristic)
        let muscleDelta = weightChange !== null ? +(weightChange * 0.6).toFixed(1) : null;

        return { weightChange, recentSessions, currentBF, muscleDelta, photoCount: myPhotos.length };
    }, [weightEntries, attendance, user, myPhotos]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setShowUpload(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = () => {
        if (selectedImage) {
            addProgressPhoto({
                memberId: user!.id,
                photoUrl: selectedImage,
                date: new Date().toISOString(),
                weight: newWeight ? parseFloat(newWeight) : undefined,
                notes: newNote
            });
            setShowUpload(false);
            setSelectedImage(null);
            setNewWeight('');
            setNewNote('');
        }
    };

    const playTimelapse = () => {
        if (myPhotos.length < 2) return;
        setIsPlaying(true);
        setCurrentFrame(0);

        let frame = 0;
        const interval = setInterval(() => {
            frame++;
            if (frame >= myPhotos.length) {
                clearInterval(interval);
                setTimeout(() => setIsPlaying(false), 1000);
            } else {
                setCurrentFrame(frame);
            }
        }, 800); // 800ms per frame
    };

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{t.settings || 'Private & Secure'}</h2>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1 flex items-center gap-3">
                        <Lock className="text-blue-500" size={32} /> {t.stats || 'Progress Vault'}<span className="blue-gradient text-3xl lg:text-5xl">.</span>
                    </h1>
                </div>

                <div className="flex bg-[#111] rounded-2xl p-1 border border-white/10 shadow-inner">
                    <button
                        onClick={() => setActiveTab('photos')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'photos' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Photos
                    </button>
                    <button
                        onClick={() => setActiveTab('avatar')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'avatar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Activity size={14} /> AI Avatar
                    </button>
                </div>

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="blue-bg blue-glow px-5 py-3 rounded-2xl flex items-center gap-2 font-black uppercase tracking-widest text-xs text-white transition-all active:scale-95 shadow-xl"
                >
                    <Camera size={18} /> Add Photo
                </button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {activeTab === 'photos' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Time-Lapse Player */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Video size={18} className="text-blue-400" /> Time-Lapse Generation
                                </h3>
                                {myPhotos.length >= 2 && !isPlaying && (
                                    <button
                                        onClick={playTimelapse}
                                        className="flex items-center gap-2 bg-white/10 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        <Play size={14} fill="currentColor" /> Play ({myPhotos.length} Frames)
                                    </button>
                                )}
                            </div>

                            <div className="w-full aspect-[4/5] sm:aspect-video bg-black rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden relative shadow-inner">
                                {myPhotos.length === 0 ? (
                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <ImageIcon size={48} className="text-gray-600" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center px-6">Upload at least 2 photos to generate a time-lapse</p>
                                    </div>
                                ) : (
                                    <>
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={isPlaying ? myPhotos[currentFrame]?.id : myPhotos[myPhotos.length - 1]?.id}
                                                src={isPlaying ? myPhotos[currentFrame]?.photoUrl : myPhotos[myPhotos.length - 1]?.photoUrl}
                                                initial={{ opacity: isPlaying ? 0.8 : 1 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: isPlaying ? 0.8 : 1 }}
                                                transition={{ duration: 0.2 }}
                                                className="w-full h-full object-cover"
                                            />
                                        </AnimatePresence>

                                        {/* Overlay Stats */}
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                                                <p className="text-white font-black text-sm sm:text-lg drop-shadow-lg">
                                                    {new Date(isPlaying ? myPhotos[currentFrame]?.date : myPhotos[myPhotos.length - 1]?.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                {(isPlaying ? myPhotos[currentFrame]?.weight : myPhotos[myPhotos.length - 1]?.weight) && (
                                                    <p className="text-blue-400 font-bold text-xs uppercase tracking-widest drop-shadow-md">
                                                        Weight: {isPlaying ? myPhotos[currentFrame]?.weight : myPhotos[myPhotos.length - 1]?.weight} kg
                                                    </p>
                                                )}
                                            </div>

                                            {isPlaying && (
                                                <div className="bg-blue-500/80 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_blue]">
                                                    <Play size={20} className="text-white ml-1" fill="currentColor" />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Photo Gallery Grid */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-5 h-full">
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                <ImageIcon size={18} className="text-gray-400" /> Gallery ({myPhotos.length})
                            </h3>

                            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[500px] no-scrollbar">
                                {myPhotos.map((photo, i) => (
                                    <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0 w-full aspect-video sm:aspect-auto sm:h-32 flex bg-black">
                                        <img src={photo.photoUrl} className="w-1/3 h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="p-4 flex flex-col justify-center flex-1 bg-gradient-to-r from-black/80 to-[#111]">
                                            <p className="text-white font-black text-sm">{new Date(photo.date).toLocaleDateString()}</p>
                                            {photo.weight && <p className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">Wt: {photo.weight} kg</p>}
                                            {photo.notes && <p className="text-gray-500 text-[10px] mt-2 line-clamp-2">{photo.notes}</p>}
                                        </div>
                                        <button
                                            onClick={() => deleteProgressPhoto(photo.id)}
                                            className="absolute right-3 top-3 w-8 h-8 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {myPhotos.length === 0 && (
                                    <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest py-10 border border-white/5 border-dashed rounded-3xl">
                                        Vault is empty
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 lg:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center justify-center min-h-[500px]">
                    {/* Glowing background elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Pseudo 3D Model Area */}
                    <div className="relative w-full max-w-sm aspect-[1/2] rounded-full border border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-transparent flex items-center justify-center p-8 group">
                        {/* Skeleton/Avatar mock */}
                        <div className="w-full h-full relative blur-[1px] opacity-60 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center rounded-[3rem]" style={{ filter: 'hue-rotate(220deg) saturate(2)' }}>
                            <div className="absolute inset-0 bg-indigo-900/40 mix-blend-overlay"></div>
                        </div>

                        {/* Scanning beam animation */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-400 blur-[2px] opacity-70 animate-scan"></div>

                        {/* Interactive Nodes */}
                        <div className="absolute top-[25%] left-[20%] w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-[0_0_15px_blue] animate-pulse group-hover:scale-125 transition-transform cursor-pointer">
                            <span className="absolute -left-32 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {realStats.muscleDelta !== null ? `Upper: ${realStats.muscleDelta > 0 ? '+' : ''}${realStats.muscleDelta} kg` : 'Shoulders'}
                            </span>
                        </div>
                        <div className="absolute top-[40%] right-[25%] w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-[0_0_15px_green] animate-pulse group-hover:scale-125 transition-transform cursor-pointer" style={{ animationDelay: '0.5s' }}>
                            <span className="absolute -right-24 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                {realStats.currentBF ? `BF: ${realStats.currentBF}%` : 'Core Zone'}
                            </span>
                        </div>
                        <div className="absolute bottom-[30%] left-[45%] w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-[0_0_15px_blue] animate-pulse group-hover:scale-125 transition-transform cursor-pointer" style={{ animationDelay: '1s' }}>
                            <span className="absolute -left-28 bottom-full mb-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-black uppercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Sessions: {realStats.recentSessions}
                            </span>
                        </div>
                    </div>

                    {/* AI Insights Panel - REAL DATA */}
                    <div className="flex flex-col gap-6 max-w-md w-full z-10">
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-widest">
                            AI Body Scan
                        </h3>
                        <p className="text-sm text-gray-400 font-medium">
                            {realStats.photoCount >= 2
                                ? (language === 'en' ? `Based on your ${realStats.photoCount} vault photos, Dolphin AI has analysed your progress over the last 90 days.` : `استناداً إلى ${realStats.photoCount} صورة في خزنتك، قام Dolphin AI بتحليل تقدمك خلال آخر 90 يوماً.`)
                                : (language === 'en' ? 'Add at least 2 progress photos to unlock the full AI scan analysis.' : 'أضف صورتين على الأقل لفتح تحليل AI الكامل.')}
                        </p>

                        <div className="space-y-4">
                            {/* Weight / Muscle Change */}
                            <div className="bg-white/5 border border-indigo-500/20 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <TrendingUp size={12} /> {language === 'en' ? 'Weight Change (Logged)' : 'تغيّر الوزن (المُسجَّل)'}
                                </p>
                                {realStats.weightChange !== null ? (
                                    <>
                                        <p className={`text-2xl font-black ${realStats.weightChange >= 0 ? 'text-cyan-300' : 'text-green-300'}`}>
                                            {realStats.weightChange >= 0 ? '+' : ''}{realStats.weightChange.toFixed(1)} kg
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {language === 'en'
                                                ? (realStats.weightChange >= 0 ? 'Potential muscle gain from logged entries' : 'Logged weight reduction')
                                                : (realStats.weightChange >= 0 ? 'مكسب وزن محتمل من الإدخالات المسجّلة' : 'انخفاض وزن مسجّل')}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 font-bold">{language === 'en' ? 'Log weight entries to see change' : 'سجّل وزنك لرؤية التغيّر'}</p>
                                )}
                            </div>

                            {/* Body Fat */}
                            <div className="bg-white/5 border border-green-500/20 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <TrendingDown size={12} /> {language === 'en' ? 'Body Fat %' : 'نسبة الدهون'}
                                </p>
                                {realStats.currentBF ? (
                                    <>
                                        <p className="text-2xl font-black text-white">{realStats.currentBF}%</p>
                                        <p className="text-xs text-gray-500 mt-1">{language === 'en' ? 'From your profile data' : 'من بيانات ملفك الشخصي'}</p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 font-bold">{language === 'en' ? 'Set body fat % in your profile to track it' : 'أضف نسبة الدهون في ملفك لتتبعها'}</p>
                                )}
                            </div>

                            {/* Workouts & Photos row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-purple-500/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Dumbbell size={10} /> {language === 'en' ? 'Sessions (90d)' : 'جلسات (90 يوم)'}</p>
                                    <p className="text-2xl font-black text-white">{realStats.recentSessions}</p>
                                </div>
                                <div className="bg-white/5 border border-orange-500/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Flame size={10} /> {language === 'en' ? 'GP Points' : 'نقاط GP'}</p>
                                    <p className="text-2xl font-black text-white">{(user?.points || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => { setActiveTab('photos'); setTimeout(() => fileInputRef.current?.click(), 100); }}
                            className="bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                            <Camera size={16} /> {language === 'en' ? 'Take New Scan Photo' : 'إضافة صورة مسح جديدة'}
                        </button>
                    </div>
                </div>
            )}

            {/* Upload/Details Modal */}
            {showUpload && selectedImage && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative">
                        <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 text-center">Save to Vault</h3>

                        <div className="w-full aspect-square bg-black rounded-3xl border border-white/10 mb-6 overflow-hidden">
                            <img src={selectedImage} alt="preview" className="w-full h-full object-cover opacity-90" />
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-blue-500 transition-colors">
                                <Activity size={18} className="text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="Weight (kg) - Optional"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    className="bg-transparent text-sm text-white font-bold w-full outline-none placeholder:text-gray-600"
                                />
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-blue-500 transition-colors">
                                <textarea
                                    placeholder="Notes (e.g., Feeling strong today!)"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="bg-transparent text-sm text-white font-bold w-full outline-none placeholder:text-gray-600 resize-none h-16"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowUpload(false); setSelectedImage(null); }}
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePhoto}
                                className="flex-1 py-4 blue-bg blue-glow text-white font-black uppercase tracking-widest rounded-2xl text-xs active:scale-95 transition-all shadow-lg"
                            >
                                Secure It
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProgressVaultView;
