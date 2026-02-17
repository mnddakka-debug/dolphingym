
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, CHART_DATA, MOCK_BADGES } from '../constants';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Flame, Clock, TrendingUp, Trophy, Star, AlertTriangle, QrCode, X, RefreshCw, PlayCircle, Zap, BellRing, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    language, 
    user, 
    setActiveTab, 
    getExpiringMembers, 
    expiryDays, 
    notificationsEnabled, 
    setNotificationsEnabled 
  } = useApp();
  const t = TRANSLATIONS[language];
  const expiringMembers = getExpiringMembers();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQRToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showNotifyPrompt, setShowNotifyPrompt] = useState(!notificationsEnabled);

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

  const StatCard = ({ icon, label, value, color, onClick }: { icon: React.ReactNode, label: string, value: string, color: string, onClick?: () => void }) => (
    <div 
      onClick={onClick}
      className={`bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-blue-500/20 transition-all cursor-pointer`}
    >
      <div className={`absolute top-0 right-0 w-20 h-20 opacity-10 blur-3xl rounded-full ${color}`}></div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}/20 text-${color.split('-')[1]}-400`}>
        {icon}
      </div>
      <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-2xl font-black">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12 bg-black">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{t.welcome}</h2>
          <h1 className="text-2xl font-black mt-1">
            {user?.name} <span className="blue-gradient text-3xl">.</span>
          </h1>
        </div>
        
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
            <p className="text-lg font-black text-blue-400 leading-none mt-1">{user?.points.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Notification Smart Prompt */}
      {showNotifyPrompt && !notificationsEnabled && (
        <div className="bg-gradient-to-r from-blue-900/40 to-[#0a0a0a] border border-blue-500/20 rounded-[2rem] p-5 flex items-center justify-between animate-in slide-in-from-top duration-700">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                 <BellRing size={24} className="animate-bounce-subtle" />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest text-white">{t.notifications}</p>
                 <p className="text-[10px] text-gray-400 font-bold mt-1">Never miss a workout reminder or expiry alert.</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setNotificationsEnabled(true)}
                className="bg-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
              >
                Turn On
              </button>
              <button onClick={() => setShowNotifyPrompt(false)} className="p-2 text-gray-600 hover:text-white transition-colors">
                 <X size={16} />
              </button>
           </div>
        </div>
      )}

      {/* Primary Action Card: Training */}
      {user?.role === 'member' && (
        <div 
          onClick={() => setActiveTab('workouts')}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-900 p-6 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/20"
        >
          <div className="relative z-10">
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">{t.startWorkout}</h3>
            <p className="text-blue-200 text-xs mt-2 font-bold opacity-80 uppercase tracking-widest">Alpha Strength • 45 {t.mins}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
             <PlayCircle size={32} className="text-white fill-current" />
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform">
             <Zap size={140} className="text-white" />
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-[#111111] border border-white/10 w-full max-w-xs rounded-[3rem] p-8 flex flex-col items-center text-center relative shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" />
            <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
            <h3 className="font-black text-xl mb-1 blue-gradient uppercase tracking-widest">GYM ACCESS</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-8">Dynamic Secure Check-In</p>
            
            <div className="relative p-4 bg-white rounded-3xl mb-8 group">
              <div className="w-48 h-48 bg-[#000] flex flex-col items-center justify-center relative overflow-hidden rounded-xl">
                 <QrCode size={140} className="text-white opacity-90" />
                 <div className="absolute inset-0 border-[12px] border-white pointer-events-none"></div>
                 <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/50 shadow-[0_0_15px_blue] animate-[scan_2.5s_ease-in-out_infinite]" />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
              <RefreshCw size={16} className={`text-blue-400 ${timeLeft < 5 ? 'animate-spin' : ''}`} />
              <div>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Rotation In</p>
                <p className="text-lg font-black leading-none">{timeLeft}s</p>
              </div>
            </div>
            
            <p className="mt-8 text-[8px] text-gray-600 font-black uppercase leading-relaxed max-w-[200px]">
              Encrypted Session: {qrToken?.split('_')[2]}
            </p>
          </div>
        </div>
      )}

      {/* Admin/Trainer Expiry Banner */}
      {(user?.role === 'admin' || user?.role === 'trainer') && expiringMembers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-4 animate-bounce-subtle cursor-pointer" onClick={() => setActiveTab('admin')}>
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-500 text-xs uppercase tracking-tight">{t.expiryAlert}</h4>
            <p className="text-[10px] text-red-200/60 font-bold uppercase">{expiringMembers.length} {t.members} {t.expiringIn} {expiryDays} {t.daysLeft}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          icon={<Flame size={20} className="text-orange-500" />} 
          label={t.caloriesBurned} 
          value="1,240" 
          color="bg-orange-500"
          onClick={() => setActiveTab('stats')}
        />
        <StatCard 
          icon={<Clock size={20} className="text-blue-500" />} 
          label={t.avgDuration} 
          value={`52 ${t.mins}`} 
          color="bg-blue-500"
          onClick={() => setActiveTab('history')}
        />
        <StatCard 
          icon={<Activity size={20} className="text-green-500" />} 
          label={t.totalWorkouts} 
          value="18" 
          color="bg-green-500"
          onClick={() => setActiveTab('history')}
        />
        <StatCard 
          icon={<TrendingUp size={20} className="text-blue-400" />} 
          label={t.goal} 
          value="75%" 
          color="bg-blue-500"
          onClick={() => setActiveTab('stats')}
        />
      </div>

      <div className="bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-sm uppercase tracking-[0.2em]">{t.stats}</h3>
          <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest" onClick={() => setActiveTab('stats')}>View Detailed Report</button>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px'}}
                itemStyle={{color: '#fff'}}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
