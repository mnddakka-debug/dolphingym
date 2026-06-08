import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { ShieldAlert, AlertTriangle, UserMinus, Send, Mail } from 'lucide-react';

const ChurnPredictorView: React.FC = () => {
    const { language, getAtRiskMembers, pushNotification } = useApp();
    const t = TRANSLATIONS[language];
    const atRiskMembers = getAtRiskMembers();

    const [selectedMember, setSelectedMember] = useState<string | null>(null);

    const handleSendDiscount = (memberId: string, memberName: string) => {
        pushNotification(
            language === 'en' ? 'We Miss You! 20% OFF' : 'اشتقنالك! خصم ٢٠٪',
            language === 'en'
                ? `Hi ${memberName}, we noticed you haven't been around much. Come back and enjoy 20% off your next month!`
                : `أهلاً ${memberName}، لاحظنا غيابك مؤخراً. يسعدنا تقديم خصم ٢٠٪ لتشجيعك على العودة للتمرين!`,
            'info'
        );
        setSelectedMember(memberId);
        setTimeout(() => setSelectedMember(null), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500 flex items-center gap-3">
                    <ShieldAlert className="text-red-400" size={32} />
                    {t.churnPredictor || 'Churn Predictor'}
                </h1>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-orange-400" />
                    {language === 'en' ? 'Members At Risk' : 'أعضاء معرضون للانسحاب'}
                </h2>

                {atRiskMembers.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        {language === 'en' ? 'No members currently at high risk of churning. Great job!' : 'لا يوجد أعضاء معرضين للانسحاب حالياً. عمل رائع!'}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/*
                          IMPORTANT: If you use Recharts or any chart library, make sure the parent container has a fixed height and width (not -1).
                          Example: style={{ minHeight: 300, minWidth: 300 }}
                        */}
                        {atRiskMembers.map(({ member, riskLevel, reason }) =>
                          member ? (
                            <div key={member.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${riskLevel === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                                        riskLevel === 'Medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                        }`}>
                                        {riskLevel === 'High' ? <UserMinus size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-200">{member.name}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{member.phone}  {member.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${riskLevel === 'High' ? 'bg-red-500/10 text-red-400' :
                                                riskLevel === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                                                    'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {riskLevel} Risk
                                            </span>
                                            <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-slate-800">
                                                {reason}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto">
                                    <button
                                        onClick={() => handleSendDiscount(member.id, member.name)}
                                        disabled={selectedMember === member.id}
                                        className={`w-full md:w-auto px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedMember === member.id
                                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed border border-green-500/30'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                            }`}
                                    >
                                        {selectedMember === member.id ? (
                                            <>Sent! <Send size={16} /></>
                                        ) : (
                                            <>
                                                <Mail size={16} />
                                                {language === 'en' ? 'Offer 20% Discount' : ''}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                          ) : null
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChurnPredictorView;
