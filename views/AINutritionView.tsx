import React, { useState } from 'react';
import { Utensils, Droplets, Flame, Apple, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

const MOCK_MEALS = [
    { nameEn: 'Grilled Chicken & Quinoa', nameAr: 'دجاج مشوي مع كينوا', protein: '45g', carbs: '30g', fat: '10g', calories: 400 },
    { nameEn: 'Salmon & Asparagus', nameAr: 'سلمون مع هليون', protein: '35g', carbs: '10g', fat: '20g', calories: 350 },
    { nameEn: 'Whey Protein Shake (Banana)', nameAr: 'مخفوق بروتين مصل اللبن (موز)', protein: '30g', carbs: '25g', fat: '2g', calories: 230 },
];

const AINutritionView: React.FC = () => {
    const { language, weightEntries } = useApp();
    const t = TRANSLATIONS[language];

    const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : 75;
    const targetProtein = Math.round(currentWeight * 2.2); // approx 2.2g per kg

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500 flex items-center gap-3">
                    <Utensils className="text-emerald-400" size={32} />
                    {t.smartNutrition || 'Smart Nutrition'}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Droplets className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Daily Water' : 'الماء اليومي'}</p>
                        <p className="text-2xl font-bold">3.5 L</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Flame className="text-orange-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Caloric Target' : 'الهدف للسعرات'}</p>
                        <p className="text-2xl font-bold">2,400 kcal</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <Activity className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Protein Target' : 'الهدف للبروتين'}</p>
                        <p className="text-2xl font-bold">{targetProtein}g</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Apple className="text-red-400" />
                    {language === 'en' ? 'AI Recommended Post-Workout Meals' : 'وجبات مقترحة بعد التمرين بالذكاء الاصطناعي'}
                </h2>
                <p className="text-slate-400 mb-6">
                    {language === 'en'
                        ? 'Based on your recent "Alpha Strength" workout, we recommend high protein for muscle recovery.'
                        : 'بناءً على تمرين "قوة الألفا" الأخير، نقترح وجبات غنية بالبروتين للاستشفاء العضلي.'}
                </p>

                <div className="space-y-4">
                    {MOCK_MEALS.map((meal, idx) => (
                        <div key={idx} className="bg-slate-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700">
                            <div>
                                <h3 className="font-bold text-lg">{language === 'en' ? meal.nameEn : meal.nameAr}</h3>
                                <div className="flex gap-4 text-sm text-slate-400 mt-1">
                                    <span>💪 {meal.protein} Protein</span>
                                    <span>🍞 {meal.carbs} Carbs</span>
                                    <span>🥑 {meal.fat} Fat</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-full">
                                    {meal.calories} kcal
                                </span>
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    {language === 'en' ? 'Log Meal' : 'تسجيل الوجبة'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AINutritionView;
