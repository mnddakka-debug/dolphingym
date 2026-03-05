import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { Wrench, CheckCircle2, Search, Filter, AlertTriangle, Plus, X } from 'lucide-react';
import { MaintenanceReport, Equipment } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const MaintenanceView: React.FC = () => {
    const { language, user, equipment, maintenanceReports, addMaintenanceReport, updateMaintenanceReport } = useApp();
    const t = TRANSLATIONS[language];

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedEqId, setSelectedEqId] = useState<string>('');
    const [issueDesc, setIssueDesc] = useState('');

    // Protect route
    if (user?.role !== 'admin' && user?.role !== 'trainer') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertTriangle size={48} className="text-red-500 mb-4 opacity-50" />
                <p className="text-gray-500 font-bold">Access Restricted</p>
            </div>
        );
    }

    const filteredReports = maintenanceReports.filter(report => {
        const eq = equipment.find(e => e.id === report.equipmentId);
        const matchesSearch = eq?.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq?.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEqId || !issueDesc) return;
        addMaintenanceReport({
            equipmentId: selectedEqId,
            description: issueDesc,
            status: 'pending'
        });
        setShowReportModal(false);
        setSelectedEqId('');
        setIssueDesc('');
    };

    const statusColors = {
        pending: 'bg-red-500/10 text-red-500 border-red-500/20',
        in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        resolved: 'bg-green-500/10 text-green-500 border-green-500/20'
    };

    const statusLabels = {
        pending: 'Pending',
        in_progress: 'In Progress',
        resolved: 'Resolved'
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                        <Wrench className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-white">Maintenance</h1>
                        <p className="text-[10px] sm:text-xs text-orange-400/80 font-black uppercase tracking-widest mt-1">Equipment Service Log</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowReportModal(true)}
                    className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95 shadow-lg shadow-orange-500/20"
                >
                    <Plus size={16} /> Report Issue
                </button>
            </div>

            {/* Filters and Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search reports or equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/30 transition-colors"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-[#111] rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar">
                    {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status as any)}
                            className={`flex-1 py-2 px-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === status
                                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                    : 'text-gray-500 hover:text-white border border-transparent'
                                }`}
                        >
                            {statusLabels[status as keyof typeof statusLabels] || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredReports.map((report) => {
                        const eq = equipment.find(e => e.id === report.equipmentId);
                        return (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#111] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-5 md:items-center justify-between group hover:border-orange-500/30 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${statusColors[report.status]}`}>
                                        {report.status === 'resolved' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-base text-white">{eq?.nameEn || 'Unknown Equipment'}</h3>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusColors[report.status]}`}>
                                                {statusLabels[report.status]}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-3">{report.description}</p>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            <span>Reported by: {report.reportedByName}</span>
                                            <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 self-end md:self-auto">
                                    {report.status === 'pending' && (
                                        <button
                                            onClick={() => updateMaintenanceReport(report.id, { status: 'in_progress' })}
                                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 transition-colors"
                                        >
                                            Mark In Progress
                                        </button>
                                    )}
                                    {report.status === 'in_progress' && (
                                        <button
                                            onClick={() => updateMaintenanceReport(report.id, { status: 'resolved' })}
                                            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-colors"
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredReports.length === 0 && (
                    <div className="bg-[#111] border border-white/5 rounded-3xl py-20 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 size={48} className="text-green-500/40 mb-4" />
                        <h3 className="text-white font-bold mb-2">Everything is operational</h3>
                        <p className="text-sm text-gray-500">No maintenance reports found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* New Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-lg font-black uppercase tracking-widest">Report Issue</h2>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="p-6 flex flex-col gap-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Equipment</label>
                                <select
                                    required
                                    value={selectedEqId}
                                    onChange={e => setSelectedEqId(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50"
                                >
                                    <option value="" disabled>-- Select Device --</option>
                                    {equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.nameEn} - {eq.status.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={issueDesc}
                                    onChange={e => setIssueDesc(e.target.value)}
                                    placeholder="Describe the problem in detail..."
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/5">
                                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceView;
