
import React from 'react';
import { useApp } from '../context/AppContext';
import { getFilteredNavItems, TRANSLATIONS } from '../constants';
import { Bell, UserCircle, ShieldCheck, User as UserIcon, Dumbbell } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, activeTab, setActiveTab, user, getExpiringMembers } = useApp();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';
  const expiringCount = getExpiringMembers().length;

  if (!user) return <>{children}</>;

  const filteredNavItems = getFilteredNavItems(user.role);

  const RoleBadge = () => {
    switch(user.role) {
      case 'admin':
        return (
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck size={10} className="text-blue-400" />
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{t.adminAccess.split(' ')[0]}</span>
          </div>
        );
      case 'trainer':
        return (
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
            <UserIcon size={10} className="text-orange-400" />
            <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">{t.trainer}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 bg-gray-500/10 border border-white/5 px-2.5 py-1 rounded-full">
            <Dumbbell size={10} className="text-gray-400" />
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.trainee.split(' ')[0]}</span>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#000000] text-white ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div className="flex flex-col">
            <h1 className="text-lg font-black blue-gradient tracking-[0.15em] whitespace-nowrap drop-shadow-sm uppercase leading-none">{t.appName}</h1>
            <div className="mt-1">
              <RoleBadge />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors relative">
            <Bell size={20} className="text-blue-400" />
            {expiringCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-black"></span>
            )}
          </button>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('settings')}>
             <span className="hidden sm:inline-block text-sm font-bold group-hover:text-blue-400 transition-colors">{user?.name}</span>
             <UserCircle size={28} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-24 px-4 sm:px-6 max-w-lg mx-auto w-full bg-[#000000]">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/90 backdrop-blur-lg border-t border-white/10 z-50 px-4 sm:px-10 flex items-center justify-between max-w-lg mx-auto">
        {filteredNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-blue-400 scale-110' : 'text-gray-500 hover:text-white'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-400/10' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] uppercase tracking-tighter font-black">
                {language === 'en' ? item.labelEn : item.labelAr}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
