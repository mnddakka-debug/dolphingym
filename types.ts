
import React from 'react';

export type Language = 'en' | 'ar';
export type Theme = 'dark' | 'light';
export type UserRole = 'member' | 'trainer' | 'admin' | 'freelance_trainer';
export type UserStatus = 'active' | 'blocked' | 'suspended';
export type PaymentMethod = 'cash' | 'click';

export type EquipmentStatus = 'available' | 'maintenance' | 'broken';
export type EquipmentCategory = 'strength' | 'cardio' | 'flexibility' | 'weights';

export interface Equipment {
  id: string;
  nameEn: string;
  nameAr: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  lastMaintenanceDate: string;
  purchaseDate: string;
  quantity: number;
  usageHours?: number;
  maintenanceIntervalHours?: number;
}

export interface MaintenanceReport {
  id: string;
  equipmentId: string;
  reportedBy: string; // User ID
  reportedByName: string; // User Name
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  timestamp: string;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  durationMins: number;
}

export interface LiveSession {
  id: string;
  title: string;
  instructorName: string;
  scheduledTime: string;
  durationMins: number;
  meetLink: string;
  participants: string[]; // member IDs
}

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  points: number;
  bodyFatPercentage?: number;

  // Profile & Security Fields
  phone?: string;
  emergencyContact?: string;
  avatarUrl?: string;
  weightKg?: number;
  heightCm?: number;

  // Elite Features
  wearableDevice?: 'apple_watch' | 'garmin' | 'whoop' | 'none';
  smartAccessEnabled?: boolean;
  nutritionFocus?: 'protein_high' | 'balanced' | 'low_carb';
  squadId?: string;

  age?: number;
  weight?: number; // Legacy, kept for compatibility with components
  height?: number; // Legacy
  goal?: string; // 'lose_weight', 'build_muscle', 'endurance', 'stay_fit'
  preferredWorkoutTime?: 'morning' | 'afternoon' | 'evening';
  profileImage?: string;
  memberSince: string;
  badges: string[];
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionPrice?: number; // Custom monthly cost for variable revenue calculation
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  referralCode?: string;
  accessPin?: string; // 4-digit PIN for gym entry
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: string;
}

export interface HelpRequest {
  id: string;
  memberId: string;
  memberName: string;
  location: string; // e.g., 'Free Weights Zone', 'Cardio Area'
  status: 'active' | 'resolved';
  timestamp: string;
}

export interface ProgressPhoto {
  id: string;
  memberId: string;
  photoUrl: string; // Base64 or URL
  date: string; // ISO format
  weight?: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string; // ISO date string
  method: 'qr' | 'manual' | 'face' | 'nfc';
}

export interface PlannedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  visitDate: string;
  referredBy?: string; // memberId of whoever sent the guest pass
  status: 'visited' | 'contacted' | 'converted';
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  title: string;
  exercises: PlannedExercise[];
  nutritionNotes?: string;
  calorieTarget?: number;
  proteinTarget?: number;
  createdAt: string;
  assignedBy: string; // trainer/admin name
}

export interface WeightEntry {
  id: string;
  memberId: string;
  weightKg: number;
  date: string; // YYYY-MM-DD
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  emoji: string;
  stock: number; // -1 = unlimited
}

export interface RedemptionRecord {
  id: string;
  memberId: string;
  memberName: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  icon?: string;
}

export type ChallengeType = 'attendance' | 'weight_loss' | 'workout_count';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  pointReward: number;
  badgeEmoji: string;
  active: boolean;
}

export interface ChallengeEntry {
  id: string;
  challengeId: string;
  memberId: string;
  memberName: string;
  currentValue: number;
  completed: boolean;
  completedAt?: string;
}

export interface NavItem {
  id: string;
  icon: React.ReactNode;
  labelEn: string;
  labelAr: string;
}

export interface Badge {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  descriptionEn: string;
  descriptionAr: string;
  unlocked: boolean;
}

export interface BadgeDef {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  criteriaType: 'streak' | 'workout_count' | 'early_bird';
  criteriaValue: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  avatar: string;
  rank: number;
  isCurrentUser?: boolean;
}

export interface WorkoutHistoryEntry {
  id: string;
  workoutId: string;
  title: string;
  date: string;
  duration: string;
  calories: number;
  category: string;
}

export interface TrainerPlan {
  id: string;
  trainerId: string;
  trainerName: string;
  title: string;
  description: string;
  price: number;
  durationWeeks: number;
  features: string[]; // List of benefits
  active: boolean;
}

export interface Transaction {
  id: string;
  buyerId: string;
  buyerName: string;
  trainerId: string;
  trainerName: string;
  planId: string;
  planTitle: string;
  amount: number;
  gymCommission: number; // 20%
  trainerEarnings: number; // 80%
  timestamp: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'rent' | 'salary' | 'utilities' | 'maintenance' | 'marketing' | 'other';
  amount: number;
  description: string;
  addedBy: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likesCount: number;
  likedBy: string[]; // User IDs who liked this
  comments: Comment[];
  timestamp: string;
}

export interface TrainerShift {
  id: string;
  trainerId: string;
  trainerName: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  hourlyRate: number;
}

export interface PayrollRecord {
  id: string;
  trainerId: string;
  trainerName: string;
  monthString: string; // e.g., 'YYYY-MM'
  baseSalary: number;
  shiftEarnings: number;
  commissionEarnings: number;
  totalEarnings: number;
  status: 'pending' | 'paid';
}

export interface GymSquad {
  id: string;
  name: string;
  description: string;
  captainId: string;
  captainName: string;
  memberIds: string[];
  totalPoints: number;
  avatarUrl?: string;
  createdAt: string;
}


