
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Users, Package, Globe, LogOut, X, Calendar, UserPlus, Bell, Search, Edit2, Trash2, RefreshCw, CheckCircle, AlertCircle, Clock, Send, Banknote, CreditCard, ShieldAlert, Key, Mail, Plus, Hammer, Trash, Info } from 'lucide-react';
import { User, PaymentMethod, Equipment, EquipmentStatus, EquipmentCategory } from '../types';

const AdminView: React.FC = () => {
  const { 
    language, logout, members, equipment, 
    addMember, updateMember, deleteMember,
    addEquipment, updateEquipment, deleteEquipment,
    expiryDays
  } = useApp();
  
  const t = TRANSLATIONS[language];
  const [activeSubView, setActiveSubView] = useState<'players' | 'equipment'>('players');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  // Players Form Data
  const [playerForm, setPlayerForm] = useState({
    name: '',
    email: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash' as PaymentMethod
  });

  // Equipment Form Data
  const [eqForm, setEqForm] = useState({
    nameEn: '',
    nameAr: '',
    category: 'strength' as EquipmentCategory,
    status: 'available' as EquipmentStatus,
    quantity: 1
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

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = (item.nameEn + item.nameAr).toLowerCase().includes(searchTerm.toLowerCase());
      if (filter !== 'all' && item.status !== filter) return false;
      return matchesSearch;
    });
  }, [equipment, searchTerm, filter]);

  const stats = useMemo(() => {
    return {
      totalAssets: equipment.reduce((acc, curr) => acc + curr.quantity, 0),
      broken: equipment.filter(e => e.status === 'broken').length,
      repairing: equipment.filter(e => e.status === 'maintenance').length
    };
  }, [equipment]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeSubView === 'players') {
      setPlayerForm({
        name: '', email: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: 'cash'
      });
    } else {
      setEqForm({
        nameEn: '', nameAr: '',
        category: 'strength', status: 'available', quantity: 1
      });
    }
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeSubView === 'players') {
      setPlayerForm({
        name: item.name, email: item.email,
        startDate: item.subscriptionStartDate?.split('T')[0] || '',
        endDate: item.subscriptionEndDate?.split('T')[0] || '',
        paymentMethod: item.paymentMethod || 'cash'
      });
    } else {
      setEqForm({
        nameEn: item.nameEn, nameAr: item.nameAr,
        category: item.category, status: item.status, quantity: item.quantity
      });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (activeSubView === 'players') {
      if (!playerForm.name) return;
      if (editingItem) updateMember(editingItem.id, playerForm);
      else addMember(playerForm);
    } else {
      if (!eqForm.nameEn || !eqForm.nameAr) return;
      if (editingItem) updateEquipment(editingItem.id, eqForm);
      else addEquipment(eqForm);
    }
    setShowModal(false);
  };

  const getStatusStyle = (status: EquipmentStatus) => {
    switch(status) {
      case 'available': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'maintenance': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'broken': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500 pb-12">
      <h1 className="text-2xl font-black blue-gradient uppercase tracking-widest">{t.admin}</h1>

      {/* Sub-View Switcher */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => { setActiveSubView('players'); setFilter('all'); }}
          className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all group ${activeSubView === 'players' ? 'blue-bg border-blue-400 shadow-xl' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
        >
           <Users className={`mb-3 group-hover:scale-110 transition-transform ${activeSubView === 'players' ? 'text-white' : 'text-blue-400'}`} size={28} />
           <span className={`font-black text-xs uppercase tracking-widest ${activeSubView === 'players' ? 'text-white' : 'text-gray-400'}`}>{t.manageUsers}</span>
        </button>
        <button 
          onClick={() => { setActiveSubView('equipment'); setFilter('all'); }}
          className={`flex flex-col items-center justify-center p-5 rounded-3xl border transition-all group ${activeSubView === 'equipment' ? 'blue-bg border-blue-400 shadow-xl' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
        >
           <Package className={`mb-3 group-hover:scale-110 transition-transform ${activeSubView === 'equipment' ? 'text-white' : 'text-blue-400'}`} size={28} />
           <span className={`font-black text-xs uppercase tracking-widest ${activeSubView === 'equipment' ? 'text-white' : 'text-gray-400'}`}>{t.manageEquipment}</span>
        </button>
      </div>

      {/* Dynamic Management Section */}
      <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[2.5rem] shadow-2xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
            {activeSubView === 'players' ? <Users size={18} className="text-blue-400" /> : <Package size={18} className="text-blue-400" />}
            {activeSubView === 'players' ? t.members : t.inventory}
          </h3>
          <button onClick={handleOpenAdd} className="w-10 h-10 rounded-2xl blue-bg flex items-center justify-center text-white blue-glow shadow-lg active:scale-90 transition-all">
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>

        {/* Stats Summary for Equipment */}
        {activeSubView === 'equipment' && (
          <div className="grid grid-cols-3 gap-3 mb-6">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <p className="text-[8px] text-gray-500 font-black uppercase mb-1">{t.totalEquipment}</p>
                <p className="text-lg font-black">{stats.totalAssets}</p>
             </div>
             <div className="bg-orange-500/5 p-3 rounded-2xl border border-orange-500/10 text-center">
                <p className="text-[8px] text-orange-500 font-black uppercase mb-1">{t.maintenanceShort}</p>
                <p className="text-lg font-black text-orange-500">{stats.repairing}</p>
             </div>
             <div className="bg-red-500/5 p-3 rounded-2xl border border-red-500/10 text-center">
                <p className="text-[8px] text-red-500 font-black uppercase mb-1">{t.brokenDevices}</p>
                <p className="text-lg font-black text-red-500">{stats.broken}</p>
             </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input 
              type="text" placeholder={t.searchMembers} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             {activeSubView === 'players' ? (
               ['all', 'active', 'expiring', 'expired'].map(f => (
                 <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'blue-bg border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>{t[f as keyof typeof t.en] || f}</button>
               ))
             ) : (
               ['all', 'available', 'maintenance', 'broken'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${filter === f ? 'blue-bg border-blue-400 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>{t[f as keyof typeof t.en] || f}</button>
               ))
             )}
          </div>
        </div>

        {/* Data List */}
        <div className="space-y-3">
          {activeSubView === 'players' ? (
            filteredMembers.map(member => (
              <div key={member.id} className="p-4 bg-[#111] rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black text-xs uppercase">{member.name[0]}</div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{member.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <p className="text-[10px] text-gray-500 font-bold">{member.email}</p>
                       <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded uppercase font-black text-blue-400/60 border border-white/5">{member.paymentMethod === 'click' ? t.click : t.cash}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(member)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Edit2 size={14} className="text-gray-400" /></button>
                  <button onClick={() => deleteMember(member.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))
          ) : (
            filteredEquipment.map(item => (
              <div key={item.id} className="p-4 bg-[#111] rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-blue-500/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                       <Hammer size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">{language === 'en' ? item.nameEn : item.nameAr}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{t[item.category]} • {t.quantity}: {item.quantity}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${getStatusStyle(item.status)}`}>{t[item.status]}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                   <div className="flex items-center gap-2">
                      <Clock size={12} className="text-gray-500" />
                      <span className="text-[9px] text-gray-500 font-bold uppercase">{t.lastMaintenance}: {item.lastMaintenance}</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"><Edit2 size={12} /></button>
                      <button onClick={() => deleteEquipment(item.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"><Trash size={12} className="text-red-500" /></button>
                   </div>
                </div>
              </div>
            ))
          )}
          {(activeSubView === 'players' ? filteredMembers : filteredEquipment).length === 0 && (
            <div className="py-12 text-center flex flex-col items-center gap-4 opacity-40">
               <Info size={40} />
               <p className="text-xs font-bold uppercase tracking-[0.2em]">No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Shared Modal for Players & Equipment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
          <div className="bg-[#111] w-full max-w-sm rounded-[3rem] border border-white/10 p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl blue-gradient uppercase tracking-widest">{editingItem ? t.update : (activeSubView === 'players' ? t.addMember : t.addEquipment)}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-5">
              {activeSubView === 'players' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.memberName}</label>
                    <input type="text" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.email}</label>
                    <input type="email" value={playerForm.email} onChange={e => setPlayerForm({...playerForm, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.startDate}</label>
                      <input type="date" value={playerForm.startDate} onChange={e => setPlayerForm({...playerForm, startDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-3 text-xs focus:border-blue-500 focus:outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.endDate}</label>
                      <input type="date" value={playerForm.endDate} onChange={e => setPlayerForm({...playerForm, endDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-3 text-xs focus:border-blue-500 focus:outline-none transition-all" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.equipmentName} (EN)</label>
                    <input type="text" value={eqForm.nameEn} onChange={e => setEqForm({...eqForm, nameEn: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.equipmentName} (AR)</label>
                    <input type="text" value={eqForm.nameAr} onChange={e => setEqForm({...eqForm, nameAr: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-arabic focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.category}</label>
                      <select value={eqForm.category} onChange={e => setEqForm({...eqForm, category: e.target.value as EquipmentCategory})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-3 text-xs focus:border-blue-500 focus:outline-none appearance-none">
                         <option value="strength">{t.strength}</option>
                         <option value="cardio">{t.cardio}</option>
                         <option value="flexibility">{t.flexibility}</option>
                         <option value="weights">{t.weights}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.status}</label>
                      <select value={eqForm.status} onChange={e => setEqForm({...eqForm, status: e.target.value as EquipmentStatus})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-3 text-xs focus:border-blue-500 focus:outline-none appearance-none">
                         <option value="available">{t.available}</option>
                         <option value="maintenance">{t.maintenance}</option>
                         <option value="broken">{t.broken}</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">{t.quantity}</label>
                    <input type="number" min="1" value={eqForm.quantity} onChange={e => setEqForm({...eqForm, quantity: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:border-blue-500 focus:outline-none transition-all" />
                  </div>
                </>
              )}

              <button onClick={handleSubmit} className="w-full py-5 blue-bg blue-glow rounded-3xl text-white font-black text-lg mt-6 uppercase tracking-widest active:scale-[0.98] transition-all">
                {editingItem ? t.update : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={logout} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 text-xs">
        <LogOut size={18} />
        {t.logout}
      </button>
    </div>
  );
};

export default AdminView;
