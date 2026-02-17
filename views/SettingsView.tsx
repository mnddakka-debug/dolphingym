
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Lock, User as UserIcon, Check, Globe, LogOut, ShieldCheck, Phone, HeartPulse, Ruler, Weight, ShieldAlert, Bell, Send, Share2, Users } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    user, 
    updateCurrentUserProfile, 
    logout,
    notificationsEnabled,
    setNotificationsEnabled,
    expiryDays,
    setExpiryDays,
    triggerTestNotification
  } = useApp();
  
  const t = TRANSLATIONS[language];
  const isPlayer = user?.role === 'member';
  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  
  const [email, setEmail] = useState(user?.email || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [weight, setWeight] = useState(user?.weightKg?.toString() || user?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.heightCm?.toString() || user?.height?.toString() || '');

  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {
      phone,
      emergencyContact,
      weightKg: parseFloat(weight) || 0,
      heightCm: parseFloat(height) || 0,
    };

    if (isAdmin) {
      updates.name = name;
      updates.email = email;
    }

    updateCurrentUserProfile(updates);
    setMessage(t.success);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass && newPass === confirmPass) {
      setMessage(t.success);
      setNewPass('');
      setConfirmPass('');
      setCurrentPass('');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Dolphin Gym',
      text: 'Join me at Dolphin Gym and crush your fitness goals! Use my link to get a GP bonus.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage(language === 'en' ? 'Link Copied!' : 'تم نسخ الرابط!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.log('Share failed', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <ShieldCheck className="text-blue-400" size={28} />
            {t.settings}
          </h1>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
            {isAdmin ? 'System Administrator' : isTrainer ? 'Elite Trainer' : 'Player Account'}
          </span>
        </div>
        {message && (
          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-2 animate-bounce-subtle">
            <Check size={14} className="text-green-500" />
            <span className="text-[10px] font-black text-green-500 uppercase">{message}</span>
          </div>
        )}
      </div>

      {/* Community & Sharing Section */}
      <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 blur-3xl rounded-full -mr-10 -mt-10" />
        <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-[#d4af37] mb-5">
          <Users size={18} />
          {t.community}
        </h3>
        
        <div className="flex items-center justify-between gap-4">
           <div className="flex-1">
              <p className="text-sm font-black text-white uppercase tracking-tight">{t.shareApp}</p>
              <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed max-w-[180px]">{t.shareAppDesc}</p>
           </div>
           <button 
             onClick={handleShare}
             className="gold-bg gold-glow p-4 rounded-2xl flex items-center justify-center text-black active:scale-95 transition-all"
           >
              <Share2 size={24} />
           </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-blue-400">
            <Bell size={18} />
            {t.notifications}
          </h3>
          <button 
            onClick={triggerTestNotification}
            className="text-[9px] text-[#d4af37] font-black uppercase tracking-widest bg-[#d4af37]/10 px-3 py-1.5 rounded-xl border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all flex items-center gap-2"
          >
            <Send size={12} />
            {t.testNotify}
          </button>
        </div>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
          <div>
            <p className="text-sm font-bold text-gray-200">{t.expiryNotifyToggle}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
              {notificationsEnabled ? t.notifyEnabled : t.notifyDisabled}
            </p>
          </div>
          <button 
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${notificationsEnabled ? 'blue-bg shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{t.expiryDaysLabel}</label>
             <span className="text-sm font-black text-blue-400">{expiryDays} {t.daysLeft.split(' ')[0]}</span>
          </div>
          <div className="px-2">
            <input 
              type="range" min="1" max="30" value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-xs text-blue-400">
            <UserIcon size={18} />
            {t.personalInfo}
          </h3>
          {isAdmin && (
            <div className="bg-blue-500/10 text-blue-400 text-[8px] px-2.5 py-1 rounded-full font-black uppercase border border-blue-500/20 flex items-center gap-1">
              <ShieldAlert size={10} />
              Manager Mode
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">{t.memberName}</label>
            {!isAdmin ? (
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-gray-400 font-bold">
                {user?.name}
              </div>
            ) : (
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">{t.email}</label>
            {!isAdmin ? (
              <div className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 text-gray-400 font-bold">
                {user?.email}
              </div>
            ) : (
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 flex items-center gap-1">
              <Phone size={10} /> Phone Number
            </label>
            <input 
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+20 XXX XXX XXXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 flex items-center gap-1">
              <HeartPulse size={10} /> Emergency Contact
            </label>
            <input 
              type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)}
              placeholder="Name / Relation / Phone"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 flex items-center gap-1">
                <Weight size={10} /> {t.weight} ({t.kg})
              </label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 flex items-center gap-1">
                <Ruler size={10} /> {t.height} ({t.cm})
              </label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all" />
           </div>
        </div>

        <button type="submit" className="w-full py-3 blue-bg rounded-2xl font-black uppercase text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
          {t.saveChanges}
        </button>
      </form>

      {!isPlayer && (
        <form onSubmit={handleUpdatePassword} className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-5 shadow-xl">
          <h3 className="font-bold flex items-center gap-2 mb-2 uppercase tracking-widest text-xs text-orange-400">
            <Lock size={18} />
            {t.security}
          </h3>
          
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">{t.currentPassword}</label>
            <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all" placeholder="••••••••" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">{t.newPassword}</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all" placeholder="••••••••" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase ml-1">{t.confirmPassword}</label>
            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:border-blue-500 focus:outline-none transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full py-3 bg-white/10 rounded-2xl font-black uppercase text-sm border border-white/5 hover:bg-white/20 active:scale-95 transition-all">
            {t.changePassword}
          </button>
        </form>
      )}

      <div className="bg-[#111111] p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <Globe size={20} className="text-[#d4af37]" />
          {t.language}
        </h3>
        <div className="flex bg-white/5 p-1 rounded-2xl">
          <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${language === 'en' ? 'gold-bg text-black' : 'text-gray-400'}`}>English</button>
          <button onClick={() => setLanguage('ar')} className={`flex-1 py-3 rounded-xl font-bold transition-all font-arabic ${language === 'ar' ? 'gold-bg text-black' : 'text-gray-400'}`}>العربية</button>
        </div>
      </div>

      <button onClick={logout} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
        <LogOut size={20} />
        {t.logout}
      </button>
    </div>
  );
};

export default SettingsView;
