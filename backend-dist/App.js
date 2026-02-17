import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Auth from './views/Auth';
import Dashboard from './views/Dashboard';
import WorkoutView from './views/WorkoutView';
import CoachView from './views/CoachView';
import StatsView from './views/StatsView';
import AdminView from './views/AdminView';
import TrainerView from './views/TrainerView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
const NavigationHandler = () => {
    const { user, activeTab } = useApp();
    // If no user is authenticated, show the Auth screen
    if (!user) {
        return _jsx(Auth, {});
    }
    return (_jsxs(Layout, { children: [activeTab === 'dashboard' && _jsx(Dashboard, {}), activeTab === 'workouts' && _jsx(WorkoutView, {}), activeTab === 'history' && _jsx(HistoryView, {}), activeTab === 'coach' && _jsx(CoachView, {}), activeTab === 'stats' && _jsx(StatsView, {}), activeTab === 'settings' && _jsx(SettingsView, {}), activeTab === 'admin' && (user.role === 'admin' ? _jsx(AdminView, {}) : _jsx(TrainerView, {}))] }));
};
const App = () => {
    return (_jsx(AppProvider, { children: _jsx(NavigationHandler, {}) }));
};
export default App;
