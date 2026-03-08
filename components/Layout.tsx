
import React from 'react';
import { useApp } from '../context/AppContext';
import { getFilteredNavItems, TRANSLATIONS } from '../constants';
import { Bell, UserCircle, ShieldCheck, User as UserIcon, Dumbbell, Sun, Moon, X, Check, Trash2, Download, GripVertical } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { language, activeTab, setActiveTab, user, getExpiringMembers, getUnreadCount } = useApp();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';
  const expiringCount = getExpiringMembers().length;
  const unreadMessages = getUnreadCount();

  // Batch 2: Theme & Notifications
  const { theme, setTheme, appNotifications, markNotifRead, clearAllNotifs } = useApp();

  const [showNotifs, setShowNotifs] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  // ── Draggable Sidebar State ──────────────────────────────
  const SIDEBAR_W = 256; // 16rem = 256px
  const [sidebarX, setSidebarX] = React.useState<number>(() => {
    const saved = localStorage.getItem('gym_sidebar_x');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartX = React.useRef(0);
  const dragStartSidebarX = React.useRef(0);
  const sidebarRef = React.useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveSidebarX = (x: number) => {
    setSidebarX(x);
    localStorage.setItem('gym_sidebar_x', x.toString());
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    dragStartX.current = clientX;
    dragStartSidebarX.current = sidebarX;
    e.preventDefault();
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const delta = clientX - dragStartX.current;
      const maxX = window.innerWidth - SIDEBAR_W;
      const newX = Math.max(0, Math.min(maxX, dragStartSidebarX.current + delta));
      setSidebarX(newX);
    };
    const onUp = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      // Snap: if more than halfway across the screen, push to the right edge
      const maxX = window.innerWidth - SIDEBAR_W;
      const clientX = 'changedTouches' in e
        ? (e as TouchEvent).changedTouches[0].clientX
        : (e as MouseEvent).clientX;
      const delta = clientX - dragStartX.current;
      const rawX = dragStartSidebarX.current + delta;
      // Snap to nearest of: 0, maxX
      const snapped = rawX < maxX / 2 ? 0 : maxX;
      saveSidebarX(snapped);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging]);

  const sidebarOnRight = sidebarX > window.innerWidth / 2;

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  React.useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const unreadNotifsCount = appNotifications.filter(n => !n.read).length;

  if (!user) return <>{children}</>;

  const filteredNavItems = getFilteredNavItems(user.role);

  const RoleBadge = () => {
    switch (user.role) {
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

  // Header: offset based on sidebar position
  const headerStyle: React.CSSProperties = isMobile ? {} : {
    left: !sidebarOnRight ? `${SIDEBAR_W}px` : 0,
    right: sidebarOnRight ? `${SIDEBAR_W}px` : 0,
  };

  // Main content: margin based on sidebar side
  const mainStyle: React.CSSProperties = isMobile ? {} : (sidebarOnRight
    ? { marginRight: `${SIDEBAR_W}px`, marginLeft: 0 }
    : { marginLeft: `${SIDEBAR_W}px`, marginRight: 0 });

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#000000] text-white ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header
        className="fixed top-0 h-16 bg-black/80 backdrop-blur-md z-40 flex items-center justify-between px-6 border-b border-white/5 hidden md:flex"
        style={headerStyle}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="mt-1 md:mt-0">
              <RoleBadge />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full transition-colors text-xs font-black uppercase tracking-widest border border-blue-500/20 animate-pulse"
            >
              <Download size={14} />
              Install App
            </button>
          )}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={`p-2 rounded-full transition-colors relative ${showNotifs ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400'}`}
            >
              <Bell size={20} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-black"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute top-12 right-0 w-80 sm:w-96 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                  <h3 className="font-bold text-sm uppercase tracking-wider">{t.notifications}</h3>
                  {appNotifications.length > 0 && (
                    <button onClick={clearAllNotifs} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 uppercase font-black">
                      <Trash2 size={12} /> {t.clearAll}
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {appNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <Bell size={32} className="mb-2 opacity-20" />
                      <p className="text-xs">No notifications</p>
                    </div>
                  ) : (
                    appNotifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-blue-500/5' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <h4 className={`text-sm ${!notif.read ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>{notif.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.body}</p>
                            <p className="text-[10px] text-gray-600 mt-2">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                          </div>
                          {!notif.read && (
                            <button onClick={() => markNotifRead(notif.id)} className="self-start text-blue-400 hover:text-blue-300" title={t.markRead}>
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Backdrop for desktop to close dropdown */}
            {showNotifs && (
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifs(false)} />
            )}
          </div>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('settings')}>
            <span className="hidden sm:inline-block text-sm font-bold group-hover:text-blue-400 transition-colors px-2">{user?.name}</span>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10 group-hover:border-blue-400 transition-colors" />
            ) : (
              <UserCircle size={28} className="text-gray-400 group-hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md z-40 flex items-center justify-between px-6 border-b border-white/5 md:hidden">
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <div className="flex flex-col">
            <h1 className="text-lg font-black blue-gradient tracking-[0.15em] whitespace-nowrap drop-shadow-sm uppercase leading-none">{t.appName}</h1>
            <div className="mt-1">
              <RoleBadge />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className={`p-2 rounded-full transition-colors relative ${showNotifs ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-blue-400'}`}
            >
              <Bell size={20} />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-black"></span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute top-12 right-0 w-80 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161616]">
                  <h3 className="font-bold text-sm uppercase tracking-wider">{t.notifications}</h3>
                  {appNotifications.length > 0 && (
                    <button onClick={clearAllNotifs} className="text-[10px] text-red-400 flex items-center gap-1 uppercase font-black">
                      <Trash2 size={12} /> {t.clearAll}
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {appNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <Bell size={32} className="mb-2 opacity-20" />
                      <p className="text-xs">No notifications</p>
                    </div>
                  ) : appNotifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-white/5 ${!notif.read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <h4 className={`text-sm ${!notif.read ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>{notif.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{notif.body}</p>
                        </div>
                        {!notif.read && (
                          <button onClick={() => markNotifRead(notif.id)} className="self-start text-blue-400">
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showNotifs && <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />}
          </div>
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('settings')}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <UserCircle size={28} className="text-gray-400" />
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar — Draggable */}
      <aside
        ref={sidebarRef}
        className="hidden md:flex flex-col bg-[#0a0a0a] border border-white/10 z-50 rounded-2xl m-2 shadow-2xl"
        style={{
          position: 'fixed',
          top: 0,
          left: `${sidebarX}px`,
          width: `${SIDEBAR_W}px`,
          bottom: 0,
          transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
          userSelect: 'none',
        }}
      >
        {/* Drag handle */}
        <div
          className="h-16 flex items-center justify-between px-4 border-b border-white/5 w-full shrink-0 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          title="Drag to move sidebar"
        >
          <div className="flex items-center gap-3 pointer-events-none">
            <Logo size={28} />
            <span className="font-black blue-gradient tracking-widest uppercase text-sm">{t.appName}</span>
          </div>
          <GripVertical size={16} className="text-gray-600 pointer-events-none" />
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => {
            const isHubItem = ['ai_form', 'coach', 'squads', 'leaderboard_view', 'challenges', 'community', 'matchmaker', 'store', 'marketplace', 'vod', 'live', 'progress_vault', 'floor_plan', 'plans'].includes(activeTab);
            const isActive = activeTab === item.id || (item.id === 'hub' && isHubItem);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className={`${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-wide">
                  {language === 'en' ? item.labelEn : item.labelAr}
                </span>
                {item.id === 'admin' && expiringCount > 0 && (
                  <span className={`ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse`}>
                    {expiringCount}
                  </span>
                )}
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span className="ml-auto bg-cyan-500 text-black text-[10px] px-2 py-0.5 rounded-full font-black">
                    {unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main
        className="flex-1 pt-20 pb-24 md:pb-8 px-4 sm:px-6 md:px-8 w-full bg-[#000000] transition-all duration-300 md:pt-24"
        style={{ ...mainStyle }}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {user?.role === 'admin' ? (
        /* Admin: horizontal scrollable nav — white-space:nowrap trick works on ALL mobile browsers */
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-40 w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          style={{
            overflowX: 'scroll',
            overflowY: 'hidden',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            paddingRight: '80px', // Prevents FAB overlap blocking the last items
            paddingLeft: '8px'
          } as React.CSSProperties}
        >
          {filteredNavItems.map((item) => {
            const isHubItem = ['ai_form', 'coach', 'squads', 'leaderboard_view', 'challenges', 'community', 'matchmaker', 'store', 'marketplace', 'vod', 'live', 'progress_vault', 'floor_plan', 'plans'].includes(activeTab);
            const isActive = activeTab === item.id || (item.id === 'hub' && isHubItem);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '72px',
                  height: '100%',
                  verticalAlign: 'top',
                  position: 'relative',
                  flexShrink: 0,
                  gap: '4px',
                  padding: '0 4px',
                }}
                className={isActive ? 'text-blue-400' : 'text-gray-500'}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 4, borderRadius: '0 0 4px 4px', background: '#3b82f6', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }} />
                )}
                <div style={{ padding: 6, borderRadius: 12, background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent', transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, textAlign: 'center', width: '100%', fontWeight: isActive ? 900 : 500, whiteSpace: 'normal' }}>
                  {language === 'en' ? item.labelEn : item.labelAr}
                </span>
                {item.id === 'admin' && expiringCount > 0 && (
                  <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                )}
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
                )}
              </button>
            );
          })}
        </nav>
      ) : (
        /* Members / Trainers: normal evenly-distributed nav */
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-40 px-4 flex items-center justify-between w-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {filteredNavItems.map((item) => {
            const isHubItem = ['ai_form', 'coach', 'squads', 'leaderboard_view', 'challenges', 'community', 'matchmaker', 'store', 'marketplace', 'vod', 'live', 'progress_vault', 'floor_plan', 'plans'].includes(activeTab);
            const isActive = activeTab === item.id || (item.id === 'hub' && isHubItem);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative h-full
                  ${isActive ? 'text-blue-400' : 'text-gray-500'}`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-b-full shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                )}
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-500/10 scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] uppercase tracking-tighter ${isActive ? 'font-black' : 'font-medium'}`}>
                  {language === 'en' ? item.labelEn : item.labelAr}
                </span>
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span className="absolute top-2 right-1/4 w-2 h-2 bg-cyan-500 rounded-full border border-[#0a0a0a]" />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;



