import React, { useState } from 'react';
import { Wallet, Clock, DollarSign, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const TrainerPayrollView: React.FC = () => {
    const { language, user, trainerShifts, addTrainerShift, payrollRecords, generatePayroll } = useApp();
    const t = TRANSLATIONS[language];

    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // If viewing as admin, could select trainer. But this view assumes trainer context for now, or admin viewing self if trainer.
    // We'll just show data for the currently logged in user (assumed to be a trainer/admin).
    const myShifts = trainerShifts.filter(s => s.trainerId === user?.id && s.startTime.startsWith(selectedMonth));
    const myPayroll = payrollRecords.find(p => p.trainerId === user?.id && p.monthString === selectedMonth);

    const handleClockIn = () => {
        addTrainerShift({
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // Mock 8 hour shift
            hourlyRate: 15
        });
    };

    const handleGenerate = () => {
        if (user?.id) {
            generatePayroll(user.id, selectedMonth);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 flex items-center gap-3">
                    <Wallet className="text-green-400" size={32} />
                    {t.trainerPayroll || 'Trainer Payroll'}
                </h1>
                <div className="flex gap-2">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-3">
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="text-cyan-400" />
                                {language === 'en' ? 'My Shifts' : 'مناوباتي'}
                            </h2>
                            <button onClick={handleClockIn} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                <Plus size={16} />
                                {language === 'en' ? 'Add Shift (Mock)' : 'إضافة مناوبة (تجريبي)'}
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {myShifts.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">
                                    {language === 'en' ? 'No shifts recorded for this month.' : 'لا توجد مناوبات مسجلة لهذا الشهر.'}
                                </div>
                            ) : (
                                myShifts.map(s => {
                                    const start = new Date(s.startTime);
                                    const end = new Date(s.endTime);
                                    const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                                    return (
                                        <div key={s.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-slate-200">{start.toLocaleDateString()}</p>
                                                <p className="text-sm text-slate-400">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-cyan-400 font-bold">{hours} {language === 'en' ? 'hrs' : 'ساعة'}</p>
                                                <p className="text-xs text-slate-500">@ ${s.hourlyRate}/hr</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1">
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 rounded-2xl p-6 border border-emerald-500/30 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <DollarSign className="text-emerald-400" />
                                {language === 'en' ? 'Payroll Summary' : 'ملخص الراتب'}
                            </h2>

                            {myPayroll ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-slate-300">
                                        <span>{language === 'en' ? 'Base Salary' : 'الراتب الأساسي'}</span>
                                        <span className="font-medium">${myPayroll.baseSalary.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>{language === 'en' ? 'Shift Hours' : 'مناوبات'}</span>
                                        <span className="font-medium text-cyan-400">+${myPayroll.shiftEarnings.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>{language === 'en' ? 'PT Commissions' : 'عمولات شخصية'}</span>
                                        <span className="font-medium text-purple-400">+${myPayroll.commissionEarnings.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px w-full bg-slate-700 my-4"></div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>{language === 'en' ? 'Total' : 'المجموع'}</span>
                                        <span className="text-emerald-400">${myPayroll.totalEarnings.toFixed(2)}</span>
                                    </div>

                                    <div className={`mt-6 p-3 rounded-lg flex justify-center items-center gap-2 font-bold ${myPayroll.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {myPayroll.status === 'paid' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                        {myPayroll.status.toUpperCase()}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500 cursor-pointer p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition" onClick={handleGenerate}>
                                    <p className="mb-2">{language === 'en' ? 'Payroll not generated yet' : 'لم يتم توليد الراتب'}</p>
                                    <p className="font-bold text-emerald-400 text-sm">Tap to Generate</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerPayrollView;
