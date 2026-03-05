import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { DollarSign, Users, ShoppingBag, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TrainerDashboard: React.FC = () => {
    const { user, language, marketplacePlans, transactions } = useApp();
    const t = TRANSLATIONS[language];

    if (!user || user.role !== 'freelance_trainer') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>;
    }

    // Calculations
    const trainerTransactions = transactions.filter(tx => tx.trainerId === user.id);
    const trainerPlans = marketplacePlans.filter(p => p.trainerId === user.id);

    const totalEarnings = trainerTransactions.reduce((sum, tx) => sum + tx.trainerEarnings, 0);
    const totalSales = trainerTransactions.length;

    // Group earnings by plan
    const earningsByPlan = trainerPlans.map(plan => {
        const salesCount = trainerTransactions.filter(tx => tx.planId === plan.id).length;
        const revenue = salesCount * (plan.price * 0.80); // 80% to trainer
        return { name: plan.title.substring(0, 15) + '...', revenue, salesCount };
    }).filter(p => p.revenue > 0);

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-20">
            <div className="bg-[#111] p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                <h2 className="text-2xl font-black text-white relative z-10">Welcome, Coach {user.name.split(' ')[0]}</h2>
                <p className="text-gray-400 mt-1 relative z-10">Freelance Trainer Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-green-500/10 rounded-xl">
                        <DollarSign className="text-green-500" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">Total Earnings</p>
                        <p className="text-2xl font-black text-white">${totalEarnings.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-purple-500/10 rounded-xl">
                        <Users className="text-purple-500" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">Total Sales</p>
                        <p className="text-2xl font-black text-white">{totalSales}</p>
                    </div>
                </div>
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-xl">
                        <ShoppingBag className="text-blue-500" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400">Active Plans</p>
                        <p className="text-2xl font-black text-white">{trainerPlans.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-lg min-h-[300px] flex flex-col">
                    <h3 className="font-bold text-gray-400 mb-6 uppercase text-sm tracking-wider">Revenue by Plan</h3>
                    {earningsByPlan.length > 0 ? (
                        <div className="flex-1 w-full relative -left-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={earningsByPlan}>
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontWeight: 900 }}
                                        itemStyle={{ color: '#22c55e' }}
                                    />
                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                        {earningsByPlan.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill="#22c55e" fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-2">
                            <BarChart className="opacity-20" />
                            <p className="text-sm">No sales data yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-lg flex flex-col">
                    <h3 className="font-bold text-gray-400 mb-6 uppercase text-sm tracking-wider flex items-center justify-between">
                        Recent Sales
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {trainerTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {[...trainerTransactions].reverse().slice(0, 10).map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-sm text-white">{tx.planTitle}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Users size={12} /> Bought by: {tx.buyerName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-green-400">+${tx.trainerEarnings.toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-600 mt-1">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <Clock size={32} className="opacity-20 mb-2" />
                                <p className="text-sm">Waiting for your first sale!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
