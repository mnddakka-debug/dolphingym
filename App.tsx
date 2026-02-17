
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

const NavigationHandler: React.FC = () => {
  const { user, activeTab } = useApp();

  // If no user is authenticated, show the Auth screen
  if (!user) {
    return <Auth />;
  }

  return (
    <Layout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'workouts' && <WorkoutView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'coach' && <CoachView />}
      {activeTab === 'stats' && <StatsView />}
      {activeTab === 'settings' && <SettingsView />}
      {activeTab === 'admin' && (
        user.role === 'admin' ? <AdminView /> : <TrainerView />
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <NavigationHandler />
    </AppProvider>
  );
};

export default App;
