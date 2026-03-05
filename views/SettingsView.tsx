
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Mail, Lock, User as UserIcon, Check, Globe, LogOut, ShieldCheck, Phone, HeartPulse, Ruler, Weight, ShieldAlert, Bell, Send, Share2, Users, MonitorPlay, Watch, SmartphoneNfc } from 'lucide-react';

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
    triggerTestNotification,
    setKioskMode
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

    updates.name = name;
    updates.email = email;

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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-500 pb-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
            <ShieldCheck className="text-blue-400" size={32} />
            {t.settings}
          </h1>
          <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mt-1 sm:mt-2">
            {isAdmin ? 'System Administrator' : isTrainer ? 'Elite Trainer' : 'Player Account'}
          </span>
        </div>
        {message && (
          <div className="bg-green-500/10 border border-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 animate-bounce-subtle shadow-lg shadow-green-500/10">
            <Check size={16} className="text-green-500" />
            <span className="text-[10px] sm:text-xs font-black text-green-500 uppercase">{message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-4">

        {/* Left Column: Profile & Security */}
        <div className="space-y-6 flex flex-col">
          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-blue-400">
                <UserIcon size={20} />
                {t.personalInfo}
              </h3>
              {isAdmin && (
                <div className="bg-blue-500/10 text-blue-400 text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full font-black uppercase border border-blue-500/20 flex items-center gap-1.5 shadow-inner">
                  <ShieldAlert size={12} />
                  Manager Mode
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center mb-6 relative z-10 mt-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#1a1a1a] shadow-xl overflow-hidden bg-black/50 relative flex items-center justify-center">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} className="text-gray-700 opacity-50" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 tracking-widest">{t.memberName}</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 tracking-widest">{t.email}</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 flex items-center gap-1.5 tracking-widest">
                  <Phone size={12} /> Phone Number
                </label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+20 XXX XXX XXXX"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder:text-gray-600 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 flex items-center gap-1.5 tracking-widest">
                  <HeartPulse size={12} /> Emergency Contact
                </label>
                <input
                  type="text" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)}
                  placeholder="Name / Relation / Phone"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder:text-gray-600 sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 flex items-center gap-1.5 tracking-widest">
                  <Weight size={12} /> {t.weight} ({t.kg})
                </label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium sm:text-base" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase ml-1 flex items-center gap-1.5 tracking-widest">
                  <Ruler size={12} /> {t.height} ({t.cm})
                </label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium sm:text-base" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 sm:py-5 blue-bg rounded-[2rem] font-black uppercase text-sm sm:text-base tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:brightness-110 relative z-10 mt-4">
              {t.saveChanges}
            </button>
          </form>

          {!isPlayer && (
            <form onSubmit={handleUpdatePassword} className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
              <h3 className="font-black flex items-center gap-2 mb-4 uppercase tracking-[0.2em] text-sm sm:text-base text-orange-400 relative z-10">
                <Lock size={20} />
                {t.security}
              </h3>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.currentPassword}</label>
                <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium placeholder:text-gray-700 sm:text-base" placeholder="••••••••" />
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.newPassword}</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium placeholder:text-gray-700 sm:text-base" placeholder="••••••••" />
              </div>

              <div className="space-y-2 relative z-10">
                <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.confirmPassword}</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-2xl py-4 px-5 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium placeholder:text-gray-700 sm:text-base" placeholder="••••••••" />
              </div>

              <button type="submit" className="w-full py-4 sm:py-5 bg-white/5 rounded-[2rem] font-black uppercase text-sm sm:text-base tracking-widest border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all text-gray-300 hover:text-white relative z-10 mt-4">
                {t.changePassword}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Community, Notifications, Language */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Community & Sharing Section */}
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#3b82f6]/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none group-hover:bg-[#3b82f6]/20 transition-colors duration-700" />
            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-[#3b82f6] mb-6 relative z-10">
              <Users size={20} />
              {t.community}
            </h3>

            <div className="flex items-center justify-between gap-6 relative z-10">
              <div className="flex-1">
                <p className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">{t.shareApp}</p>
                <p className="text-[11px] sm:text-xs text-gray-400 font-bold mt-2 leading-relaxed max-w-[220px]">{t.shareAppDesc}</p>
              </div>
              <button
                onClick={handleShare}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[1.5rem] sm:rounded-[2rem] blue-bg blue-glow flex items-center justify-center text-[#0a0a0a] active:scale-95 transition-all shadow-xl hover:brightness-110"
              >
                <Share2 size={28} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Admin System Settings */}
          {isAdmin && (
            <div className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
              <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-green-400 mb-6 relative z-10">
                <MonitorPlay size={20} />
                {t.kioskMode}
              </h3>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold leading-relaxed relative z-10">
                Activate the gym entrance display. This mode will lock the screen to the Kiosk View for members to sign in via QR or Face ID.
              </p>
              <button
                onClick={() => setKioskMode(true)}
                className="w-full py-4 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-2xl font-black uppercase tracking-widest transition-all relative z-10 flex items-center justify-center gap-3"
              >
                <MonitorPlay size={20} />
                Launch Kiosk
              </button>
            </div>
          )}

          {/* Notification Preferences */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-purple-400">
                <Bell size={20} />
                {t.notifications}
              </h3>
              <button
                onClick={triggerTestNotification}
                className="text-[9px] sm:text-[10px] text-purple-400 font-black uppercase tracking-widest bg-purple-400/10 px-4 py-2 rounded-xl border border-purple-400/20 hover:bg-purple-400/20 transition-all flex items-center gap-2"
              >
                <Send size={14} />
                {t.testNotify}
              </button>
            </div>

            <div className="flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent p-5 rounded-2xl border border-white/5 relative z-10">
              <div>
                <p className="text-sm sm:text-base font-black text-gray-200 uppercase tracking-tight">{t.expiryNotifyToggle}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  {notificationsEnabled ? t.notifyEnabled : t.notifyDisabled}
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-16 h-9 sm:w-16 sm:h-9 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${notificationsEnabled ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300 ${notificationsEnabled ? 'left-8' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="space-y-5 relative z-10 bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-xs text-gray-400 font-black uppercase tracking-widest">{t.expiryDaysLabel}</label>
                <span className="text-base sm:text-lg font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">{expiryDays} <span className="text-[10px] uppercase opacity-70">{t.daysLeft.split(' ')[0]}</span></span>
              </div>
              <div className="pt-2">
                <input
                  type="range" min="1" max="30" value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer accent-purple-500 shadow-inner"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-600 mt-2 px-1">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Integrations */}
          <div className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-cyan-400 mb-6">
              <Watch size={20} />
              {t.wearableSync || 'Wearable Sync & Smart Access'}
            </h3>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <Watch className="text-slate-400" size={24} />
                <div>
                  <p className="font-bold text-white text-sm sm:text-base">Apple Watch / Garmin</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">{user?.wearableDevice && user.wearableDevice !== 'none' ? 'Connected' : 'Not Connected'}</p>
                </div>
              </div>
              <button onClick={() => updateCurrentUserProfile({ wearableDevice: user?.wearableDevice && user.wearableDevice !== 'none' ? 'none' : 'apple_watch' })} className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${user?.wearableDevice && user.wearableDevice !== 'none' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${user?.wearableDevice && user.wearableDevice !== 'none' ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <SmartphoneNfc className="text-slate-400" size={24} />
                <div>
                  <p className="font-bold text-white text-sm sm:text-base">{t.smartAccess || 'Smart Access'}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">NFC / FaceID Entry</p>
                </div>
              </div>
              <button onClick={() => updateCurrentUserProfile({ smartAccessEnabled: !user?.smartAccessEnabled })} className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner shrink-0 ${user?.smartAccessEnabled ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${user?.smartAccessEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          <div className="bg-[#111111] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden">
            <h3 className="font-black flex items-center gap-2 uppercase tracking-[0.2em] text-sm sm:text-base text-gray-400 mb-6">
              <Globe size={20} />
              {t.language}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('en')}
                className={`py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${language === 'en' ? 'bg-white text-black shadow-xl' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${language === 'ar' ? 'bg-white text-black shadow-xl' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
              >
                العربية
              </button>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-6 rounded-[2.5rem] font-black uppercase text-sm sm:text-base tracking-[0.2em] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl hover:shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            <LogOut size={20} strokeWidth={2.5} />
            {t.logout}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
