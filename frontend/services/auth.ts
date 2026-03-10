import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';
import { User } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export type AuthSession = {
  token: string;
  user: User;
};

export async function loadSessionFromStorage(): Promise<AuthSession | null> {
  const [token, userJson] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!token || !userJson) return null;

  try {
    return { token, user: JSON.parse(userJson) as User };
  } catch {
    await clearSessionFromStorage();
    return null;
  }
}

export async function persistSessionToStorage(session: AuthSession, rememberMe: boolean) {
  if (!rememberMe) {
    await clearSessionFromStorage();
    return;
  }

  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, session.token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearSessionFromStorage() {
  await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
}

export async function loginWithEmailPassword(email: string, password: string): Promise<AuthSession> {
  const response = await authAPI.login({ email, password });

  const payload = response?.data as { token?: string; user?: User } | null;

  if (!payload?.token || !payload?.user) {
    throw new Error('Login failed');
  }

  return { token: payload.token, user: payload.user as User };
}

export async function registerUser(fullName: string, email: string, password: string) {
  return authAPI.register({ fullName, email, password });
}

