import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TRANSLATIONS } from '../constants';
const AppContext = createContext(undefined);
export const AppProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [theme] = useState('dark');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [members, setMembers] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
    const [expiryDays, setExpiryDaysState] = useState(7);
    const t = TRANSLATIONS[language];
    // Persistent data check with error handling
    useEffect(() => {
        try {
            const savedLang = localStorage.getItem('gym_lang');
            if (savedLang)
                setLanguage(savedLang);
            const savedUser = localStorage.getItem('gym_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            }
            const savedNotify = localStorage.getItem('gym_notify');
            if (savedNotify)
                setNotificationsEnabledState(savedNotify === 'true');
            const savedExpiryDays = localStorage.getItem('gym_expiry_days');
            if (savedExpiryDays)
                setExpiryDaysState(parseInt(savedExpiryDays, 10));
            const savedMembers = localStorage.getItem('gym_members');
            if (savedMembers) {
                setMembers(JSON.parse(savedMembers));
            }
            else {
                const initialMembers = [
                    {
                        id: 'm1', name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'member', status: 'active',
                        points: 1200, badges: [], memberSince: '2023-01-01',
                        subscriptionStartDate: '2024-01-01', subscriptionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                        paymentMethod: 'cash'
                    },
                    {
                        id: 'm2', name: 'John Doe', email: 'john@example.com', role: 'member', status: 'active',
                        points: 800, badges: [], memberSince: '2023-05-15',
                        subscriptionStartDate: '2024-02-01', subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        paymentMethod: 'click'
                    }
                ];
                setMembers(initialMembers);
                localStorage.setItem('gym_members', JSON.stringify(initialMembers));
            }
            const savedEq = localStorage.getItem('gym_equipment');
            if (savedEq) {
                setEquipment(JSON.parse(savedEq));
            }
            else {
                const initialEq = [
                    { id: 'eq1', nameEn: 'Treadmill X-Pro', nameAr: 'جهاز جري برو', category: 'cardio', status: 'available', lastMaintenance: '2024-04-10', purchaseDate: '2023-12-01', quantity: 5 },
                    { id: 'eq2', nameEn: 'Bench Press', nameAr: 'جهاز الصدر', category: 'strength', status: 'maintenance', lastMaintenance: '2024-05-01', purchaseDate: '2023-11-15', quantity: 2 },
                    { id: 'eq3', nameEn: 'Dumbbells Set', nameAr: 'مجموعة دمبل', category: 'weights', status: 'available', lastMaintenance: '2024-01-20', purchaseDate: '2024-01-01', quantity: 1 },
                ];
                setEquipment(initialEq);
                localStorage.setItem('gym_equipment', JSON.stringify(initialEq));
            }
        }
        catch (e) {
            console.error("Failed to recover persistent state", e);
            localStorage.clear();
        }
    }, []);
    const sendBrowserNotification = useCallback((title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png'
            });
        }
    }, []);
    useEffect(() => {
        if (notificationsEnabled && user) {
            if (user.role === 'admin' || user.role === 'trainer') {
                const expiring = getExpiringMembers();
                if (expiring.length > 0) {
                    const msg = t.adminExpiryMsg
                        .replace('{{count}}', expiring.length.toString())
                        .replace('{{days}}', expiryDays.toString());
                    sendBrowserNotification(t.notifyTitle, msg);
                }
            }
            else if (user.role === 'member' && user.subscriptionEndDate) {
                const end = new Date(user.subscriptionEndDate).getTime();
                const now = Date.now();
                const diff = end - now;
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                if (daysLeft > 0 && daysLeft <= expiryDays) {
                    const msg = t.memberExpiryMsg.replace('{{days}}', daysLeft.toString());
                    sendBrowserNotification(t.notifyTitle, msg);
                }
            }
        }
    }, [notificationsEnabled, members, expiryDays, user, language]);
    const triggerTestNotification = () => {
        if (notificationsEnabled) {
            sendBrowserNotification(t.notifyTitle, t.testNotifyMsg);
        }
        else {
            setNotificationsEnabled(true);
            setTimeout(() => sendBrowserNotification(t.notifyTitle, t.testNotifyMsg), 1000);
        }
    };
    const setNotificationsEnabled = (enabled) => {
        if (enabled && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setNotificationsEnabledState(true);
                    localStorage.setItem('gym_notify', 'true');
                }
            });
        }
        else {
            setNotificationsEnabledState(enabled);
            localStorage.setItem('gym_notify', enabled.toString());
        }
    };
    const setExpiryDays = (days) => {
        setExpiryDaysState(days);
        localStorage.setItem('gym_expiry_days', days.toString());
    };
    const addMember = (newMemberData) => {
        if (user?.role !== 'admin')
            return;
        const newMember = {
            id: Math.random().toString(36).substr(2, 9),
            name: newMemberData.name || 'New Member',
            email: newMemberData.email || '',
            role: 'member',
            status: 'active',
            points: 0,
            badges: [],
            memberSince: new Date().toISOString(),
            subscriptionStartDate: newMemberData.subscriptionStartDate || new Date().toISOString(),
            subscriptionEndDate: newMemberData.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: newMemberData.paymentMethod || 'cash',
        };
        const updated = [...members, newMember];
        setMembers(updated);
        localStorage.setItem('gym_members', JSON.stringify(updated));
    };
    const updateMember = (id, updates) => {
        if (user?.role !== 'admin' && user?.role !== 'trainer')
            return;
        const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
        setMembers(updated);
        localStorage.setItem('gym_members', JSON.stringify(updated));
    };
    const deleteMember = (id) => {
        if (user?.role !== 'admin')
            return;
        const updated = members.filter(m => m.id !== id);
        setMembers(updated);
        localStorage.setItem('gym_members', JSON.stringify(updated));
    };
    const addEquipment = (newEqData) => {
        if (user?.role !== 'admin')
            return;
        const newEq = {
            id: Math.random().toString(36).substr(2, 9),
            nameEn: newEqData.nameEn || 'New Device',
            nameAr: newEqData.nameAr || 'جهاز جديد',
            category: newEqData.category || 'strength',
            status: newEqData.status || 'available',
            lastMaintenance: new Date().toISOString().split('T')[0],
            purchaseDate: new Date().toISOString().split('T')[0],
            quantity: newEqData.quantity || 1,
        };
        const updated = [...equipment, newEq];
        setEquipment(updated);
        localStorage.setItem('gym_equipment', JSON.stringify(updated));
    };
    const updateEquipment = (id, updates) => {
        if (user?.role !== 'admin')
            return;
        const updated = equipment.map(e => e.id === id ? { ...e, ...updates } : e);
        setEquipment(updated);
        localStorage.setItem('gym_equipment', JSON.stringify(updated));
    };
    const deleteEquipment = (id) => {
        if (user?.role !== 'admin')
            return;
        const updated = equipment.filter(e => e.id !== id);
        setEquipment(updated);
        localStorage.setItem('gym_equipment', JSON.stringify(updated));
    };
    const getExpiringMembers = () => {
        const now = Date.now();
        const range = expiryDays * 24 * 60 * 60 * 1000;
        return members.filter(m => {
            if (!m.subscriptionEndDate)
                return false;
            const end = new Date(m.subscriptionEndDate).getTime();
            return end > now && (end - now) <= range;
        });
    };
    const handleSetLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('gym_lang', lang);
    };
    const login = (email, role = 'admin') => {
        const newUser = {
            id: role === 'admin' ? 'admin-1' : role === 'trainer' ? 'trainer-1' : 'member-test-1',
            name: role === 'admin' ? 'Gym Manager' : role === 'trainer' ? 'Coach Sarah' : 'Alex Thompson',
            email,
            role,
            status: 'active',
            memberSince: new Date().toISOString(),
            points: role === 'member' ? 8450 : 25000,
            badges: role === 'member' ? ['b1', 'b2'] : [],
            subscriptionEndDate: role === 'member'
                ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'cash'
        };
        setUser(newUser);
        localStorage.setItem('gym_user', JSON.stringify(newUser));
        if (role === 'admin' || role === 'trainer')
            setActiveTab('admin');
        else
            setActiveTab('dashboard');
    };
    const updateCurrentUserProfile = (updates) => {
        if (!user)
            return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('gym_user', JSON.stringify(updatedUser));
    };
    const addPoints = (amount) => {
        if (!user)
            return;
        const updatedUser = { ...user, points: user.points + amount };
        setUser(updatedUser);
        localStorage.setItem('gym_user', JSON.stringify(updatedUser));
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('gym_user');
        setActiveTab('dashboard');
    };
    return (_jsx(AppContext.Provider, { value: {
            language, setLanguage: handleSetLanguage, theme, user,
            members, equipment, addMember, updateMember, deleteMember,
            addEquipment, updateEquipment, deleteEquipment,
            login, logout, activeTab, setActiveTab, addPoints, getExpiringMembers,
            notificationsEnabled, setNotificationsEnabled, expiryDays, setExpiryDays,
            triggerTestNotification, updateCurrentUserProfile
        }, children: children }));
};
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context)
        throw new Error('useApp must be used within AppProvider');
    return context;
};
