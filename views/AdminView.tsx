
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Package, Globe, LogOut, X, Calendar, UserPlus, Bell, Search, Edit2, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, Send, Banknote, CreditCard, ShieldAlert, Key, Mail, Plus, Hammer, Trash, Info, TrendingUp, DollarSign, HelpCircle, Hash } from 'lucide-react';
import { User, PaymentMethod, Equipment, EquipmentStatus, EquipmentCategory } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminView: React.FC = () => {
  const {
    language, logout, members = [], equipment = [],
    addMember, updateMember, deleteMember,
    addEquipment, updateEquipment, deleteEquipment,
    expiryDays, attendance = [], rewards = [], addReward, deleteReward,
    expenses = [], addExpense, deleteExpense, transactions = [],
    helpRequests = [], resolveHelpRequest,
    leads = [], updateMemberPin
  } = useApp();

  const activeSOS = (helpRequests || []).filter(r => r?.status === 'active');

  const t = TRANSLATIONS[language];
  const [activeSubView, setActiveSubView] = useState<'players' | 'equipment' | 'financials' | 'analytics' | 'leads' | 'pins'>('players');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [editingPin, setEditingPin] = useState<{ [memberId: string]: string }>({});

  // Players Form Data
  const [playerForm, setPlayerForm] = useState<{
    name: string;
    email: string;
    password?: string;
    role: 'member' | 'trainer';
    startDate: string;
    endDate: string;
    subscriptionPrice?: number;
    paymentMethod: PaymentMethod;
  }>({
    name: '', email: '', role: 'member',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subscriptionPrice: 50,
    paymentMethod: 'cash'
  });

  // Equipment Form Data
  const [eqForm, setEqForm] = useState({
    nameEn: '',
    nameAr: '',
    category: 'strength' as EquipmentCategory,
    status: 'available' as EquipmentStatus,
    quantity: 1,
    usageHours: 0,
    maintenanceIntervalHours: 500
  });

  // Expense Form Data
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'rent' as any,
    amount: 0,
    description: ''
  });

  const getPlayerStatus = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'expired';
    if (daysLeft <= expiryDays) return 'expiring';
    return 'active';
  };

  const generateWhatsAppLink = (member: User) => {
    const phone = member.phone || ''; // Fallback if no phone is stored yet
    const message = encodeURIComponent(`مرحباً ${member.name}، نود تذكيرك بأن اشتراكك في Nadi Dolphin ${getPlayerStatus(member.subscriptionEndDate!) === 'expired' ? 'قد انتهى' : 'قارب على الانتهاء'}. يرجى التجديد في أقرب وقت وشكراً!`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const status = getPlayerStatus(member.subscriptionEndDate!);
      if (filter === 'active') return matchesSearch && status === 'active';
      if (filter === 'expiring') return matchesSearch && status === 'expiring';
      if (filter === 'expired') return matchesSearch && status === 'expired';
      return matchesSearch;
    });
  }, [members, searchTerm, filter, expiryDays]);

  const mockRevenueData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
    { month: 'Jul', revenue: 3490, expenses: 4300 },
  ];

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const nameStr = `${item.nameEn || ''} ${item.nameAr || ''}`;
      const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase());
      if (filter !== 'all' && item.status !== filter) return false;
      return matchesSearch;
    });
  }, [equipment, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      totalAssets: (equipment || []).reduce((acc, curr) => acc + (curr?.quantity || 0), 0),
      broken: (equipment || []).filter(e => e?.status === 'broken').length,
      repairing: (equipment || []).filter(e => e?.status === 'maintenance').length
    };
  }, [equipment]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const newMembersThisMonth = members.filter(m => {
      if (!m.memberSince) return false;
      const joined = new Date(m.memberSince);
      return joined.getMonth() === thisMonth && joined.getFullYear() === thisYear;
    }).length;

    const todayStr = now.toDateString();
    const todayAttendance = attendance.filter(r => r.timestamp && new Date(r.timestamp).toDateString() === todayStr).length;

    const monthAttendance = (attendance || []).filter(r => {
      if (!r?.timestamp) return false;
      const d = new Date(r.timestamp);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const topMembers = (members || []).map(m => ({
      ...m,
      sessions: monthAttendance.filter(r => r?.memberId === m?.id).length,
    })).sort((a, b) => b.sessions - a.sessions).slice(0, 5);

    // Financial calculations
    const thisMonthTransactions = (transactions || []).filter(t => {
      if (!t?.timestamp) return false;
      const d = new Date(t.timestamp);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const thisMonthExpenses = (expenses || []).filter(e => {
      if (!e?.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // Hardcode subscription cost at 50 for this calculation
    const thisMonthSubs = (members || []).filter(m => {
      const dateStr = m.subscriptionStartDate || m.memberSince;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((acc, m) => acc + (m.subscriptionPrice || 50), 0);

    // Total income from freelancer commissions
    const thisMonthCommission = thisMonthTransactions.reduce((acc, t) => acc + (t.gymCommission || 0), 0);

    const totalIncome = thisMonthSubs + thisMonthCommission;
    const totalExpenses = thisMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    return { newMembersThisMonth, todayAttendance, monthAttendance, topMembers, totalIncome, totalExpenses, netProfit, thisMonthExpenses };
  }, [members, attendance, expenses, transactions]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeSubView === 'players') {
      setPlayerForm({
        name: '', email: '', role: 'member',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'cash',
        subscriptionPrice: 50 // Default
      });
    } else if (activeSubView === 'equipment') {
      setEqForm({
        nameEn: '', nameAr: '',
        category: 'strength', status: 'available', quantity: 1,
        usageHours: 0, maintenanceIntervalHours: 500
      });
    } else if (activeSubView === 'financials') {
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        category: 'rent', amount: 0, description: ''
      });
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeSubView === 'players') {
      setPlayerForm({
        name: item.name, email: item.email, password: '', role: item.role as 'member' | 'trainer',
        startDate: item.subscriptionStartDate?.split('T')[0] || '',
        endDate: item.subscriptionEndDate?.split('T')[0] || '',
        paymentMethod: item.paymentMethod || 'cash',
        subscriptionPrice: item.subscriptionPrice || 50
      });
    } else {
      setEqForm({
        nameEn: item.nameEn, nameAr: item.nameAr,
        category: item.category, status: item.status, quantity: item.quantity,
        usageHours: item.usageHours || 0,
        maintenanceIntervalHours: item.maintenanceIntervalHours || 500
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (activeSubView === 'players') {
      if (!playerForm.name) return;
      if (editingItem) await updateMember(editingItem.id, playerForm);
      else await addMember(playerForm);
    } else if (activeSubView === 'equipment') {
      if (!eqForm.nameEn || !eqForm.nameAr) return;
      if (editingItem) await updateEquipment(editingItem.id, eqForm);
      else await addEquipment(eqForm);
    } else if (activeSubView === 'financials') {
      if (!expenseForm.amount || !expenseForm.description) return;
      await addExpense(expenseForm);
    }
    setShowModal(false);
  };

  const exportFinancialsCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Added By'];
    const rows = (analyticsData.thisMonthExpenses || []).map(e => [
      e?.date || '', e?.category || '', `"${(e?.description || '').replace(/"/g, '""')}"`, e?.amount || 0, e?.addedBy || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gym_financials_${new Date().getMonth() + 1}_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyle = (status: EquipmentStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'maintenance': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'broken': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12 w-full max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black blue-gradient uppercase tracking-widest">{t.admin}</h1>

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

      {/* Sub-View Switcher — compact scrollable tab bar */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          gap: '8px',
          paddingBottom: '4px',
        } as React.CSSProperties}
      >
        {([
          { id: 'players', icon: <Users size={15} />, label: t.manageUsers, color: 'blue' },
          { id: 'equipment', icon: <Package size={15} />, label: t.manageEquipment, color: 'blue' },
          { id: 'analytics', icon: <TrendingUp size={15} />, label: 'Analytics', color: 'blue' },
          { id: 'financials', icon: <DollarSign size={15} />, label: 'Financials', color: 'blue' },
          { id: 'leads', icon: <UserPlus size={15} />, label: 'Leads', color: 'green' },
          { id: 'pins', icon: <Hash size={15} />, label: 'PINs', color: 'purple' },
        ] as const).map(tab => {
          const isActive = activeSubView === tab.id;
          const activeClass =
            tab.color === 'green' ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20' :
              tab.color === 'purple' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' :
                'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20';
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveSubView(tab.id as any); setFilter('all'); }}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all active:scale-95
                ${isActive ? activeClass : 'bg-[#111] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Management Section */}
      <div className="bg-[#0f0f0f] border border-white/5 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-sm sm:text-base uppercase tracking-[0.2em] flex items-center gap-2">
            {activeSubView === 'players' && <><Users size={20} className="text-blue-400" /> {t.members}</>}
            {activeSubView === 'equipment' && <><Package size={20} className="text-blue-400" /> {t.inventory}</>}
            {activeSubView === 'financials' && <><TrendingUp size={20} className="text-blue-400" /> Financial Analytics</>}
            {activeSubView === 'analytics' && <><TrendingUp size={20} className="text-blue-400" /> Attendance Analytics</>}
            {activeSubView === 'leads' && <><UserPlus size={20} className="text-green-400" /> Leads & Guests</>}
            {activeSubView === 'pins' && <><Key size={20} className="text-purple-400" /> Member PIN Codes</>}
          </h3>
          {(activeSubView === 'players' || activeSubView === 'equipment' || activeSubView === 'financials') && (
            <button onClick={handleOpenAdd} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl blue-bg flex items-center justify-center text-white blue-glow shadow-lg active:scale-90 transition-all">
              <Plus size={24} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Stats Summary for Equipment */}
        {activeSubView === 'equipment' && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-black uppercase mb-1 sm:mb-2">{t.totalEquipment}</p>
              <p className="text-xl sm:text-3xl font-black text-white">{stats.totalAssets}</p>
            </div>
            <div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/10 text-center flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-orange-500 font-black uppercase mb-1 sm:mb-2">{t.maintenanceShort}</p>
              <p className="text-xl sm:text-3xl font-black text-orange-500">{stats.repairing}</p>
            </div>
            <div className="bg-red-500/5 p-4 rounded-2xl border border-red-500/10 text-center flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] text-red-500 font-black uppercase mb-1 sm:mb-2">{t.brokenDevices}</p>
              <p className="text-xl sm:text-3xl font-black text-red-500">{stats.broken}</p>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text" placeholder={t.searchMembers} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar sm:flex-wrap items-center">
            {activeSubView === 'players' ? (
              ['all', 'active', 'expiring', 'expired'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95 ${filter === f ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}>{t?.[f as keyof typeof t] || f}</button>
              ))
            ) : activeSubView === 'equipment' ? (
              ['all', 'available', 'maintenance', 'broken'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95 ${filter === f ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}>{t?.[f as keyof typeof t] || f}</button>
              ))
            ) : activeSubView === 'leads' ? (
              ['all', 'visited', 'contacted', 'converted'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap active:scale-95 ${filter === f ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:bg-white/10'}`}>{f}</button>
              ))
            ) : null}
          </div>
        </div>

        {/* Data List or Financials */}
        <div className={`grid ${activeSubView === 'financials' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
          {activeSubView === 'players' && (
            filteredMembers.map(member => (
              <div key={member.id} className="p-5 bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-md hover:shadow-xl">
                <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-lg uppercase border border-blue-500/20 shrink-0">{member.name[0]}</div>
                  <div className="truncate">
                    <p className="font-black text-sm sm:text-base uppercase tracking-tight truncate group-hover:text-blue-100 transition-colors">{member.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold truncate">{member.email}</p>
                      <span className="text-[9px] bg-[#1a1a1a] px-2 py-0.5 rounded-md uppercase font-black text-blue-400/80 border border-white/5 shrink-0">{member.paymentMethod === 'click' ? t.click : t.cash}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4 items-center">
                  <button onClick={() => updateMember(member.id, { paymentStatus: member.paymentStatus === 'paid' ? 'pending' : 'paid' })} title="Toggle payment status" className={`p-2.5 rounded-xl text-xs font-black transition-all border ${member.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'}`}>
                    {member.paymentStatus === 'paid' ? '✓' : '?'}
                  </button>
                  {(getPlayerStatus(member.subscriptionEndDate!) === 'expiring' || getPlayerStatus(member.subscriptionEndDate!) === 'expired') && (
                    <a
                      href={generateWhatsAppLink(member)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all"
                      title="Send WhatsApp Reminder"
                    >
                      <Send size={16} />
                    </a>
                  )}
                  <button onClick={() => handleOpenEdit(member)} className="p-3 bg-white/5 hover:bg-white/10 hover:text-blue-400 rounded-xl transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => deleteMember(member.id)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}

          {activeSubView === 'equipment' && (
            filteredEquipment.map(item => (
              <div key={item.id} className="p-5 sm:p-6 bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-[2rem] border border-white/5 flex flex-col gap-5 group hover:border-blue-500/30 transition-all shadow-md hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      <Hammer size={26} />
                    </div>
                    <div className="truncate">
                      <h4 className="font-black text-sm sm:text-base uppercase tracking-tight truncate group-hover:text-blue-100 transition-colors">{language === 'en' ? item.nameEn : item.nameAr}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 truncate">{t[item.category]} • {t.quantity}: <span className="text-gray-300">{item.quantity}</span></p>
                    </div>
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border whitespace-nowrap shrink-0 ${getStatusStyle(item.status)}`}>{t[item.status]}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-400 transition-colors">
                    <Clock size={14} />
                    <span className="text-[10px] sm:text-xs font-bold uppercase">{t.lastMaintenance}: {item.lastMaintenanceDate}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleOpenEdit(item)} className="p-2.5 bg-white/5 hover:bg-white/10 hover:text-blue-400 rounded-xl transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => deleteEquipment(item.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"><Trash size={14} /></button>
                  </div>
                </div>
                {/* Predictive Maintenance Bar */}
                {item.usageHours !== undefined && item.maintenanceIntervalHours !== undefined && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                      <span>Usage</span>
                      <span className={item.usageHours >= item.maintenanceIntervalHours * 0.9 ? 'text-red-400' : 'text-blue-400'}>
                        {item.usageHours} / {item.maintenanceIntervalHours} HRS
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${item.usageHours >= item.maintenanceIntervalHours * 0.9 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : item.usageHours >= item.maintenanceIntervalHours * 0.7 ? 'bg-orange-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, (item.usageHours / item.maintenanceIntervalHours) * 100)}%` }}
                      />
                    </div>
                    {item.usageHours >= item.maintenanceIntervalHours * 0.9 && (
                      <p className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> Maintenance required soon to prevent failure
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {activeSubView === 'financials' && (
            <div className="col-span-1 bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Financial Stats Summary */}
                <div className="bg-gradient-to-br from-green-500/10 to-[#0a0a0a] border border-green-500/20 p-5 rounded-3xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <p className="text-[10px] text-green-500/80 font-black uppercase tracking-widest mb-1">Total Income</p>
                  <p className="text-3xl font-black text-green-400 border-b border-green-500/20 pb-4 inline-block tracking-tight">${analyticsData.totalIncome}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-[#0a0a0a] border border-red-500/20 p-5 rounded-3xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
                    <Banknote size={24} />
                  </div>
                  <p className="text-[10px] text-red-500/80 font-black uppercase tracking-widest mb-1">Total Expenses</p>
                  <p className="text-3xl font-black text-red-400 border-b border-red-500/20 pb-4 inline-block tracking-tight">${analyticsData.totalExpenses}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-[#0a0a0a] border border-blue-500/20 p-5 rounded-3xl shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                    <DollarSign size={24} />
                  </div>
                  <p className="text-[10px] text-blue-500/80 font-black uppercase tracking-widest mb-1">Net Profit</p>
                  <p className="text-3xl font-black text-blue-400 border-b border-blue-500/20 pb-4 inline-block tracking-tight">${analyticsData.netProfit}</p>
                </div>
              </div>

              {/* Expenses List */}
              <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h4 className="font-black text-sm uppercase tracking-widest text-red-400">Monthly Expenses Breakdown</h4>
                  <button onClick={exportFinancialsCSV} className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest px-4 py-2 bg-blue-500/10 rounded-lg transition-colors">Export CSV</button>
                </div>
                <div className="p-0">
                  {analyticsData.thisMonthExpenses.length === 0 ? (
                    <p className="text-center text-gray-600 py-10 text-sm">No expenses logged this month</p>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                      {analyticsData.thisMonthExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                              <Banknote size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-200">{expense.description}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{expense.date} • {expense.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-black text-red-400">-${expense.amount}</p>
                            <button onClick={() => deleteExpense(expense.id)} className="text-gray-600 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart container */}
              <div className="h-[300px] sm:h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 900 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeSubView === 'analytics' && (
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-3xl">
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-2">{t.newMembers}</p>
                  <p className="text-3xl font-black text-green-400">{analyticsData.newMembersThisMonth}</p>
                  <p className="text-[10px] text-gray-500 mt-1">This month</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-3xl">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2">Today Check-ins</p>
                  <p className="text-3xl font-black text-blue-400">{analyticsData.todayAttendance}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Members today</p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 p-5 rounded-3xl">
                  <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2">Monthly Sessions</p>
                  <p className="text-3xl font-black text-purple-400">{analyticsData.monthAttendance.length}</p>
                  <p className="text-[10px] text-gray-500 mt-1">Total this month</p>
                </div>
              </div>
              {/* Top members */}
              <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <h4 className="font-black text-sm uppercase tracking-widest text-blue-400">{t.topMembers} — This Month</h4>
                </div>
                {analyticsData.topMembers.length === 0 ? (
                  <p className="text-center text-gray-600 py-10 text-sm">No attendance data yet</p>
                ) : analyticsData.topMembers.map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-gray-600'}`}>{i + 1}</span>
                      <p className="font-bold text-sm">{m.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-20 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (m.sessions / 30) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-black text-blue-400 w-8 text-right">{m.sessions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubView === 'leads' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {(leads || []).filter(l => filter === 'all' || l?.status === filter)
                .filter(l => (l?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l?.phone || '').includes(searchTerm))
                .map(lead => (
                  <div key={lead.id} className="bg-[#111] p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-green-500/30 transition-all flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-black text-lg text-white mb-1">{lead.name}</h4>
                          <p className="text-xs font-mono text-gray-500">{lead.phone}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${lead.status === 'converted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          lead.status === 'contacted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                          {lead.status}
                        </span>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-white/5">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Visit Date</p>
                        <p className="text-sm font-medium text-gray-300">{new Date(lead.visitDate).toLocaleDateString()}</p>
                        {lead.referredBy && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Referred By</p>
                            <p className="text-xs font-bold text-blue-400">{members.find(m => m.id === lead.referredBy)?.name || lead.referredBy}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {lead.status !== 'converted' && (
                      <div className="mt-6 flex gap-3">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.name}, thanks for visiting Dolphin Gym! We'd love to have you join. Here is a 15% discount for your first month: WELCOME15`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white border border-green-500/30 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
                        >
                          <Send size={14} /> Send Offer
                        </a>
                      </div>
                    )}
                  </div>
                ))}

              {(leads || []).filter(l => filter === 'all' || l?.status === filter).length === 0 && (
                <div className="col-span-full py-16 text-center flex flex-col items-center gap-5 opacity-40 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                  <UserPlus size={48} className="text-gray-500" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">No leads found</p>
                </div>
              )}
            </div>
          )}

          {activeSubView === 'pins' && (
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Set a 4-digit PIN for each member so they can check in at the kiosk without scanning a QR.</p>
              {(members || []).filter(m => m?.role === 'member').map(member => (
                <div key={member.id} className="flex items-center justify-between p-5 bg-[#111] rounded-[2rem] border border-white/5 hover:border-purple-500/20 transition-all gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-black text-lg uppercase border border-purple-500/20 shrink-0">{(member.name || '?')[0]}</div>
                    <div className="truncate">
                      <p className="font-black text-sm uppercase tracking-tight truncate">{member.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-9 rounded-lg border flex items-center justify-center text-lg font-black transition-all
                          ${member.accessPin && member.accessPin[i] ? 'border-purple-500/50 text-purple-300 bg-purple-500/10' : 'border-white/10 text-gray-700'}`}>
                          {member.accessPin?.[i] || '–'}
                        </div>
                      ))}
                    </div>
                    <input
                      type="text" maxLength={4} inputMode="numeric" pattern="[0-9]*"
                      value={editingPin[member.id] ?? member.accessPin ?? ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setEditingPin(prev => ({ ...prev, [member.id]: val }));
                      }}
                      placeholder="____"
                      className="w-20 bg-black border border-purple-500/30 rounded-xl py-2 px-3 text-center text-lg font-black tracking-widest focus:border-purple-500 focus:outline-none text-purple-300 placeholder:text-gray-700"
                    />
                    <button
                      onClick={async () => {
                        const pin = editingPin[member.id];
                        if (pin && pin.length === 4) {
                          await updateMemberPin(member.id, pin);
                          setEditingPin(prev => { const n = { ...prev }; delete n[member.id]; return n; });
                        }
                      }}
                      disabled={!editingPin[member.id] || editingPin[member.id].length !== 4}
                      className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-95"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSubView !== 'financials' && activeSubView !== 'analytics' && activeSubView !== 'leads' && activeSubView !== 'pins' && (activeSubView === 'players' ? filteredMembers : filteredEquipment).length === 0 && (
            <div className="col-span-1 lg:col-span-2 py-16 text-center flex flex-col items-center gap-5 opacity-40 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
              <Info size={48} className="text-gray-500" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">No records found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Shared Modal for Players & Equipment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4 sm:p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#111] w-full max-w-lg rounded-[3rem] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl sm:text-2xl blue-gradient uppercase tracking-widest">{editingItem ? t.update : (activeSubView === 'players' ? t.addMember : t.addEquipment)}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              {activeSubView === 'players' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.memberName}</label>
                    <input type="text" value={playerForm.name} onChange={e => setPlayerForm({ ...playerForm, name: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-700" placeholder="Enter member name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.email}</label>
                    <input type="email" value={playerForm.email} onChange={e => setPlayerForm({ ...playerForm, email: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-700" placeholder="member@example.com" />
                  </div>
                  {!editingItem && (
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Password</label>
                      <input type="password" value={playerForm.password || ''} onChange={e => setPlayerForm({ ...playerForm, password: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-700" placeholder="••••••••" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Member Role</label>
                    <select
                      className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                      value={playerForm.role}
                      onChange={(e) => setPlayerForm({ ...playerForm, role: e.target.value as 'member' | 'trainer' })}
                    >
                      <option value="member">Player / Member</option>
                      <option value="trainer">Trainer</option>
                    </select>
                  </div>
                  {playerForm.role === 'member' && (
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Subscription Price ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        className="w-full bg-[#111] border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
                        value={playerForm.subscriptionPrice}
                        onChange={(e) => setPlayerForm({ ...playerForm, subscriptionPrice: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{t.paymentMethod}</label>
                    <select value={playerForm.paymentMethod} onChange={e => setPlayerForm({ ...playerForm, paymentMethod: e.target.value as PaymentMethod })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer text-gray-300">
                      <option value="cash">{t.cash}</option>
                      <option value="click">{t.click}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.startDate}</label>
                      <input type="date" value={playerForm.startDate} onChange={e => setPlayerForm({ ...playerForm, startDate: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.endDate}</label>
                      <input type="date" value={playerForm.endDate} onChange={e => setPlayerForm({ ...playerForm, endDate: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-300" />
                    </div>
                  </div>
                </>
              )}
              {activeSubView === 'equipment' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.equipmentName} (EN)</label>
                      <input type="text" value={eqForm.nameEn} onChange={e => setEqForm({ ...eqForm, nameEn: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none transition-all" placeholder="Treadmill" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.equipmentName} (AR)</label>
                      <input type="text" value={eqForm.nameAr} onChange={e => setEqForm({ ...eqForm, nameAr: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-arabic focus:border-blue-500 focus:outline-none transition-all" placeholder="جهاز مشي" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.category}</label>
                      <select value={eqForm.category} onChange={e => setEqForm({ ...eqForm, category: e.target.value as EquipmentCategory })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer">
                        <option value="strength">{t.strength}</option>
                        <option value="cardio">{t.cardio}</option>
                        <option value="flexibility">{t.flexibility}</option>
                        <option value="weights">{t.weights}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.status}</label>
                      <select value={eqForm.status} onChange={e => setEqForm({ ...eqForm, status: e.target.value as EquipmentStatus })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer">
                        <option value="available">{t.available}</option>
                        <option value="maintenance">{t.maintenance}</option>
                        <option value="broken">{t.broken}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">{t.quantity}</label>
                    <input type="number" min="1" value={eqForm.quantity} onChange={e => setEqForm({ ...eqForm, quantity: parseInt(e.target.value) })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                </>
              )}
              {activeSubView === 'financials' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Expense Description</label>
                    <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none transition-all" placeholder="e.g. Monthly Rent, Electricity Bill" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Category</label>
                      <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none appearance-none cursor-pointer text-gray-300">
                        <option value="rent">🏢 Rent</option>
                        <option value="salary">👥 Salaries</option>
                        <option value="utilities">⚡ Utilities</option>
                        <option value="maintenance">🔧 Maintenance</option>
                        <option value="marketing">📢 Marketing</option>
                        <option value="other">📝 Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Amount ($)</label>
                      <input type="number" min="1" value={expenseForm.amount || ''} onChange={e => setExpenseForm({ ...expenseForm, amount: parseInt(e.target.value) || 0 })} className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 sm:py-5 px-5 text-sm sm:text-base font-medium focus:border-blue-500 focus:outline-none transition-all text-red-400" placeholder="0" />
                    </div>
                  </div>
                </>
              )}

              <button onClick={handleSubmit} className="w-full py-5 sm:py-6 blue-bg blue-glow rounded-3xl text-white font-black text-lg sm:text-xl mt-8 uppercase tracking-widest active:scale-[0.98] transition-all hover:brightness-110 shadow-xl">
                {editingItem ? t.update : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={logout} className="w-full max-w-sm mx-auto py-4 sm:py-5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 text-xs sm:text-sm mt-8">
        <LogOut size={20} />
        {t.logout}
      </button>
    </div>
  );
};

export default AdminView;
