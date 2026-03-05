import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, Theme, User, Equipment, UserRole, AttendanceRecord, WorkoutPlan, WeightEntry, Reward, RedemptionRecord, Message, AppNotification, Challenge, ChallengeEntry, TrainerPlan, Transaction, Expense, SocialPost, Comment, MaintenanceReport, VideoContent, LiveSession, MatchRequest, HelpRequest, ProgressPhoto, TrainerShift, PayrollRecord, GymSquad, Lead } from '../types';
import { TRANSLATIONS, BADGES } from '../constants';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, updateDoc, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  isAuthLoading: boolean;
  members: User[];
  equipment: Equipment[];
  addMember: (member: Partial<User>) => Promise<void>;
  updateMember: (id: string, updates: Partial<User>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addEquipment: (item: Partial<Equipment>) => Promise<void>;
  updateEquipment: (id: string, updates: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  maintenanceReports: MaintenanceReport[];
  addMaintenanceReport: (report: Partial<MaintenanceReport>) => void;
  updateMaintenanceReport: (id: string, updates: Partial<MaintenanceReport>) => void;
  login: (email: string, role?: UserRole, referralCodeUsed?: string) => Promise<void>;
  logout: () => Promise<void>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addPoints: (amount: number) => Promise<void>;
  getExpiringMembers: () => User[];
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  expiryDays: number;
  setExpiryDays: (days: number) => void;
  triggerTestNotification: () => void;
  updateCurrentUserProfile: (updates: Partial<User>) => Promise<void>;
  // Attendance
  attendance: AttendanceRecord[];
  logAttendance: (memberId: string, memberName: string, method?: 'qr' | 'manual' | 'face' | 'nfc') => void;
  // Plans
  workoutPlans: WorkoutPlan[];
  addWorkoutPlan: (plan: Partial<WorkoutPlan>) => Promise<void>;
  updateWorkoutPlan: (id: string, updates: Partial<WorkoutPlan>) => Promise<void>;
  // Weight
  weightEntries: WeightEntry[];
  addWeightEntry: (weightKg: number) => void;
  // Store
  rewards: Reward[];
  addReward: (reward: Partial<Reward>) => void;
  updateReward: (id: string, updates: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  redeemReward: (rewardId: string) => boolean;
  redemptions: RedemptionRecord[];
  // Messages
  messages: Message[];
  sendMessage: (toId: string, toName: string, text: string) => void;
  markMessageRead: (id: string) => void;
  getUnreadCount: () => number;
  // In-App Notifications
  appNotifications: AppNotification[];
  pushNotification: (title: string, body: string, type?: AppNotification['type']) => void;
  markNotifRead: (id: string) => void;
  clearAllNotifs: () => void;
  // Challenges
  challenges: Challenge[];
  challengeEntries: ChallengeEntry[];
  addChallenge: (c: Partial<Challenge>) => void;
  updateChallengeEntry: (challengeId: string, value: number) => void;
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  // Kiosk
  kioskMode: boolean;
  setKioskMode: (v: boolean) => void;
  // Freelance Trainer / Marketplace
  marketplacePlans: TrainerPlan[];
  transactions: Transaction[];
  publishPlan: (plan: Partial<TrainerPlan>) => void;
  purchasePlan: (planId: string) => boolean;

  // Financials
  expenses: Expense[];
  addExpense: (expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Social Feed
  socialPosts: SocialPost[];
  addSocialPost: (content: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addCommentToPost: (postId: string, text: string) => Promise<void>;

  // VOD & Live Training
  videos: VideoContent[];
  liveSessions: LiveSession[];
  joinLiveSession: (sessionId: string) => void;
  checkAndUnlockBadges: (userId: string) => void;
  currentCapacity: number;
  peakHours: { hour: string; capacity: number }[];

  // Elite Features
  matchRequests: MatchRequest[];
  sendMatchRequest: (toUserId: string) => void;
  acceptMatchRequest: (requestId: string) => void;

  helpRequests: HelpRequest[];
  requestTrainerHelp: (location: string) => void;
  resolveHelpRequest: (requestId: string) => void;

  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  deleteProgressPhoto: (id: string) => void;

  // Trainer Payroll
  trainerShifts: TrainerShift[];
  addTrainerShift: (shift: Partial<TrainerShift>) => void;
  payrollRecords: PayrollRecord[];
  generatePayroll: (trainerId: string, monthString: string) => void;

  // Gym Squads & Churn
  squads: GymSquad[];
  createSquad: (name: string, description: string) => void;
  joinSquad: (squadId: string) => void;
  leaveSquad: () => void;
  getAtRiskMembers: () => { member: User, riskLevel: 'High' | 'Medium' | 'Low', reason: string }[];

  // Leads
  leads: Lead[];
  addLead: (lead: Partial<Lead>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_REWARDS: Reward[] = [
  { id: 'r1', name: 'Free Protein Shake', description: 'Redeem for a free protein shake at the gym bar', pointCost: 500, emoji: '🥤', stock: -1 },
  { id: 'r2', name: 'T-Shirt', description: 'Official Dolphin Gym branded t-shirt', pointCost: 2000, emoji: '👕', stock: 10 },
  { id: 'r3', name: '1 Month Discount (20%)', description: '20% off your next subscription renewal', pointCost: 5000, emoji: '💸', stock: -1 },
  { id: 'r4', name: 'Personal Training Session', description: '1-hour private session with a top trainer', pointCost: 3000, emoji: '🏋️', stock: 5 },
  { id: 'r5', name: 'Gym Bag', description: 'Premium Dolphin Gym bag', pointCost: 4000, emoji: '🎒', stock: 3 },
];

const DEFAULT_VIDEOS: VideoContent[] = [
  { id: 'v1', title: '20 Min Full Body HIIT', description: 'Intense 20 minute fat burning workout with no equipment needed.', instructorName: 'The Body Coach TV', videoUrl: 'https://www.youtube.com/embed/ml6cT4AZdqI', thumbnailUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80', category: 'Cardio', durationMins: 20 },
  { id: 'v2', title: 'Beginner Yoga Flow', description: 'Relax and stretch out tight muscles with this 20-minute beginner session.', instructorName: 'Yoga With Adriene', videoUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE', thumbnailUrl: 'https://images.unsplash.com/photo-1599901860904-1776dfcab30f?auto=format&fit=crop&q=80', category: 'Flexibility', durationMins: 21 },
  { id: 'v3', title: '20 Min Full Body Dumbbell Workout', description: 'Build your strength with this guided dumbbell routine.', instructorName: 'Pamela Reif', videoUrl: 'https://www.youtube.com/embed/UItWltVZZmE', thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80', category: 'Strength', durationMins: 20 }
];

const DEFAULT_SESSIONS: LiveSession[] = [
  { id: 's1', title: 'Live Morning Zoomba', instructorName: 'Coach Sarah', scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), durationMins: 45, meetLink: 'https://meet.google.com/abc', participants: [] },
  { id: 's2', title: 'Advanced CrossFit Q&A', instructorName: 'Coach Mike', scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), durationMins: 60, meetLink: 'https://meet.google.com/xyz', participants: [] },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', nameEn: 'Treadmill Premium', nameAr: 'جهاز مشي ممتاز', category: 'cardio', status: 'available', lastMaintenanceDate: '2023-10-01', purchaseDate: '2022-01-15', quantity: 5, usageHours: 480, maintenanceIntervalHours: 500 },
    { id: '2', nameEn: 'Dumbbell Set 5-50kg', nameAr: 'مجموعة أوزان 5-50 كغ', category: 'weights', status: 'available', lastMaintenanceDate: '2023-09-15', purchaseDate: '2021-11-20', quantity: 2, usageHours: 0, maintenanceIntervalHours: 10000 },
    { id: '3', nameEn: 'Squat Rack Pro', nameAr: 'رف سكوات احترافي', category: 'strength', status: 'maintenance', lastMaintenanceDate: '2023-10-25', purchaseDate: '2023-02-10', quantity: 3, usageHours: 350, maintenanceIntervalHours: 600 },
    { id: '4', nameEn: 'Rowing Machine', nameAr: 'جهاز تجديف', category: 'cardio', status: 'broken', lastMaintenanceDate: '2023-05-10', purchaseDate: '2020-08-05', quantity: 2, usageHours: 790, maintenanceIntervalHours: 800 },
  ]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [expiryDays, setExpiryDaysState] = useState(7);
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([]);
  // New state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  // Batch 2 State
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeEntries, setChallengeEntries] = useState<ChallengeEntry[]>([]);
  const [kioskMode, setKioskModeState] = useState(false);
  // Batch 3 State
  const [marketplacePlans, setMarketplacePlans] = useState<TrainerPlan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Batch 4 State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>(DEFAULT_VIDEOS);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(DEFAULT_SESSIONS);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>(() => {
    const saved = localStorage.getItem('gym_progress_photos');
    return saved ? JSON.parse(saved) : [];
  });
  const [trainerShifts, setTrainerShifts] = useState<TrainerShift[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [squads, setSquads] = useState<GymSquad[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentCapacity, setCurrentCapacity] = useState<number>(0);
  const peakHours = React.useMemo(() => [
    { hour: '06:00', capacity: 30 },
    { hour: '09:00', capacity: 20 },
    { hour: '12:00', capacity: 45 },
    { hour: '15:00', capacity: 35 },
    { hour: '18:00', capacity: 90 },
    { hour: '21:00', capacity: 60 },
  ], []);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeUsers: (() => void) | undefined;
    let unsubscribeEquipment: (() => void) | undefined;
    let unsubscribePlans: (() => void) | undefined;
    let unsubscribeLeads: (() => void) | undefined;
    let unsubscribeSocial: (() => void) | undefined;

    try {
      const savedLang = localStorage.getItem('gym_lang');
      if (savedLang) setLanguage(savedLang as Language);

      const savedNotify = localStorage.getItem('gym_notify');
      if (savedNotify) setNotificationsEnabledState(savedNotify === 'true');

      const savedExpiryDays = localStorage.getItem('gym_expiry_days');
      if (savedExpiryDays) setExpiryDaysState(parseInt(savedExpiryDays, 10));

      // Safety timeout — always stop loading after 5s no matter what
      const authTimeout = setTimeout(() => setIsAuthLoading(false), 5000);

      unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const docRef = doc(db, 'users', firebaseUser.uid);
          try {
            // First try to get the existing profile
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUser(docSnap.data() as User);
            } else {
              // No Firestore profile yet — create one automatically
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: firebaseUser.email === 'admin@dolphingym.com' ? 'admin' : 'member',
                status: 'active',
                memberSince: new Date().toISOString(),
                points: 8450, badges: ['b1', 'b2'],
                subscriptionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                paymentMethod: 'cash',
                referralCode: Math.random().toString(36).substr(2, 6).toUpperCase()
              };
              await setDoc(docRef, newUser);
              setUser(newUser);
            }
            // Set up real-time listener for future profile changes
            onSnapshot(docRef, (snap) => { if (snap.exists()) setUser(snap.data() as User); });
          } catch (error: any) {
            console.warn('Firestore profile read/create failed:', error.message);
            // Fallback: use Firebase Auth data so the user can still access the app
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'admin@dolphingym.com' ? 'admin' : 'member',
              status: 'active', memberSince: new Date().toISOString(),
              points: 0, badges: [],
              subscriptionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              paymentMethod: 'cash', referralCode: ''
            } as User);
          }
          clearTimeout(authTimeout);
          setIsAuthLoading(false);
        } else {
          setUser(null);
          clearTimeout(authTimeout);
          setIsAuthLoading(false);
        }
      });



      unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(d => d.data() as User);
        setMembers(usersData);
      });

      unsubscribeEquipment = onSnapshot(collection(db, 'equipment'), (snapshot) => {
        setEquipment(snapshot.docs.map(d => d.data() as Equipment));
      });
      unsubscribePlans = onSnapshot(collection(db, 'workoutPlans'), (snapshot) => {
        setWorkoutPlans(snapshot.docs.map(d => d.data() as WorkoutPlan));
      });
      unsubscribeSocial = onSnapshot(collection(db, 'socialPosts'), (snapshot) => {
        setSocialPosts(snapshot.docs.map(d => d.data() as SocialPost));
      });
      unsubscribeLeads = onSnapshot(collection(db, 'leads'), (snapshot) => {
        setLeads(snapshot.docs.map(d => d.data() as Lead));
      });

      const savedAttendance = localStorage.getItem('gym_attendance');
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

      const savedWeights = localStorage.getItem('gym_weights');
      if (savedWeights) setWeightEntries(JSON.parse(savedWeights));

      const savedRewards = localStorage.getItem('gym_rewards');
      if (savedRewards) setRewards(JSON.parse(savedRewards));

      const savedRedemptions = localStorage.getItem('gym_redemptions');
      if (savedRedemptions) setRedemptions(JSON.parse(savedRedemptions));

      const savedMessages = localStorage.getItem('gym_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));

      const savedNotifs = localStorage.getItem('gym_app_notifs');
      if (savedNotifs) setAppNotifications(JSON.parse(savedNotifs));

      const savedChallenges = localStorage.getItem('gym_challenges');
      if (savedChallenges) setChallenges(JSON.parse(savedChallenges));

      const savedEntries = localStorage.getItem('gym_challenge_entries');
      if (savedEntries) setChallengeEntries(JSON.parse(savedEntries));

      const savedTheme = localStorage.getItem('gym_theme');
      if (savedTheme) setThemeState(savedTheme as Theme);

      const savedExpenses = localStorage.getItem('gym_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedMaintenance = localStorage.getItem('gym_maintenance_reports');
      if (savedMaintenance) setMaintenanceReports(JSON.parse(savedMaintenance));

      const savedMatches = localStorage.getItem('gym_match_requests');
      if (savedMatches) setMatchRequests(JSON.parse(savedMatches));

      const savedHelp = localStorage.getItem('gym_help_requests');
      if (savedHelp) setHelpRequests(JSON.parse(savedHelp));

      const savedShifts = localStorage.getItem('gym_trainer_shifts');
      if (savedShifts) setTrainerShifts(JSON.parse(savedShifts));

      const [savedPayroll, savedSquads] = [
        localStorage.getItem('gym_payroll_records'),
        localStorage.getItem('gym_squads')
      ];
      if (savedPayroll) setPayrollRecords(JSON.parse(savedPayroll));
      if (savedSquads) setSquads(JSON.parse(savedSquads));

    } catch (e) {
      console.error("Failed to recover persistent state", e);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeEquipment) unsubscribeEquipment();
      if (unsubscribePlans) unsubscribePlans();
      if (unsubscribeLeads) unsubscribeLeads();
      if (unsubscribeSocial) unsubscribeSocial();
    };
  }, []);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png' });
    }
  }, []);

  useEffect(() => {
    if (notificationsEnabled && user) {
      if (user.role === 'admin' || user.role === 'trainer') {
        const expiring = getExpiringMembers();
        if (expiring.length > 0) {
          const msg = t.adminExpiryMsg.replace('{{count}}', expiring.length.toString()).replace('{{days}}', expiryDays.toString());
          sendBrowserNotification(t.notifyTitle, msg);
        }
      } else if (user.role === 'member' && user.subscriptionEndDate) {
        const end = new Date(user.subscriptionEndDate).getTime();
        const now = Date.now();
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= expiryDays) {
          sendBrowserNotification(t.notifyTitle, t.memberExpiryMsg.replace('{{days}}', daysLeft.toString()));
        }
      }
      let ws: WebSocket | null = null;
      try {
        ws = new window.WebSocket('ws://localhost:4000');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') sendBrowserNotification(data.title || t.notifyTitle, data.message || 'لديك إشعار جديد');
          } catch (e) { /* ignore */ }
        };
        ws.onerror = () => { ws?.close(); };
      } catch (e) { /* ignore */ }
      return () => { ws?.close(); };
    }
  }, [notificationsEnabled, members, expiryDays, user, language]);

  const triggerTestNotification = () => {
    if (notificationsEnabled) {
      sendBrowserNotification(t.notifyTitle, t.testNotifyMsg);
    } else {
      setNotificationsEnabled(true);
      setTimeout(() => sendBrowserNotification(t.notifyTitle, t.testNotifyMsg), 1000);
    }
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    // Safety check: Notification API may not exist on all mobile browsers
    if (typeof Notification === 'undefined') {
      setNotificationsEnabledState(enabled);
      localStorage.setItem('gym_notify', enabled.toString());
      return;
    }
    if (enabled && Notification.permission !== 'granted') {
      try {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationsEnabledState(true);
            localStorage.setItem('gym_notify', 'true');
          }
        }).catch(() => {
          // Permission request failed (e.g. iOS Safari) — enable silently
          setNotificationsEnabledState(true);
          localStorage.setItem('gym_notify', 'true');
        });
      } catch {
        // Fallback for browsers that don't support promise-based requestPermission
        setNotificationsEnabledState(enabled);
        localStorage.setItem('gym_notify', enabled.toString());
      }
    } else {
      setNotificationsEnabledState(enabled);
      localStorage.setItem('gym_notify', enabled.toString());
    }
  };

  const setExpiryDays = (days: number) => { setExpiryDaysState(days); localStorage.setItem('gym_expiry_days', days.toString()); };

  const addMember = async (newMemberData: Partial<User>) => {
    if (user?.role !== 'admin') return;
    const id = newMemberData.id || Math.random().toString(36).substr(2, 9);
    const newMember: User = {
      id, name: newMemberData.name || 'New Member', email: newMemberData.email || '',
      role: newMemberData.role || 'member', status: 'active', points: newMemberData.points || 0, badges: [], memberSince: new Date().toISOString(),
      subscriptionStartDate: newMemberData.subscriptionStartDate || new Date().toISOString(),
      subscriptionEndDate: newMemberData.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: newMemberData.paymentMethod || 'cash', paymentStatus: 'pending', phone: newMemberData.phone,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase()
    };
    await setDoc(doc(db, 'users', id), newMember);
  };

  const updateMember = async (id: string, updates: Partial<User>) => {
    if (user?.role !== 'admin' && user?.role !== 'trainer') return;
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates as any);
  };

  const deleteMember = async (id: string) => {
    if (user?.role !== 'admin') return;
    await deleteDoc(doc(db, 'users', id));
  };

  const addEquipment = async (newEqData: Partial<Equipment>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newEq: Equipment = { id, nameEn: newEqData.nameEn || 'New Device', nameAr: newEqData.nameAr || 'جهاز جديد', category: newEqData.category || 'strength', status: newEqData.status || 'available', lastMaintenanceDate: new Date().toISOString().split('T')[0], purchaseDate: new Date().toISOString().split('T')[0], quantity: newEqData.quantity || 1, usageHours: 0, maintenanceIntervalHours: 500 };
    await setDoc(doc(db, 'equipment', id), newEq);
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    if (user?.role !== 'admin') return;
    await updateDoc(doc(db, 'equipment', id), updates as any);
  };

  const deleteEquipment = async (id: string) => {
    if (user?.role !== 'admin') return;
    await deleteDoc(doc(db, 'equipment', id));
  };

  const addMaintenanceReport = (reportData: Partial<MaintenanceReport>) => {
    if (!user) return;
    const report: MaintenanceReport = {
      id: Math.random().toString(36).substr(2, 9),
      equipmentId: reportData.equipmentId || '',
      reportedBy: user.id,
      reportedByName: user.name,
      description: reportData.description || '',
      status: reportData.status || 'pending',
      timestamp: new Date().toISOString()
    };
    const updated = [...maintenanceReports, report];
    setMaintenanceReports(updated);
    localStorage.setItem('gym_maintenance_reports', JSON.stringify(updated));

    // Auto update equipment status
    if (reportData.equipmentId) updateEquipment(reportData.equipmentId, { status: 'broken' });
  };

  const updateMaintenanceReport = (id: string, updates: Partial<MaintenanceReport>) => {
    if (user?.role !== 'admin' && user?.role !== 'trainer') return;
    const updated = maintenanceReports.map(r => r.id === id ? { ...r, ...updates } : r);
    setMaintenanceReports(updated);
    localStorage.setItem('gym_maintenance_reports', JSON.stringify(updated));

    // Auto update equipment status if resolved
    const report = updated.find(r => r.id === id);
    if (updates.status === 'resolved' && report?.equipmentId) {
      updateEquipment(report.equipmentId, { status: 'available', lastMaintenanceDate: new Date().toISOString().split('T')[0], usageHours: 0 });
    }
  };

  const getExpiringMembers = () => {
    const now = Date.now();
    const range = expiryDays * 24 * 60 * 60 * 1000;
    return members.filter(m => { if (!m.subscriptionEndDate) return false; const end = new Date(m.subscriptionEndDate).getTime(); return end > now && (end - now) <= range; });
  };

  const handleSetLanguage = (lang: Language) => { setLanguage(lang); localStorage.setItem('gym_lang', lang); };

  const login = async (email: string, role: UserRole = 'admin', referralCodeUsed?: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      let bonusEP = 0;
      // Handle referral later ...
      const newUser: User = {
        id: firebaseUser.uid,
        name: email.split('@')[0],
        email, role, status: 'active', memberSince: new Date().toISOString(),
        points: role === 'member' ? 8450 + bonusEP : 25000, badges: role === 'member' ? ['b1', 'b2'] : [],
        subscriptionEndDate: role === 'member' ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'cash',
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase()
      };
      await setDoc(docRef, newUser);
    }

    if (role === 'admin' || role === 'trainer') setActiveTab('admin');
    else if (role === 'freelance_trainer') setActiveTab('trainer_dashboard');
    else {
      setActiveTab('dashboard');
      // Show notification after a few seconds
      setTimeout(() => {
        const notifId = Math.random().toString(36).substr(2, 9);
        const welcomeMsg: AppNotification = { id: notifId, title: "Welcome back!", body: "Dolphin Gym missed you!", type: "info", timestamp: new Date().toISOString(), read: false };
        setAppNotifications(prev => [welcomeMsg, ...prev]);
        localStorage.setItem('gym_app_notifs', JSON.stringify([welcomeMsg, ...appNotifications]));
      }, 3000);
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id);
    await updateDoc(docRef, updates as any);
  };

  const addPoints = async (amount: number) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.id);
    await updateDoc(docRef, { points: user.points + amount });
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setActiveTab('dashboard');
  };

  // ── Attendance ──────────────────────────────
  const logAttendance = (memberId: string, memberName: string, method: 'qr' | 'manual' | 'face' | 'nfc' = 'manual') => {
    const record: AttendanceRecord = { id: Math.random().toString(36).substr(2, 9), memberId, memberName, timestamp: new Date().toISOString(), method };
    const updated = [...attendance, record];
    setAttendance(updated);
    localStorage.setItem('gym_attendance', JSON.stringify(updated));

    // Award Points for Attendance (limit to once per day logic could be added, simple +50 for now)
    const mUser = members.find(m => m.id === memberId);
    if (mUser) {
      updateMember(memberId, { points: (mUser.points || 0) + 50 });
      if (user && user.id === memberId) {
        addPoints(50);
      }
      checkAndUnlockBadges(memberId);
    }
  };

  // ── Workout Plans ────────────────────────────
  const addWorkoutPlan = async (planData: Partial<WorkoutPlan>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const plan: WorkoutPlan = { id, memberId: planData.memberId || '', title: planData.title || 'New Plan', exercises: planData.exercises || [], nutritionNotes: planData.nutritionNotes, calorieTarget: planData.calorieTarget, proteinTarget: planData.proteinTarget, createdAt: new Date().toISOString(), assignedBy: user?.name || 'Trainer' };
    await setDoc(doc(db, 'workoutPlans', id), plan);
  };

  const updateWorkoutPlan = async (id: string, updates: Partial<WorkoutPlan>) => {
    await updateDoc(doc(db, 'workoutPlans', id), updates as any);
  };

  // ── Weight Tracking ──────────────────────────
  const addWeightEntry = (weightKg: number) => {
    if (!user) return;
    const entry: WeightEntry = { id: Math.random().toString(36).substr(2, 9), memberId: user.id, weightKg, date: new Date().toISOString().split('T')[0] };
    const updated = [...weightEntries, entry];
    setWeightEntries(updated);
    localStorage.setItem('gym_weights', JSON.stringify(updated));
  };

  // ── Rewards / Store ──────────────────────────
  const addReward = (rewardData: Partial<Reward>) => {
    const reward: Reward = { id: Math.random().toString(36).substr(2, 9), name: rewardData.name || '', description: rewardData.description || '', pointCost: rewardData.pointCost || 0, emoji: rewardData.emoji || '🎁', stock: rewardData.stock ?? -1 };
    const updated = [...rewards, reward];
    setRewards(updated);
    localStorage.setItem('gym_rewards', JSON.stringify(updated));
  };

  const updateReward = (id: string, updates: Partial<Reward>) => {
    const updated = rewards.map(r => r.id === id ? { ...r, ...updates } : r);
    setRewards(updated);
    localStorage.setItem('gym_rewards', JSON.stringify(updated));
  };

  const deleteReward = (id: string) => {
    const updated = rewards.filter(r => r.id !== id);
    setRewards(updated);
    localStorage.setItem('gym_rewards', JSON.stringify(updated));
  };

  const redeemReward = (rewardId: string): boolean => {
    if (!user) return false;
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || (reward.stock === 0)) return false;
    if (user.points < reward.pointCost) return false;
    // Deduct points
    const updatedUser = { ...user, points: user.points - reward.pointCost };
    setUser(updatedUser);
    localStorage.setItem('gym_user', JSON.stringify(updatedUser));
    // Deduct stock if limited
    if (reward.stock > 0) updateReward(rewardId, { stock: reward.stock - 1 });
    // Record redemption
    const rec: RedemptionRecord = { id: Math.random().toString(36).substr(2, 9), memberId: user.id, memberName: user.name, rewardId, rewardName: reward.name, pointsSpent: reward.pointCost, redeemedAt: new Date().toISOString() };
    const updatedRec = [...redemptions, rec];
    setRedemptions(updatedRec);
    localStorage.setItem('gym_redemptions', JSON.stringify(updatedRec));
    return true;
  };

  // ── Messages ─────────────────────────────────
  const sendMessage = (toId: string, toName: string, text: string) => {
    if (!user) return;
    const msg: Message = { id: Math.random().toString(36).substr(2, 9), fromId: user.id, fromName: user.name, toId, toName, text, timestamp: new Date().toISOString(), read: false };
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('gym_messages', JSON.stringify(updated));
  };

  const markMessageRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('gym_messages', JSON.stringify(updated));
  };

  const getUnreadCount = (): number => {
    if (!user) return 0;
    return messages.filter(m => m.toId === user.id && !m.read).length;
    return messages.filter(m => m.toId === user.id && !m.read).length;
  };

  // ── In-App Notifications ─────────────────────
  const pushNotification = (title: string, body: string, type: AppNotification['type'] = 'info') => {
    const notif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title, body, type, timestamp: new Date().toISOString(), read: false
    };
    const updated = [notif, ...appNotifications];
    setAppNotifications(updated);
    localStorage.setItem('gym_app_notifs', JSON.stringify(updated));
  };

  const markNotifRead = (id: string) => {
    const updated = appNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    setAppNotifications(updated);
    localStorage.setItem('gym_app_notifs', JSON.stringify(updated));
  };

  const clearAllNotifs = () => {
    setAppNotifications([]);
    localStorage.setItem('gym_app_notifs', JSON.stringify([]));
  };

  // ── Challenges ───────────────────────────────
  const addChallenge = (c: Partial<Challenge>) => {
    const challenge: Challenge = {
      id: Math.random().toString(36).substr(2, 9),
      title: c.title || 'New Challenge',
      description: c.description || '',
      type: c.type || 'workout_count',
      targetValue: c.targetValue || 10,
      unit: c.unit || 'workouts',
      startDate: c.startDate || new Date().toISOString(),
      endDate: c.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      pointReward: c.pointReward || 500,
      badgeEmoji: c.badgeEmoji || '🏆',
      active: true
    };
    const updated = [...challenges, challenge];
    setChallenges(updated);
    localStorage.setItem('gym_challenges', JSON.stringify(updated));
  };

  const updateChallengeEntry = (challengeId: string, value: number) => {
    if (!user) return;
    const existing = challengeEntries.find(e => e.challengeId === challengeId && e.memberId === user.id);
    const challenge = challenges.find(c => c.id === challengeId);
    let updatedEntries;
    let newlyCompleted = false;

    if (existing) {
      const completed = value >= (challenge?.targetValue || 9999);
      newlyCompleted = completed && !existing.completed;
      updatedEntries = challengeEntries.map(e => e.id === existing.id ? { ...e, currentValue: value, completed } : e);
    } else {
      const completed = value >= (challenge?.targetValue || 9999);
      newlyCompleted = completed;
      const newEntry: ChallengeEntry = {
        id: Math.random().toString(36).substr(2, 9),
        challengeId, memberId: user.id, memberName: user.name, currentValue: value, completed
      };
      updatedEntries = [...challengeEntries, newEntry];
    }
    setChallengeEntries(updatedEntries);
    localStorage.setItem('gym_challenge_entries', JSON.stringify(updatedEntries));

    if (newlyCompleted && challenge) {
      addPoints(challenge.pointReward);
      pushNotification(t.challengeComplete || 'Challenge Completed!', `You earned ${challenge.pointReward} points!`, 'success');
    }
  };

  // ── Theme & Kiosk ────────────────────────────
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('gym_theme', t);
  };

  const setKioskMode = (v: boolean) => {
    setKioskModeState(v);
    // Logic to prevent exit if needed, or persist kiosk state not implemented for simplicity
  };

  // ── Freelance Trainer System ─────────────────
  const publishPlan = (planData: Partial<TrainerPlan>) => {
    if (!user || user.role !== 'freelance_trainer') return;
    const plan: TrainerPlan = {
      id: Math.random().toString(36).substr(2, 9),
      trainerId: user.id,
      trainerName: user.name,
      title: planData.title || 'New Plan',
      description: planData.description || '',
      price: planData.price || 0,
      durationWeeks: planData.durationWeeks || 4,
      features: planData.features || [],
      active: true
    };
    const updated = [...marketplacePlans, plan];
    setMarketplacePlans(updated);
    localStorage.setItem('gym_marketplace_plans', JSON.stringify(updated));
  };

  const purchasePlan = useCallback((planId: string): boolean => {
    if (!user) return false;
    const plan = marketplacePlans.find(p => p.id === planId);
    if (!plan) return false;

    // In a real app, this would integrate with a payment gateway.
    // Here we assume instant success if the user is not the trainer themselves.
    if (plan.trainerId === user.id) return false; // Cannot buy own plan

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      buyerId: user.id,
      buyerName: user.name,
      trainerId: plan.trainerId,
      trainerName: plan.trainerName,
      planId: plan.id,
      planTitle: plan.title,
      amount: plan.price,
      gymCommission: plan.price * 0.20,
      trainerEarnings: plan.price * 0.80,
      timestamp: new Date().toISOString()
    };

    const updated = [...transactions, transaction];
    setTransactions(updated);
    localStorage.setItem('gym_transactions', JSON.stringify(updated));

    // Assign a dummy workout plan to the user as a result of purchase
    addWorkoutPlan({
      memberId: user.id,
      title: `Purchased: ${plan.title}`,
      exercises: [],
      assignedBy: plan.trainerName
    });

    return true;
  }, [user, transactions, marketplacePlans, addWorkoutPlan]
  );

  // ── Financial Ledger ─────────────────────────
  const addExpense = (expenseData: Partial<Expense>) => {
    if (user?.role !== 'admin') return;
    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      category: expenseData.category || 'other',
      amount: expenseData.amount || 0,
      description: expenseData.description || '',
      addedBy: user.name
    };
    const updated = [...expenses, expense];
    setExpenses(updated);
    localStorage.setItem('gym_expenses', JSON.stringify(updated));
  };

  const deleteExpense = (id: string) => {
    if (user?.role !== 'admin') return;
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    localStorage.setItem('gym_expenses', JSON.stringify(updated));
  };

  // ── Trainer Payroll ─────────────────────────
  const addTrainerShift = (shiftData: Partial<TrainerShift>) => {
    if (user?.role !== 'admin' && user?.role !== 'trainer') return;
    const shift: TrainerShift = {
      id: Math.random().toString(36).substr(2, 9),
      trainerId: shiftData.trainerId || user.id,
      trainerName: shiftData.trainerName || user.name,
      startTime: shiftData.startTime || new Date().toISOString(),
      endTime: shiftData.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      hourlyRate: shiftData.hourlyRate || 15
    };
    const updated = [...trainerShifts, shift];
    setTrainerShifts(updated);
    localStorage.setItem('gym_trainer_shifts', JSON.stringify(updated));
  };

  const generatePayroll = (trainerId: string, monthString: string) => {
    const shiftsInMonth = trainerShifts.filter(s => s.trainerId === trainerId && s.startTime.startsWith(monthString));

    let shiftEarnings = 0;
    shiftsInMonth.forEach(s => {
      const hours = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
      shiftEarnings += hours * s.hourlyRate;
    });

    const commisionsInMonth = transactions.filter(t => t.trainerId === trainerId && t.timestamp.startsWith(monthString));
    const commissionEarnings = commisionsInMonth.reduce((acc, t) => acc + t.trainerEarnings, 0);

    const baseSalary = 500; // Mock base salary
    const totalEarnings = baseSalary + shiftEarnings + commissionEarnings;

    const record: PayrollRecord = {
      id: Math.random().toString(36).substr(2, 9),
      trainerId,
      trainerName: shiftsInMonth[0]?.trainerName || 'Trainer',
      monthString,
      baseSalary,
      shiftEarnings,
      commissionEarnings,
      totalEarnings,
      status: 'pending'
    };

    const updated = [...payrollRecords, record];
    setPayrollRecords(updated);
    localStorage.setItem('gym_payroll_records', JSON.stringify(updated));
  };

  // ── Gym Squads ──────────────────────────────
  const createSquad = (name: string, description: string) => {
    if (!user || user.squadId) return; // User must not be in a squad already
    const newSquad: GymSquad = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      captainId: user.id,
      captainName: user.name,
      memberIds: [user.id],
      totalPoints: user.points || 0,
      createdAt: new Date().toISOString()
    };
    const updatedSquads = [...squads, newSquad];
    setSquads(updatedSquads);
    localStorage.setItem('gym_squads', JSON.stringify(updatedSquads));

    updateCurrentUserProfile({ squadId: newSquad.id });
    updateMember(user.id, { squadId: newSquad.id });
  };

  const joinSquad = (squadId: string) => {
    if (!user || user.squadId) return;
    const squad = squads.find(s => s.id === squadId);
    if (!squad) return;

    const updatedSquad = {
      ...squad,
      memberIds: [...squad.memberIds, user.id],
      totalPoints: squad.totalPoints + (user.points || 0)
    };
    const updatedSquads = squads.map(s => s.id === squadId ? updatedSquad : s);
    setSquads(updatedSquads);
    localStorage.setItem('gym_squads', JSON.stringify(updatedSquads));

    updateCurrentUserProfile({ squadId });
    updateMember(user.id, { squadId });
  };

  const leaveSquad = () => {
    if (!user || !user.squadId) return;
    const squad = squads.find(s => s.id === user.squadId);
    if (!squad) return;

    // If captain leaves and others exist, transfer captaincy. Else delete squad.
    let updatedSquads = [...squads];
    if (squad.memberIds.length <= 1) {
      updatedSquads = updatedSquads.filter(s => s.id !== squad.id);
    } else {
      const remainingMembers = squad.memberIds.filter(id => id !== user.id);
      const nextCaptainId = remainingMembers[0];
      const nextCaptain = members.find(m => m.id === nextCaptainId);
      updatedSquads = updatedSquads.map(s => s.id === squad.id ? {
        ...s,
        memberIds: remainingMembers,
        captainId: nextCaptainId,
        captainName: nextCaptain?.name || 'Unknown',
        totalPoints: s.totalPoints - (user.points || 0)
      } : s);
    }

    setSquads(updatedSquads);
    localStorage.setItem('gym_squads', JSON.stringify(updatedSquads));

    // We can't use undefined directly in the update if it expects the exact type sometimes, 
    // but spreading with a fake or clearing it is fine.
    const updatedUser = { ...user };
    delete updatedUser.squadId;
    setUser(updatedUser);
    localStorage.setItem('gym_user', JSON.stringify(updatedUser));

    // Also update members list
    const updatedMembers = members.map(m => {
      if (m.id === user.id) {
        const mCopy = { ...m };
        delete mCopy.squadId;
        return mCopy;
      }
      return m;
    });
    setMembers(updatedMembers);
    localStorage.setItem('gym_members', JSON.stringify(updatedMembers));
  };

  // ── Churn Predictor ─────────────────────────
  const getAtRiskMembers = () => {
    const activeMembers = members.filter(m => m.role === 'member' && m.status === 'active');
    const riskList: { member: User, riskLevel: 'High' | 'Medium' | 'Low', reason: string }[] = [];
    const now = Date.now();

    activeMembers.forEach(m => {
      let riskScore = 0;
      let reasonChunks = [];

      // Factor 1: Days since last attendance
      const mAttendance = attendance.filter(a => a.memberId === m.id);
      const lastAttendedObj = mAttendance[mAttendance.length - 1];
      const daysSinceLastWorkout = lastAttendedObj
        ? Math.floor((now - new Date(lastAttendedObj.timestamp).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((now - new Date(m.memberSince).getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastWorkout > 14) {
        riskScore += 3;
        reasonChunks.push(`Absent for ${daysSinceLastWorkout} days`);
      } else if (daysSinceLastWorkout > 7) {
        riskScore += 1;
        reasonChunks.push(`Absent for ${daysSinceLastWorkout} days`);
      }

      // Factor 2: Subscription expiring soon
      if (m.subscriptionEndDate) {
        const daysToExpiry = Math.ceil((new Date(m.subscriptionEndDate).getTime() - now) / (1000 * 60 * 60 * 24));
        if (daysToExpiry > 0 && daysToExpiry <= 14) {
          riskScore += 2;
          reasonChunks.push(`Sub expires in ${daysToExpiry} days`);
        }
      }

      // Factor 3: No active interactions (points < 1000 and joined > 30 days ago)
      const joinDays = Math.floor((now - new Date(m.memberSince).getTime()) / (1000 * 60 * 60 * 24));
      if (joinDays > 30 && (m.points || 0) < 1000) {
        riskScore += 1;
        reasonChunks.push(`Low app engagement`);
      }

      if (riskScore >= 4) {
        riskList.push({ member: m, riskLevel: 'High', reason: reasonChunks.join(', ') });
      } else if (riskScore >= 2) {
        riskList.push({ member: m, riskLevel: 'Medium', reason: reasonChunks.join(', ') });
      } else if (riskScore === 1) {
        riskList.push({ member: m, riskLevel: 'Low', reason: reasonChunks.join(', ') });
      }
    });

    return riskList.sort((a, b) => {
      const riskWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
    });
  };

  // ── Leads (Guest Pass) ──────────────────────
  const addLead = async (leadData: Partial<Lead>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newLead: Lead = {
      id,
      name: leadData.name || 'Unknown Guest',
      phone: leadData.phone || '',
      visitDate: new Date().toISOString(),
      referredBy: leadData.referredBy,
      status: 'visited'
    };
    await setDoc(doc(db, 'leads', id), newLead);
  };

  // ── Gym Social Feed ──────────────────────────
  const addSocialPost = async (content: string) => {
    if (!user) return;
    const id = Math.random().toString(36).substr(2, 9);
    const post: SocialPost = {
      id,
      authorId: user.id,
      authorName: user.name,
      content,
      likesCount: 0,
      likedBy: [],
      comments: [],
      timestamp: new Date().toISOString()
    };
    await setDoc(doc(db, 'socialPosts', id), post);
  };

  const toggleLikePost = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'socialPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const post = postSnap.data() as SocialPost;
      const hasLiked = post.likedBy.includes(user.id);
      const newLikedBy = hasLiked ? post.likedBy.filter(id => id !== user.id) : [...post.likedBy, user.id];
      await updateDoc(postRef, { likedBy: newLikedBy, likesCount: newLikedBy.length });
    }
  };

  const addCommentToPost = async (postId: string, text: string) => {
    if (!user || !text.trim()) return;
    const postRef = doc(db, 'socialPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const post = postSnap.data() as SocialPost;
      const comment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        authorId: user.id,
        authorName: user.name,
        text,
        timestamp: new Date().toISOString()
      };
      await updateDoc(postRef, { comments: [...post.comments, comment] });
    }
  };

  // ── VOD & Live Training ──────────────────────
  const joinLiveSession = (sessionId: string) => {
    if (!user) return;
    const updated = liveSessions.map(session => {
      if (session.id === sessionId && !session.participants.includes(user.id)) {
        return { ...session, participants: [...session.participants, user.id] };
      }
      return session;
    });
    setLiveSessions(updated);
    localStorage.setItem('gym_live_sessions', JSON.stringify(updated));
  };

  const checkAndUnlockBadges = useCallback((userId: string) => {
    const targetUser = members.find(u => u.id === userId) || (user?.id === userId ? user : null);
    if (!targetUser) return;

    const userAttendance = attendance.filter(a => a.memberId === userId);
    const userPlans = workoutPlans.filter(w => w.memberId === userId);
    const newlyUnlocked: string[] = [];
    const currentBadges = targetUser.badges || [];

    BADGES.forEach(badge => {
      if (currentBadges.includes(badge.id)) return; // Already unlocked

      let unlocked = false;

      if (badge.criteriaType === 'streak') {
        if (userAttendance.length >= badge.criteriaValue) unlocked = true;
      }
      else if (badge.criteriaType === 'early_bird') {
        const hasEarlyAttendance = userAttendance.some(a => {
          const hour = new Date(a.timestamp).getHours();
          return hour < 7;
        });
        if (hasEarlyAttendance) unlocked = true;
      }
      else if (badge.criteriaType === 'workout_count') {
        if (userPlans.length >= badge.criteriaValue) unlocked = true;
      }

      if (unlocked) {
        newlyUnlocked.push(badge.id);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedBadges = [...currentBadges, ...newlyUnlocked];
      updateMember(userId, { badges: updatedBadges });
      if (user && user.id === userId) {
        updateCurrentUserProfile({ badges: updatedBadges });
      }
      newlyUnlocked.forEach(badgeId => {
        const b = BADGES.find(x => x.id === badgeId);
        if (b) pushNotification('Badge Unlocked! 🏆', `You unlocked the "${b.nameEn}" badge!`, 'success');
      });
    }
  }, [members, user, attendance, updateMember, updateCurrentUserProfile]);

  useEffect(() => {
    const updateCapacity = () => {
      const currentHour = new Date().getHours();
      let baseCapacity = 10;

      const closestPeak = [...peakHours].sort((a, b) => {
        const hA = parseInt(a.hour.split(':')[0], 10);
        const hB = parseInt(b.hour.split(':')[0], 10);
        return Math.abs(currentHour - hA) - Math.abs(currentHour - hB);
      })[0];

      if (closestPeak) {
        const diff = Math.abs(currentHour - parseInt(closestPeak.hour.split(':')[0], 10));
        baseCapacity = Math.max(10, closestPeak.capacity - (diff * 10));
      }

      const noise = Math.floor(Math.random() * 10) - 5;
      let finalCapacity = Math.min(100, Math.max(0, baseCapacity + noise));
      setCurrentCapacity(finalCapacity);
    };

    updateCapacity();
    const interval = setInterval(updateCapacity, 60000);
    return () => clearInterval(interval);
  }, [peakHours]);

  // ── Elite Features: Matchmaker & SOS ──────────────────────
  const sendMatchRequest = (toUserId: string) => {
    if (!user) return;
    const targetUser = members.find(m => m.id === toUserId);
    if (!targetUser) return;

    const newReq: MatchRequest = {
      id: Math.random().toString(36).substr(2, 9),
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      toUserName: targetUser.name,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    const updated = [newReq, ...matchRequests];
    setMatchRequests(updated);
    localStorage.setItem('gym_match_requests', JSON.stringify(updated));
    pushNotification('New Partner Request', `${user.name} wants to be your workout partner!`, 'info');
  };

  const acceptMatchRequest = (requestId: string) => {
    if (!user) return;
    const updated = matchRequests.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r);
    setMatchRequests(updated);
    localStorage.setItem('gym_match_requests', JSON.stringify(updated));

    const req = updated.find(r => r.id === requestId);
    if (req) {
      pushNotification('Request Accepted', `${user.name} accepted your partner request!`, 'success');
    }
  };

  const requestTrainerHelp = (location: string) => {
    if (!user) return;
    const newReq: HelpRequest = {
      id: Math.random().toString(36).substr(2, 9),
      memberId: user.id,
      memberName: user.name,
      location,
      status: 'active',
      timestamp: new Date().toISOString()
    };

    const updated = [newReq, ...helpRequests];
    setHelpRequests(updated);
    localStorage.setItem('gym_help_requests', JSON.stringify(updated));

    // Notify all trainers (simulate via browser notification for demo if they were logged in, but we just push it to state)
    pushNotification('🆘 SOS from Floor', `${user.name} needs help at ${location}`, 'error');
  };

  const resolveHelpRequest = (requestId: string) => {
    const updated = helpRequests.map(r => r.id === requestId ? { ...r, status: 'resolved' as const } : r);
    setHelpRequests(updated);
    localStorage.setItem('gym_help_requests', JSON.stringify(updated));
  };

  const addProgressPhoto = (photo: Omit<ProgressPhoto, 'id'>) => {
    const newPhoto = { ...photo, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newPhoto, ...progressPhotos];
    setProgressPhotos(updated);
    localStorage.setItem('gym_progress_photos', JSON.stringify(updated));
    pushNotification('Photo Saved', 'Your progress photo has been secured in the vault.', 'success');
  };

  const deleteProgressPhoto = (id: string) => {
    const updated = progressPhotos.filter(p => p.id !== id);
    setProgressPhotos(updated);
    localStorage.setItem('gym_progress_photos', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage: handleSetLanguage, theme, user, isAuthLoading,
      members, equipment, addMember, updateMember, deleteMember,
      addEquipment, updateEquipment, deleteEquipment,
      maintenanceReports, addMaintenanceReport, updateMaintenanceReport,
      login, logout, activeTab, setActiveTab, addPoints, getExpiringMembers,
      notificationsEnabled, setNotificationsEnabled, expiryDays, setExpiryDays,
      triggerTestNotification, updateCurrentUserProfile,
      attendance, logAttendance,
      workoutPlans, addWorkoutPlan, updateWorkoutPlan,
      weightEntries, addWeightEntry,
      rewards, addReward, updateReward, deleteReward, redeemReward, redemptions,
      messages, sendMessage, markMessageRead, getUnreadCount,
      appNotifications, pushNotification, markNotifRead, clearAllNotifs,
      challenges, challengeEntries, addChallenge, updateChallengeEntry,
      setTheme, kioskMode, setKioskMode,
      marketplacePlans, transactions, publishPlan, purchasePlan,
      expenses, addExpense, deleteExpense,
      socialPosts, addSocialPost, toggleLikePost, addCommentToPost,
      videos, liveSessions, joinLiveSession,
      checkAndUnlockBadges, currentCapacity, peakHours,
      matchRequests, sendMatchRequest, acceptMatchRequest,
      helpRequests, requestTrainerHelp, resolveHelpRequest,
      progressPhotos, addProgressPhoto, deleteProgressPhoto,
      trainerShifts, addTrainerShift, payrollRecords, generatePayroll,
      squads, createSquad, joinSquad, leaveSquad, getAtRiskMembers,
      leads, addLead
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
