
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Language, Theme, User, UserRole, Equipment,
  VideoContent, LiveSession, AttendanceRecord, WorkoutPlan,
  WeightEntry, Reward, RedemptionRecord, Message, AppNotification,
  Challenge, ChallengeEntry, TrainerPlan, Transaction, SocialPost,
  TrainerShift, PayrollRecord, GymSquad, ProgressPhoto, MatchRequest,
  MaintenanceReport, Lead, HelpRequest
} from '../types';
import { TRANSLATIONS } from '../constants';

export interface AppMessage {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  // Core
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  user: User | null;
  members: User[];
  equipment: Equipment[];
  kioskMode: boolean;
  setKioskMode: (v: boolean) => void;
  isAuthLoading: boolean;

  // Members CRUD
  addMember: (member: Partial<User>) => void;
  updateMember: (id: string, updates: Partial<User>) => void;
  deleteMember: (id: string) => void;

  // Equipment CRUD
  addEquipment: (item: Partial<Equipment>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;

  // Auth
  login: (email: string, role?: UserRole, referralCode?: string) => void;
  logout: () => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Points
  addPoints: (amount: number) => void;

  // Notifications (browser)
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  expiryDays: number;
  setExpiryDays: (days: number) => void;
  triggerTestNotification: () => void;
  getExpiringMembers: () => User[];

  // App notifications bell
  appNotifications: AppNotification[];
  markNotifRead: (id: string) => void;
  clearAllNotifs: () => void;

  // Messages
  messages: AppMessage[];
  sendMessage: (toId: string, toName: string, text: string) => void;
  markMessageRead: (id: string) => void;
  getUnreadCount: () => number;

  // Videos (VOD)
  videos: VideoContent[];

  // Live sessions
  liveSessions: LiveSession[];
  joinLiveSession: (id: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  logAttendance: (memberId: string, memberName: string, method?: AttendanceRecord['method']) => void;

  // Workout Plans
  workoutPlans: WorkoutPlan[];
  addWorkoutPlan: (plan: Partial<WorkoutPlan>) => void;
  updateWorkoutPlan: (id: string, updates: Partial<WorkoutPlan>) => void;

  // Weight entries
  weightEntries: WeightEntry[];
  addWeightEntry: (entry: Partial<WeightEntry>) => void;

  // Rewards/Store
  rewards: Reward[];
  redemptions: RedemptionRecord[];
  redeemReward: (rewardId: string) => void;
  addReward: (reward: any) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;

  // Progress Photos
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (photo: Partial<ProgressPhoto>) => void;
  deleteProgressPhoto: (id: string) => void;

  // Social
  socialPosts: SocialPost[];
  addSocialPost: (content: string) => void;
  toggleLikePost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string) => void;

  // Partner Match
  matchRequests: MatchRequest[];
  sendMatchRequest: (toId: string, toName: string) => void;
  acceptMatchRequest: (id: string) => void;

  // Maintenance
  maintenanceReports: MaintenanceReport[];
  addMaintenanceReport: (report: Partial<MaintenanceReport>) => void;
  updateMaintenanceReport: (id: string, updates: Partial<MaintenanceReport>) => void;

  // Marketplace
  marketplacePlans: TrainerPlan[];
  transactions: Transaction[];
  publishPlan: (plan: Partial<TrainerPlan>) => void;
  purchasePlan: (planId: string) => void;

  // Trainer Payroll
  trainerShifts: TrainerShift[];
  payrollRecords: PayrollRecord[];
  addTrainerShift: (shift: Partial<TrainerShift>) => void;
  generatePayroll: (trainerId: string, month: string) => void;

  // Squads
  squads: GymSquad[];
  createSquad: (name: string, description: string) => void;
  joinSquad: (id: string) => void;
  leaveSquad: (id: string) => void;

  // Challenges
  challenges: Challenge[];
  challengeEntries: ChallengeEntry[];
  addChallenge: (c: Partial<Challenge>) => void;

  // Churn/Analytics
  getAtRiskMembers: () => User[];
  pushNotification: (memberId: string, msg: string) => void;

  // Leads (Kiosk)
  addLead: (lead: Partial<Lead>) => void;
  leads: Lead[];

  // Expenses
  expenses: any[];
  addExpense: (expense: any) => void;
  deleteExpense: (id: string) => void;

  // Help
  helpRequests: HelpRequest[];
  resolveHelpRequest: (id: string) => void;
  requestTrainerHelp: (location: string) => void;
  updateMemberPin: (id: string, pin: string) => Promise<void>;

  // Capacity
  currentCapacity: number;
  peakHours: { hour: string; capacity: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [kioskMode, setKioskMode] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [expiryDays, setExpiryDaysState] = useState(7);
  const [appNotifications, setAppNotif] = useState<AppNotification[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [videos] = useState<VideoContent[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([
    { id: 'r1', name: 'Free Shake', description: 'Protein shake on us!', pointCost: 500, emoji: '🥤', stock: -1 },
    { id: 'r2', name: 'Guest Pass', description: 'Bring a friend for free', pointCost: 1000, emoji: '🎟️', stock: -1 },
    { id: 'r3', name: 'Gym Bag', description: 'Dolphin Gym branded bag', pointCost: 3000, emoji: '🎒', stock: 5 },
  ]);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  const [marketplacePlans, setMarketplacePlans] = useState<TrainerPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trainerShifts, setTrainerShifts] = useState<TrainerShift[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [squads, setSquads] = useState<GymSquad[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeEntries] = useState<ChallengeEntry[]>([]);

  const t = TRANSLATIONS[language];

  // Load persisted state
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('gym_lang');
      if (savedLang) setLanguageState(savedLang as Language);

      const savedUser = localStorage.getItem('gym_user');
      if (savedUser) setUser(JSON.parse(savedUser));

      const savedNotify = localStorage.getItem('gym_notify');
      if (savedNotify) setNotificationsEnabledState(savedNotify === 'true');

      const savedExpiryDays = localStorage.getItem('gym_expiry_days');
      if (savedExpiryDays) setExpiryDaysState(parseInt(savedExpiryDays, 10));

      const savedMembers = localStorage.getItem('gym_members');
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      } else {
        const initial: User[] = [
          { id: 'm1', name: 'Ahmed Ali', email: 'ahmed@example.com', role: 'member', status: 'active', points: 1200, badges: [], memberSince: '2023-01-01', subscriptionStartDate: '2024-01-01', subscriptionEndDate: new Date(Date.now() + 5 * 86400000).toISOString(), paymentMethod: 'cash' },
          { id: 'm2', name: 'John Doe', email: 'john@example.com', role: 'member', status: 'active', points: 800, badges: [], memberSince: '2023-05-15', subscriptionStartDate: '2024-02-01', subscriptionEndDate: new Date(Date.now() + 30 * 86400000).toISOString(), paymentMethod: 'click' },
        ];
        setMembers(initial);
        localStorage.setItem('gym_members', JSON.stringify(initial));
      }

      const savedEq = localStorage.getItem('gym_equipment');
      if (savedEq) {
        setEquipment(JSON.parse(savedEq));
      } else {
        const initial: Equipment[] = [
          { id: 'eq1', nameEn: 'Treadmill X-Pro', nameAr: 'جهاز جري', category: 'cardio', status: 'available', lastMaintenanceDate: '2024-04-10', purchaseDate: '2023-12-01', quantity: 5 },
          { id: 'eq2', nameEn: 'Bench Press', nameAr: 'جهاز الصدر', category: 'strength', status: 'maintenance', lastMaintenanceDate: '2024-05-01', purchaseDate: '2023-11-15', quantity: 2 },
        ];
        setEquipment(initial);
        localStorage.setItem('gym_equipment', JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to load state', e);
      localStorage.clear();
    }
  }, []);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') new Notification(title, { body });
  }, []);

  const setLanguage = (lang: Language) => { setLanguageState(lang); localStorage.setItem('gym_lang', lang); };

  const setNotificationsEnabled = (enabled: boolean) => {
    if (enabled && Notification.permission !== 'granted') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') { setNotificationsEnabledState(true); localStorage.setItem('gym_notify', 'true'); }
      });
    } else {
      setNotificationsEnabledState(enabled);
      localStorage.setItem('gym_notify', enabled.toString());
    }
  };

  const setExpiryDays = (days: number) => { setExpiryDaysState(days); localStorage.setItem('gym_expiry_days', days.toString()); };

  const triggerTestNotification = () => sendBrowserNotification(t.notifyTitle || 'Dolphin Gym', t.testNotifyMsg || 'Test notification!');

  const getExpiringMembers = () => {
    const now = Date.now();
    const range = expiryDays * 86400000;
    return members.filter(m => { if (!m.subscriptionEndDate) return false; const end = new Date(m.subscriptionEndDate).getTime(); return end > now && (end - now) <= range; });
  };

  const markNotifRead = (id: string) => setAppNotif(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAllNotifs = () => setAppNotif([]);

  // Mock constants
  const currentCapacity = 45;
  const peakHours = [
    { hour: '06:00', capacity: 20 },
    { hour: '09:00', capacity: 40 },
    { hour: '12:00', capacity: 30 },
    { hour: '17:00', capacity: 85 },
    { hour: '20:00', capacity: 60 },
    { hour: '22:00', capacity: 25 }
  ];

  const addExpense = (expense: any) => {
    setExpenses(prev => [...prev, { ...expense, id: String(Date.now()) }]);
  };
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const resolveHelpRequest = (id: string) => {
    setHelpRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };
  const requestTrainerHelp = (location: string) => {
    if (!user) return;
    setHelpRequests(prev => [...prev, { id: String(Date.now()), memberId: user.id, memberName: user.name, location, status: 'active', timestamp: new Date().toISOString() }]);
    pushNotification('Help Requested', 'A trainer has been dispatched to your location.');
  };

  const updateMemberPin = async (id: string, pin: string) => {
    await updateMember(id, { accessPin: pin });
  };

  const addReward = async (reward: any) => {
    setRewards(prev => [...prev, { ...reward, id: String(Date.now()) }]);
  };
  const deleteReward = async (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const sendMessage = (toId: string, toName: string, text: string) => {
    if (!user) return;
    setMessages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), fromId: user.id, fromName: user.name, toId, text, timestamp: new Date().toISOString(), read: false }]);
  };
  const markMessageRead = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  const getUnreadCount = () => { if (!user) return 0; return messages.filter(m => m.toId === user.id && !m.read).length; };

  const joinLiveSession = (id: string) => {
    if (!user) return;
    setLiveSessions(prev => prev.map(s => s.id === id ? { ...s, participants: [...s.participants, user.id] } : s));
  };

  const logAttendance = (memberId: string, memberName: string, method: AttendanceRecord['method'] = 'manual') => {
    setAttendance(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), memberId, memberName, timestamp: new Date().toISOString(), method }]);
  };

  const addWorkoutPlan = (plan: Partial<WorkoutPlan>) => {
    if (!user) return;
    const p: WorkoutPlan = { id: Math.random().toString(36).substr(2, 9), memberId: plan.memberId || '', title: plan.title || 'New Plan', exercises: plan.exercises || [], createdAt: new Date().toISOString(), assignedBy: user.name, ...plan };
    setWorkoutPlans(prev => [...prev, p]);
  };
  const updateWorkoutPlan = (id: string, updates: Partial<WorkoutPlan>) => setWorkoutPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

  const addWeightEntry = (entry: Partial<WeightEntry>) => {
    if (!user) return;
    setWeightEntries(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), memberId: user.id, weightKg: entry.weightKg || 0, date: entry.date || new Date().toISOString().split('T')[0] }]);
  };

  const redeemReward = (rewardId: string) => {
    if (!user) return;
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || user.points < reward.pointCost) return;
    const updatedUser = { ...user, points: user.points - reward.pointCost };
    setUser(updatedUser);
    localStorage.setItem('gym_user', JSON.stringify(updatedUser));
    setRedemptions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), memberId: user.id, memberName: user.name, rewardId, rewardName: reward.name, pointsSpent: reward.pointCost, redeemedAt: new Date().toISOString() }]);
  };

  const addProgressPhoto = (photo: Partial<ProgressPhoto>) => {
    if (!user) return;
    setProgressPhotos(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), memberId: user.id, photoUrl: photo.photoUrl || '', date: photo.date || new Date().toISOString(), ...photo }]);
  };
  const deleteProgressPhoto = (id: string) => setProgressPhotos(prev => prev.filter(p => p.id !== id));

  const addSocialPost = (content: string) => {
    if (!user) return;
    setSocialPosts(prev => [{ id: Math.random().toString(36).substr(2, 9), authorId: user.id, authorName: user.name, content, likesCount: 0, likedBy: [], comments: [], timestamp: new Date().toISOString() }, ...prev]);
  };
  const toggleLikePost = (postId: string) => {
    if (!user) return;
    setSocialPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likedBy.includes(user.id);
      return { ...p, likedBy: liked ? p.likedBy.filter(id => id !== user.id) : [...p.likedBy, user.id], likesCount: liked ? p.likesCount - 1 : p.likesCount + 1 };
    }));
  };
  const addCommentToPost = (postId: string, text: string) => {
    if (!user) return;
    setSocialPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, comments: [...p.comments, { id: Math.random().toString(36).substr(2, 9), authorId: user.id, authorName: user.name, text, timestamp: new Date().toISOString() }] }));
  };

  const sendMatchRequest = (toId: string, toName: string) => {
    if (!user) return;
    setMatchRequests(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), fromUserId: user.id, fromUserName: user.name, toUserId: toId, toUserName: toName, status: 'pending', timestamp: new Date().toISOString() }]);
  };
  const acceptMatchRequest = (id: string) => setMatchRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));

  const addMaintenanceReport = (report: Partial<MaintenanceReport>) => {
    if (!user) return;
    setMaintenanceReports(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), equipmentId: report.equipmentId || '', reportedBy: user.id, reportedByName: user.name, description: report.description || '', status: 'pending', timestamp: new Date().toISOString(), ...report }]);
  };
  const updateMaintenanceReport = (id: string, updates: Partial<MaintenanceReport>) => setMaintenanceReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

  const publishPlan = (plan: Partial<TrainerPlan>) => {
    if (!user) return;
    setMarketplacePlans(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), trainerId: user.id, trainerName: user.name, title: plan.title || 'Plan', description: plan.description || '', price: plan.price || 0, durationWeeks: plan.durationWeeks || 4, features: plan.features || [], active: true }]);
  };
  const purchasePlan = (planId: string) => {
    if (!user) return;
    const plan = marketplacePlans.find(p => p.id === planId);
    if (!plan) return;
    setTransactions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), buyerId: user.id, buyerName: user.name, trainerId: plan.trainerId, trainerName: plan.trainerName, planId, planTitle: plan.title, amount: plan.price, gymCommission: plan.price * 0.2, trainerEarnings: plan.price * 0.8, timestamp: new Date().toISOString() }]);
  };

  const addTrainerShift = (shift: Partial<TrainerShift>) => {
    setTrainerShifts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), trainerId: shift.trainerId || '', trainerName: shift.trainerName || '', startTime: shift.startTime || '', endTime: shift.endTime || '', hourlyRate: shift.hourlyRate || 0 }]);
  };
  const generatePayroll = (trainerId: string, month: string) => {
    const shifts = trainerShifts.filter(s => s.trainerId === trainerId && s.startTime.startsWith(month));
    const trainer = members.find(m => m.id === trainerId);
    if (!trainer) return;
    const shiftEarnings = shifts.reduce((acc, s) => { const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000; return acc + hours * s.hourlyRate; }, 0);
    setPayrollRecords(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), trainerId, trainerName: trainer.name, monthString: month, baseSalary: 0, shiftEarnings, commissionEarnings: 0, totalEarnings: shiftEarnings, status: 'pending' }]);
  };

  const createSquad = (name: string, description: string) => {
    if (!user) return;
    setSquads(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, description, captainId: user.id, captainName: user.name, memberIds: [user.id], totalPoints: 0, createdAt: new Date().toISOString() }]);
  };
  const joinSquad = (id: string) => {
    if (!user) return;
    setSquads(prev => prev.map(s => s.id === id && !s.memberIds.includes(user.id) ? { ...s, memberIds: [...s.memberIds, user.id] } : s));
  };
  const leaveSquad = (id: string) => {
    if (!user) return;
    setSquads(prev => prev.map(s => s.id === id ? { ...s, memberIds: s.memberIds.filter(mid => mid !== user.id) } : s));
  };

  const addChallenge = (c: Partial<Challenge>) => {
    setChallenges(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title: c.title || 'Challenge', description: c.description || '', type: c.type || 'attendance', targetValue: c.targetValue || 10, unit: c.unit || 'sessions', startDate: c.startDate || new Date().toISOString(), endDate: c.endDate || new Date().toISOString(), pointReward: c.pointReward || 500, badgeEmoji: c.badgeEmoji || '🏆', active: true }]);
  };

  const getAtRiskMembers = () => {
    const now = Date.now();
    return members.filter(m => {
      if (!m.subscriptionEndDate) return false;
      const end = new Date(m.subscriptionEndDate).getTime();
      return end < now;
    });
  };
  const pushNotification = (memberId: string, msg: string) => console.log('Push notification to', memberId, ':', msg);

  const addLead = (lead: Partial<Lead>) => console.log('New lead:', lead);

  const addMember = (newMemberData: Partial<User>) => {
    if (user?.role !== 'admin') return;
    const m: User = { id: Math.random().toString(36).substr(2, 9), name: newMemberData.name || 'New Member', email: newMemberData.email || '', role: 'member', status: 'active', points: 0, badges: [], memberSince: new Date().toISOString(), subscriptionStartDate: newMemberData.subscriptionStartDate || new Date().toISOString(), subscriptionEndDate: newMemberData.subscriptionEndDate || new Date(Date.now() + 30 * 86400000).toISOString(), paymentMethod: newMemberData.paymentMethod || 'cash', ...newMemberData };
    const updated = [...members, m];
    setMembers(updated);
    localStorage.setItem('gym_members', JSON.stringify(updated));
  };
  const updateMember = (id: string, updates: Partial<User>) => {
    if (user?.role !== 'admin' && user?.role !== 'trainer') return;
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    setMembers(updated);
    localStorage.setItem('gym_members', JSON.stringify(updated));
  };
  const deleteMember = (id: string) => {
    if (user?.role !== 'admin') return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem('gym_members', JSON.stringify(updated));
  };

  const addEquipment = (newEqData: Partial<Equipment>) => {
    if (user?.role !== 'admin') return;
    const eq: Equipment = { id: Math.random().toString(36).substr(2, 9), nameEn: newEqData.nameEn || 'New Device', nameAr: newEqData.nameAr || 'جهاز جديد', category: newEqData.category || 'strength', status: newEqData.status || 'available', lastMaintenanceDate: new Date().toISOString().split('T')[0], purchaseDate: new Date().toISOString().split('T')[0], quantity: newEqData.quantity || 1 };
    const updated = [...equipment, eq];
    setEquipment(updated);
    localStorage.setItem('gym_equipment', JSON.stringify(updated));
  };
  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    if (user?.role !== 'admin') return;
    const updated = equipment.map(e => e.id === id ? { ...e, ...updates } : e);
    setEquipment(updated);
    localStorage.setItem('gym_equipment', JSON.stringify(updated));
  };
  const deleteEquipment = (id: string) => {
    if (user?.role !== 'admin') return;
    const updated = equipment.filter(e => e.id !== id);
    setEquipment(updated);
    localStorage.setItem('gym_equipment', JSON.stringify(updated));
  };

  const login = (email: string, role: UserRole = 'admin', referralCode?: string) => {
    const newUser: User = {
      id: role === 'admin' ? 'admin-1' : role === 'trainer' ? 'trainer-1' : 'member-1',
      name: role === 'admin' ? 'Gym Manager' : role === 'trainer' ? 'Coach Sarah' : 'Alex Thompson',
      email, role, status: 'active',
      memberSince: new Date().toISOString(),
      points: role === 'member' ? 8450 : 25000,
      badges: [],
      subscriptionEndDate: new Date(Date.now() + (role === 'member' ? 5 : 365) * 86400000).toISOString(),
      paymentMethod: 'cash',
    };
    setUser(newUser);
    localStorage.setItem('gym_user', JSON.stringify(newUser));
    setActiveTab(role === 'admin' || role === 'trainer' ? 'admin' : 'dashboard');
  };

  const logout = () => { setUser(null); localStorage.removeItem('gym_user'); setActiveTab('dashboard'); };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('gym_user', JSON.stringify(updated));
  };

  const addPoints = (amount: number) => {
    if (!user) return;
    const updated = { ...user, points: user.points + amount };
    setUser(updated);
    localStorage.setItem('gym_user', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, theme, setTheme, user, members, equipment,
      expenses,
    addExpense,
    deleteExpense,
    helpRequests,
    resolveHelpRequest,
    requestTrainerHelp,
    leads,
    updateMemberPin,
    addReward,
    deleteReward,
    currentCapacity,
    peakHours,
    kioskMode, setKioskMode, isAuthLoading,
      addMember, updateMember, deleteMember,
      addEquipment, updateEquipment, deleteEquipment,
      login, logout, updateCurrentUserProfile,
      activeTab, setActiveTab, addPoints,
      notificationsEnabled, setNotificationsEnabled, expiryDays, setExpiryDays,
      triggerTestNotification, getExpiringMembers,
      appNotifications, markNotifRead, clearAllNotifs,
      messages, sendMessage, markMessageRead, getUnreadCount,
      videos, liveSessions, joinLiveSession,
      attendance, logAttendance,
      workoutPlans, addWorkoutPlan, updateWorkoutPlan,
      weightEntries, addWeightEntry,
      rewards, redemptions, redeemReward,
      progressPhotos, addProgressPhoto, deleteProgressPhoto,
      socialPosts, addSocialPost, toggleLikePost, addCommentToPost,
      matchRequests, sendMatchRequest, acceptMatchRequest,
      maintenanceReports, addMaintenanceReport, updateMaintenanceReport,
      marketplacePlans, transactions, publishPlan, purchasePlan,
      trainerShifts, payrollRecords, addTrainerShift, generatePayroll,
      squads, createSquad, joinSquad, leaveSquad,
      challenges, challengeEntries, addChallenge,
      getAtRiskMembers, pushNotification, addLead,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
