
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
import AttendanceView from './views/AttendanceView';
import PlansView from './views/PlansView';
import StoreView from './views/StoreView';
import MessagesView from './views/MessagesView';
import ChallengesView from './views/ChallengesView';
import KioskView from './views/KioskView';
import MarketplaceView from './views/MarketplaceView';
import TrainerDashboard from './views/TrainerDashboard';
import SocialView from './views/SocialView';
import MaintenanceView from './views/MaintenanceView';
import VODView from './views/VODView';
import LiveTrainingView from './views/LiveTrainingView';
import PartnerMatchView from './views/PartnerMatchView';
import ProgressVaultView from './views/ProgressVaultView';
import FloorPlanView from './views/FloorPlanView';
import AIFormView from './views/AIFormView';
import AINutritionView from './views/AINutritionView';
import LeaderboardView from './views/LeaderboardView';
import TrainerPayrollView from './views/TrainerPayrollView';
import GymSquadsView from './views/GymSquadsView';
import ChurnPredictorView from './views/ChurnPredictorView';
import CoachDolphinChat from './components/CoachDolphinChat';
import HubView from './views/HubView';

const NavigationHandler: React.FC = () => {
  const { user, activeTab, kioskMode, isAuthLoading } = useApp();

  if (kioskMode) return <KioskView />;

  // Show a centered spinner while Firebase is checking the session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-blue-400 text-sm font-bold tracking-widest uppercase animate-pulse">Dolphin Gym</p>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <Layout>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'workouts' && <WorkoutView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'coach' && <CoachView />}
      {activeTab === 'stats' && <StatsView />}
      {activeTab === 'settings' && <SettingsView />}
      {activeTab === 'attendance' && <AttendanceView />}
      {activeTab === 'plans' && <PlansView />}
      {activeTab === 'store' && <StoreView />}
      {activeTab === 'store' && <StoreView />}
      {activeTab === 'messages' && <MessagesView />}
      {activeTab === 'challenges' && <ChallengesView />}
      {activeTab === 'vod' && <VODView />}
      {activeTab === 'live' && <LiveTrainingView />}
      {activeTab === 'maintenance' && <MaintenanceView />}
      {activeTab === 'marketplace' && <MarketplaceView />}
      {activeTab === 'trainer_dashboard' && <TrainerDashboard />}
      {activeTab === 'matchmaker' && <PartnerMatchView />}
      {activeTab === 'progress_vault' && <ProgressVaultView />}
      {activeTab === 'floor_plan' && <FloorPlanView />}
      {activeTab === 'community' && <SocialView />}
      {activeTab === 'ai_form' && <AIFormView />}
      {activeTab === 'nutrition' && <AINutritionView />}
      {activeTab === 'leaderboard_view' && <LeaderboardView />}
      {activeTab === 'payroll' && <TrainerPayrollView />}
      {activeTab === 'squads' && <GymSquadsView />}
      {activeTab === 'churn_predictor' && <ChurnPredictorView />}
      {activeTab === 'hub' && <HubView />}
      {activeTab === 'admin' && (
        user.role === 'admin' ? <AdminView /> : <TrainerView />
      )}

      {/* Global AI Chatbot Widget */}
      <CoachDolphinChat />
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
