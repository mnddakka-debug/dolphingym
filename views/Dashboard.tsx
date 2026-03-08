
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, CHART_DATA, MOCK_BADGES, BADGES } from '../constants';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, Clock, TrendingUp, Trophy, Star, AlertTriangle, QrCode, X, RefreshCw, PlayCircle, Zap, BellRing, ChevronRight, HelpCircle, MapPin, UserPlus, Link } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import Counter from '../components/Counter';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const {
    language,
    user,
    setActiveTab,
    getExpiringMembers,
    expiryDays,
    notificationsEnabled,
    setNotificationsEnabled,
    currentCapacity,
    peakHours,
    requestTrainerHelp
  } = useApp();
  const t = TRANSLATIONS[language];
  const expiringMembers = getExpiringMembers();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQRToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNotifyPrompt, setShowNotifyPrompt] = useState(!notificationsEnabled);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosLocation, setSosLocation] = useState('');

  const [showGuestPassModal, setShowGuestPassModal] = useState(false);
  const [guestPassLink, setGuestPassLink] = useState('');

  const brokenEquipment = useApp().equipment.filter(e => e.status !== 'available');

  useEffect(() => {
    let timer: any;
    if (showQRModal) {
      const fetchToken = () => {
        const mockToken = `DOLPHIN_SECURE_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        setQRToken(mockToken);
        setTimeLeft(30);
      };
      fetchToken();
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchToken();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQRModal]);

  // Map tailwind color names → CSS hex values for custom properties
  const ecColorMap: Record<string, string> = {
    'bg-orange-500': '#f97316',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-purple-500': '#a855f7',
  };
  const ecGlowMap: Record<string, string> = {
    'bg-orange-500': 'ec-glow-orange',
    'bg-blue-500': 'ec-glow-blue',
    'bg-green-500': 'ec-glow-green',
    'bg-purple-500': 'ec-glow-purple',
  };
  const ecIconBgMap: Record<string, string> = {
    'bg-orange-500': 'bg-orange-500/15 text-orange-400',
    'bg-blue-500': 'bg-blue-500/15 text-blue-400',
    'bg-green-500': 'bg-green-500/15 text-green-400',
    'bg-purple-500': 'bg-purple-500/15 text-purple-400',
  };

  const StatCard = ({ icon, label, value, suffix, places, color, onClick }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix?: string;
    places?: (number | '.')[];
    color: string;
    onClick?: () => void;
  }) => {
    const hexColor = ecColorMap[color] ?? '#3b82f6';
    const glowClass = ecGlowMap[color] ?? 'ec-glow-blue';
    const iconClass = ecIconBgMap[color] ?? 'bg-blue-500/15 text-blue-400';

    return (
      <div
        onClick={onClick}
        className={`electric-card ${glowClass} bg-[#0c0c0e] rounded-2xl p-4 flex flex-col gap-2`}
        style={{ '--ec-color': hexColor } as React.CSSProperties}
      >
        {/* depth gradient background */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 80% 10%, ${hexColor}22 0%, transparent 65%),
                         radial-gradient(ellipse at 20% 90%, ${hexColor}11 0%, transparent 55%)`
          }}
        />

        {/* corner arc sparks */}
        <span className="electric-spark top-right" style={{ background: hexColor }} />
        <span className="electric-spark bottom-left" style={{ background: hexColor }} />

        <div className="electric-card-inner flex flex-col gap-2">
          {/* icon with energy pulse */}
          <div className="relative w-fit mb-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass} relative z-10`}>
              {icon}
            </div>
            <div className="energy-pulse" style={{ '--ec-color': hexColor } as React.CSSProperties} />
          </div>

          <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</span>

          {/* Animated rolling counter */}
          <div
            className="flex items-baseline gap-1 font-black"
            style={{ textShadow: `0 0 20px ${hexColor}55` }}
          >
            <Counter
              value={value}
              places={places}
              fontSize={24}
              padding={4}
              gap={0}
              textColor="white"
              fontWeight={900}
              gradientFrom="#0c0c0e"
              gradientTo="transparent"
              gradientHeight={8}
            />
            {suffix && (
              <span className="text-lg font-black text-white/80">{suffix}</span>
            )}
          </div>

          {/* bottom accent bar */}
          <div
            className="absolute bottom-0 left-0 h-[2px] w-full rounded-b-2xl opacity-60"
            style={{ background: `linear-gradient(90deg, transparent, ${hexColor}, transparent)` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12 bg-black w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">{t.welcome}</h2>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mt-1">
            {user?.name} <span className="blue-gradient text-3xl lg:text-5xl">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'member' && (
            <button
              onClick={() => setShowQRModal(true)}
              className="blue-bg blue-glow p-3 rounded-2xl flex items-center gap-2 group active:scale-95 transition-all"
            >
              <QrCode size={20} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Check-In</span>
            </button>
          )}

          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 group cursor-pointer hover:bg-white/10 transition-all active:scale-95" onClick={() => setActiveTab('stats')}>
            <Trophy size={18} className="text-blue-400" />
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter leading-none">{t.elitePoints}</p>
              <p className="text-lg font-black text-blue-400 leading-none mt-1">{user?.points?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Smart Prompt */}
      {showNotifyPrompt && !notificationsEnabled && (
        <div className="bg-gradient-to-r from-blue-900/40 to-[#0a0a0a] border border-blue-500/20 rounded-[2rem] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <BellRing size={24} className="animate-bounce-subtle" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white">{t.notifications}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold mt-1">Never miss a workout reminder or expiry alert.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setNotificationsEnabled(true)}
              className="bg-blue-500 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
            >
              Turn On
            </button>
            <button onClick={() => setShowNotifyPrompt(false)} className="p-3 text-gray-600 hover:text-white transition-colors rounded-xl hover:bg-white/5">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Primary Actions & Alerts) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Primary Action Card: Training */}
          {user?.role === 'member' && (
            <div
              onClick={() => setActiveTab('workouts')}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-900 p-8 sm:p-10 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/20 min-h-[160px]"
            >
              <div className="relative z-10 w-full flex items-center justify-between">
                <div>
                  <h3 className="text-white font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tighter leading-none">{t.startWorkout}</h3>
                  <p className="text-blue-200 text-xs sm:text-sm mt-3 font-bold opacity-80 uppercase tracking-widest">Alpha Strength • 45 {t.mins}</p>
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-lg">
                  <PlayCircle size={40} className="text-white fill-current" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Zap size={200} className="text-white" />
              </div>
            </div>
          )}

          {/* Admin/Trainer Expiry Banner */}
          {(user?.role === 'admin' || user?.role === 'trainer') && expiringMembers.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-5 flex items-center gap-5 animate-bounce-subtle cursor-pointer hover:bg-red-500/20 transition-colors" onClick={() => setActiveTab('admin')}>
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-500 text-sm uppercase tracking-tight">{t.expiryAlert}</h4>
                <p className="text-xs text-red-200/80 font-bold uppercase mt-1">
                  {expiringMembers.length} {t.members} {t.expiringIn} {expiryDays} {t.daysLeft}
                </p>
              </div>
              <ChevronRight size={20} className="text-red-500/50" />
            </div>
          )}

          {/* User Maintenance Alert Banner */}
          {user?.role === 'member' && brokenEquipment.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-5 flex items-center gap-5 transition-colors">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-lg shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-400 text-sm uppercase tracking-tight">Equipment Maintenance</h4>
                <p className="text-xs text-orange-200/80 font-bold mt-1">
                  Currently offline: {brokenEquipment.map(e => language === 'en' ? e.nameEn : e.nameAr).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Stats Graph */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex-1 min-h-[250px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={18} className="text-blue-400" /> {t.stats}
              </h3>
              <button className="text-[10px] sm:text-xs text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg" onClick={() => setActiveTab('stats')}>
                Detailed Report
              </button>
            </div>
            <div className="flex-1 w-full min-h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calories"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCal)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Weekly Challenges */}
          {user?.role === 'member' && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
              className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2">
                  <Star size={18} className="text-blue-400 fill-current" /> Weekly Challenges
                </h3>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20"
                >
                  Ends in 2d
                </motion.span>
              </div>

              <div className="space-y-4">
                {/* Challenge 1 — Warrior Week */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">Warrior Week</h4>
                      <p className="text-[10px] text-gray-500 font-medium">Complete 4 workouts this week</p>
                    </div>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring', stiffness: 400 }}
                      className="text-xs font-black text-blue-400"
                    >
                      +500 EP
                    </motion.span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '75%' }}
                      transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold self-end mt-[-4px]">3 / 4</p>
                </motion.div>

                {/* Challenge 2 — Consistent Burn */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.42, duration: 0.4, ease: 'easeOut' }}
                  className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">Consistent Burn</h4>
                      <p className="text-[10px] text-gray-500 font-medium">Burn 1,500 Calories</p>
                    </div>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.82, type: 'spring', stiffness: 400 }}
                      className="text-xs font-black text-blue-400"
                    >
                      +300 EP
                    </motion.span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '82%' }}
                      transition={{ delay: 0.65, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold self-end mt-[-4px]">1240 / 1500</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Referral Code Card */}
          {user?.role === 'member' && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.3 }}
              className="bg-gradient-to-br from-purple-900/40 to-[#0a0a0a] border border-purple-500/20 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                  <Star size={18} className="text-purple-400 fill-current" /> Invite Friends
                </h3>
                <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">
                  Earn 500 EP
                </span>
              </div>

              <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-sm">
                Share your unique code. When a friend signs up, you both get Elite Points!
              </p>

              <div className="flex items-center gap-3 mt-2">
                <div className="bg-black border border-white/10 px-5 py-4 rounded-2xl flex-1 flex justify-center items-center group-hover:border-purple-500/50 transition-colors">
                  <span className="font-mono text-xl sm:text-2xl font-black tracking-[0.2em] text-white">
                    {user?.referralCode || 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (user?.referralCode) navigator.clipboard.writeText(user.referralCode);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 flex-shrink-0 shadow-lg shadow-purple-500/20"
                >
                  Copy
                </button>
              </div>
            </motion.div>
          )}

          {/* Smart Guest Pass Card */}
          {user?.role === 'member' && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.35 }}
              className="bg-gradient-to-br from-green-900/40 to-[#0a0a0a] border border-green-500/20 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2 text-white">
                  <UserPlus size={18} className="text-green-400" /> Smart Guest Pass
                </h3>
                <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  1 Pass Remaining
                </span>
              </div>

              <p className="text-xs text-gray-400 font-bold leading-relaxed max-w-sm">
                Invite a friend to train with you for free today! Generates a secure QR pass for them to scan at the gate.
              </p>

              <button
                onClick={() => {
                  setGuestPassLink(`https://dolphingym.app/guest/${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
                  setShowGuestPassModal(true);
                }}
                className="mt-2 bg-green-600 hover:bg-green-500 px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/20 w-fit"
              >
                Generate Pass
              </button>
            </motion.div>
          )}

          {/* Trophy & Badges Cabinet */}
          {user?.role === 'member' && (
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.4 }}
              className="bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-400 fill-current" /> Trophy Cabinet
                </h3>
                <span className="text-[10px] font-black uppercase bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20">
                  {user?.badges?.length || 0} Unlocked
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {BADGES.map(badge => {
                  const isUnlocked = user?.badges?.includes(badge.id);
                  return (
                    <div key={badge.id} className="relative group flex flex-col items-center gap-2">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex justify-center items-center text-2xl shadow-lg transition-transform hover:scale-110 cursor-help ${isUnlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30' : 'bg-white/5 border border-white/10 grayscale opacity-40'}`}>
                        {badge.icon}
                      </div>
                      <span className="text-[9px] font-bold text-center text-gray-400 uppercase tracking-widest leading-tight">{language === 'en' ? badge.nameEn : badge.nameAr}</span>

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 w-max max-w-[150px] bg-black border border-white/10 text-white text-[10px] font-bold p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
                        {language === 'en' ? badge.descriptionEn : badge.descriptionAr}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

        </div>

        {/* Right Column (Stats Grid & Capacity) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 w-full h-fit">

          {/* Live Gym Capacity Widget */}
          <div className="col-span-2 lg:col-span-1 bg-[#111] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
            <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 mb-4 text-white">
              <Activity size={18} className="text-blue-500" /> Live Capacity
            </h3>

            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-black tracking-tighter blue-gradient leading-none">{currentCapacity}%</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pb-1">{currentCapacity > 75 ? 'Busy' : currentCapacity > 40 ? 'Moderate' : 'Quiet'}</span>
            </div>

            <div className="w-full bg-black rounded-full h-2.5 overflow-hidden border border-white/5 shadow-inner mt-4">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${currentCapacity > 75 ? 'bg-gradient-to-r from-orange-500 to-red-500' : currentCapacity > 40 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'}`}
                style={{ width: `${currentCapacity}%` }}
              />
            </div>

            <div className="mt-6">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Today's Peak Hours</p>
              <div className="flex items-end justify-between h-16 gap-1 border-b border-white/10 pb-2">
                {peakHours.map((peak, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end w-full group relative">
                    <div
                      className="w-full bg-blue-500/20 group-hover:bg-blue-500 rounded-t-sm transition-colors"
                      style={{ height: `${peak.capacity}%` }}
                    />
                    <span className="text-[8px] text-gray-600 font-black mt-2 absolute top-full">{peak.hour.split(':')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <StatCard
            icon={<Flame size={24} className="text-orange-500" />}
            label={t.caloriesBurned}
            value={1240}
            places={[1000, 100, 10, 1]}
            color="bg-orange-500"
            onClick={() => setActiveTab('stats')}
          />
          <StatCard
            icon={<Clock size={24} className="text-blue-500" />}
            label={t.avgDuration}
            value={52}
            places={[10, 1]}
            suffix={t.mins}
            color="bg-blue-500"
            onClick={() => setActiveTab('history')}
          />
          <StatCard
            icon={<Activity size={24} className="text-green-500" />}
            label={t.totalWorkouts}
            value={18}
            places={[10, 1]}
            color="bg-green-500"
            onClick={() => setActiveTab('history')}
          />
          <StatCard
            icon={<TrendingUp size={24} className="text-purple-400" />}
            label={t.goal}
            value={75}
            places={[10, 1]}
            suffix="%"
            color="bg-purple-500"
            onClick={() => setActiveTab('stats')}
          />
        </div>
      </div>

      {/* QR MODAL */}
      {
        showQRModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-[#111111] border border-white/10 w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center text-center relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
              <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5"><X size={24} /></button>
              <h3 className="font-black text-2xl mb-1 blue-gradient uppercase tracking-widest mt-4">GYM ACCESS</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">Dynamic Secure Check-In</p>

              <div className="relative p-6 bg-white rounded-[2rem] mb-10 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                <div className="w-56 h-56 bg-white flex flex-col items-center justify-center relative overflow-hidden rounded-xl">
                  {qrToken ? (
                    <QRCodeCanvas
                      value={qrToken}
                      size={200}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"H"}
                      includeMargin={true}
                    />
                  ) : (
                    <div className="animate-pulse bg-gray-200 w-full h-full" />
                  )}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/60 shadow-[0_0_20px_blue] animate-[scan_2.5s_ease-in-out_infinite]" />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-3xl border border-white/10">
                <RefreshCw size={20} className={`text-blue-400 ${timeLeft < 5 ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1.5">Rotation In</p>
                  <p className="text-xl font-black leading-none">{timeLeft}s</p>
                </div>
              </div>

              {/* PIN Display */}
              <div className="mt-6 w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 flex flex-col items-center gap-1">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Access PIN</p>
                <div className="flex gap-3 mt-2">
                  {(user?.accessPin || '0000').split('').map((digit, i) => (
                    <div key={i} className="w-10 h-12 bg-black border border-blue-500/30 rounded-xl flex items-center justify-center text-2xl font-black text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                      {digit}
                    </div>
                  ))}
                </div>
                <p className="text-[8px] text-gray-600 mt-2 font-bold uppercase tracking-widest">Show to staff as alternative</p>
              </div>

              <p className="mt-4 text-[9px] text-gray-600 font-black uppercase tracking-widest leading-relaxed max-w-[250px]">
                Encrypted Session: {qrToken?.split('_')[2]}
              </p>
            </div>
          </div>
        )
      }

      {/* Guest Pass Generated Modal */}
      {showGuestPassModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-[#051105] border border-green-500/30 w-full max-w-md rounded-[3rem] p-10 flex flex-col items-center text-center relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
            <button onClick={() => setShowGuestPassModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5"><X size={24} /></button>
            <h3 className="font-black text-2xl mb-1 text-green-400 uppercase tracking-widest mt-4">PASS GENERATED</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10">Share this link with your guest</p>

            <div className="bg-black border border-white/10 px-5 py-4 rounded-2xl w-full flex items-center gap-3 mb-6 relative overflow-hidden">
              <Link size={18} className="text-gray-500 shrink-0" />
              <span className="font-mono text-xs sm:text-sm font-black text-gray-300 truncate">
                {guestPassLink}
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(guestPassLink);
              }}
              className="bg-green-600 hover:bg-green-500 px-6 py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/20 w-full"
            >
              Copy Link
            </button>

            <p className="mt-8 text-[9px] text-gray-600 font-black uppercase tracking-widest leading-relaxed">
              This pass is valid for 24 hours. They can scan it at the kiosk upon arrival.
            </p>
          </div>
        </div>
      )}

      {/* SOS MODAL */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-red-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-[#1a0505] border border-red-500/30 w-full max-w-sm rounded-[3rem] p-8 flex flex-col relative shadow-[0_0_100px_rgba(239,68,68,0.2)]">
            <button onClick={() => setShowSOSModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/5"><X size={24} /></button>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4 border border-red-500/30">
              <HelpCircle size={32} />
            </div>
            <h3 className="font-black text-2xl text-white uppercase tracking-widest mb-2">Request Help</h3>
            <p className="text-xs text-red-200/70 font-bold mb-6">A trainer will be dispatched to your location immediately.</p>

            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Where are you?</label>
            <div className="flex flex-col gap-2 mb-8">
              {['Free Weights Zone', 'Cardio Area', 'Machines / Cables', 'Studio A'].map(loc => (
                <button
                  key={loc}
                  onClick={() => setSosLocation(loc)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-colors ${sosLocation === loc ? 'bg-red-500/20 border-red-500 text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'}`}
                >
                  <MapPin size={18} className={sosLocation === loc ? 'text-red-400' : 'text-gray-600'} />
                  <span className="font-bold text-sm tracking-wide">{loc}</span>
                </button>
              ))}
            </div>

            <button
              disabled={!sosLocation}
              onClick={() => {
                requestTrainerHelp(sosLocation);
                setShowSOSModal(false);
                setSosLocation('');
              }}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            >
              Send SOS Alert
            </button>
          </div>
        </div>
      )}

      {/* Floating SOS Button */}
      {user?.role === 'member' && (
        <button
          onClick={() => setShowSOSModal(true)}
          className="fixed bottom-6 right-6 z-50 bg-red-600 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:bg-red-500 hover:scale-110 active:scale-95 transition-all group"
        >
          <HelpCircle size={28} className="group-hover:animate-pulse" />
        </button>
      )}

    </div >
  );
};

export default Dashboard;

