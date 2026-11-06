import { api } from "./api";

export interface UserSettingsData {
  id: string;
  userId: string;
  emailStreakReminder: boolean;
  emailWeeklyDigest: boolean;
  isPublicProfile: boolean;
  timezone: string;
  dayCutoffHour: number;
}

export interface FriendEntry {
  friendshipId: string;
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
  level: number;
  totalXp: number;
  sparks: number;
}

export interface PublicProfileData {
  id: string;
  name: string;
  emailPrefix?: string | null;
  image?: string | null;
  isPrivate: boolean;
  message?: string;
  level?: number;
  totalXp?: number;
  sparks?: number;
  totalHabits?: number;
  totalCheckIns?: number;
  achievementsCount?: number;
  achievements?: {
    key: string;
    title: string;
    description: string;
    unlockedAt: string;
  }[];
  joinedAt?: string;
}

export const userService = {
  getProfile: (userId: string) =>
    api.get<any>(`/users/${userId}`),
  updateProfile: (userId: string, data: { name?: string; image?: string; currentPassword?: string; newPassword?: string }) =>
    api.patch<any>(`/users/${userId}/profile`, data),
  getSettings: (userId: string) =>
    api.get<UserSettingsData>(`/users/settings?userId=${userId}`),
  updateSettings: (userId: string, data: Partial<UserSettingsData>) =>
    api.patch<UserSettingsData>(`/users/settings?userId=${userId}`, data),
  getFriends: (userId: string) =>
    api.get<FriendEntry[]>(`/users/friends?userId=${userId}`),
  addFriend: (userId: string, friendEmailOrUsername: string) =>
    api.post<{ success: boolean; message: string }>(`/users/friends?userId=${userId}`, { friendEmailOrUsername }),
  removeFriend: (userId: string, friendId: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/friends/${friendId}?userId=${userId}`),
  getPublicProfile: (usernameOrId: string) =>
    api.get<PublicProfileData>(`/users/profile/public/${usernameOrId}`),
  deleteAccount: (userId: string) =>
    api.delete<any>(`/users/${userId}`),
};

