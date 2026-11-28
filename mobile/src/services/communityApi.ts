import { AIStat, Area, Category, PlaceReport, PlaceSuggestion, Review, ReviewStatus } from '../types';

import { apiRequest } from './api';
export { API_BASE_URL } from './api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T> | null> {
  try {
    return { success: true, data: await apiRequest<T>(path, options) };
  } catch {
    // Legacy community contract: null báo không kết nối được; core APIs không fallback.
    return null;
  }
}

export interface AdminStatsPayload {
  places: { total: number; active: number; inactive: number; danang: number; hoian: number };
  users: { total: number; locked: number };
  moderation: { pendingReviews: number; pendingSuggestions: number; openReports: number; total: number };
  aiStats: AIStat;
  weeklyCalls: { date: string; d: string; v: number }[];
  hotPlaces: { id: string; name: string; area: Area; rating: number; review_count: number }[];
}

export const communityApi = {
  // Reviews
  getReviews: () => request<Review[]>('/reviews'),
  createReview: (payload: { place_id: string; user_name: string; rating: number; content: string }) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
  updateReviewStatus: (id: string, status: ReviewStatus) =>
    request<Review>(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteReview: (id: string) =>
    request<{ id: string }>(`/reviews/${id}`, { method: 'DELETE' }),

  // Suggestions
  getSuggestions: () => request<PlaceSuggestion[]>('/suggestions'),
  createSuggestion: (payload: {
    user_name: string;
    name: string;
    area: Area;
    category: Category;
    note: string;
    lat: number | null;
    lng: number | null;
  }) => request<PlaceSuggestion>('/suggestions', { method: 'POST', body: JSON.stringify(payload) }),
  approveSuggestion: (id: string) =>
    request<{ suggestion: PlaceSuggestion }>(`/suggestions/${id}/approve`, { method: 'PATCH' }),
  rejectSuggestion: (id: string) =>
    request<PlaceSuggestion>(`/suggestions/${id}/reject`, { method: 'PATCH' }),

  // Reports
  getReports: () => request<PlaceReport[]>('/reports'),
  createReport: (payload: { place_id: string; user_name: string }) =>
    request<PlaceReport>('/reports', { method: 'POST', body: JSON.stringify(payload) }),
  resolveReport: (id: string, confirmClosed: boolean) =>
    request<{ id: string }>(`/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ confirmClosed }),
    }),

  // Admin Stats
  getAdminStats: () => request<AdminStatsPayload>('/admin/stats'),
};
