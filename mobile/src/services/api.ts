import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const TOKEN_KEY = 'vivu.auth.token';
let token: string | null = null;
let invalidSession: (() => void) | undefined;
export const onInvalidSession = (handler?: () => void) => { invalidSession = handler; };
export async function restoreToken() { token = await AsyncStorage.getItem(TOKEN_KEY); return token; }
export async function saveToken(value: string | null) {
  token = value;
  if (value) await AsyncStorage.setItem(TOKEN_KEY, value);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const requestToken = token;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers,
        ...(requestToken ? { Authorization: `Bearer ${requestToken}` } : {}) },
    });
    const body = await response.json();
    if (!response.ok || body.success !== true) {
      if (requestToken === token && requestToken && (response.status === 401 ||
        (response.status === 403 && body.message === 'Tài khoản đã bị khóa.'))) invalidSession?.();
      throw new ApiError(body.message || 'Yêu cầu không thành công.', response.status);
    }
    return body.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Không thể kết nối máy chủ. Kiểm tra mạng và URL backend.', 0);
  } finally { clearTimeout(timeout); }
}
