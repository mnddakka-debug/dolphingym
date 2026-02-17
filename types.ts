
import React from 'react';

export type Language = 'en' | 'ar';
export type Theme = 'dark';
export type UserRole = 'member' | 'trainer' | 'admin';
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
  lastMaintenance: string;
  purchaseDate: string;
  quantity: number;
}

export interface User {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  
  // Profile & Security Fields
  phone?: string;
  emergencyContact?: string;
  avatarUrl?: string;
  weightKg?: number;
  heightCm?: number;
  
  age?: number;
  weight?: number; // Legacy, kept for compatibility with components
  height?: number; // Legacy
  goal?: string;
  profileImage?: string;
  memberSince: string;
  points: number;
  badges: string[];
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentMethod?: PaymentMethod;
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
