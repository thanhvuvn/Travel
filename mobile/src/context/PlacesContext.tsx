import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';
import { Alert } from '../utils/dialog';
import { MOCK_REVIEWS } from '../data/mockReviews';
import { MOCK_REPORTS, MOCK_SUGGESTIONS } from '../data/mockCommunity';
import { communityApi } from '../services/communityApi';
import {
  AIStat,
  Area,
  Category,
  ManagedUser,
  Place,
  PlaceReport,
  PlaceSuggestion,
  Review,
  ReviewStatus,
} from '../types';

export interface NewSuggestion {
  name: string;
  area: Area;
  category: Category;
  note: string;
  lat: number | null;
  lng: number | null;
}

interface PlacesContextValue {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  refreshPlaces: () => Promise<void>;
  resetPlacesToDefault: () => Promise<number>;
  users: ManagedUser[];
  reviews: Review[];
  suggestions: PlaceSuggestion[];
  reports: PlaceReport[];
  addSuggestion: (userName: string, data: NewSuggestion) => void;
  approveSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  reportClosed: (placeId: string, userName: string) => 'ok' | 'duplicate';
  resolveReport: (id: string, confirmClosed: boolean) => void;
  aiStats: AIStat;
  togglePlaceActive: (id: string) => Promise<void>;
  addPlace: (place: Omit<Place, 'id' | 'rating' | 'review_count'>) => Promise<void>;
  updatePlace: (id: string, updated: Partial<Place>) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  toggleUserLock: (userId: string) => Promise<void>;
  recordAICall: (success: boolean) => void;
  addReview: (placeId: string, userName: string, rating: number, content: string) => void;
  setReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  deleteReview: (reviewId: string) => void;
}

const INITIAL_AI_STATS: AIStat = {
  total_calls: 3890,
  success_rate: 99.2,
  avg_time_sec: 2.1,
  prompt_tokens_est: 142000,
};

const noop = () => {};

const PlacesContext = createContext<PlacesContextValue>({
  places: [],
  isLoading: false, error: null, refreshPlaces: async () => {},
  resetPlacesToDefault: async () => 0,
  users: [],
  reviews: MOCK_REVIEWS,
  suggestions: MOCK_SUGGESTIONS,
  reports: MOCK_REPORTS,
  addSuggestion: noop,
  approveSuggestion: noop,
  rejectSuggestion: noop,
  reportClosed: () => 'ok',
  resolveReport: noop,
  aiStats: INITIAL_AI_STATS,
  togglePlaceActive: async () => {},
  addPlace: async () => {},
  updatePlace: async () => {},
  deletePlace: async () => {},
  toggleUserLock: async () => {},
  recordAICall: noop,
  addReview: noop,
  setReviewStatus: noop,
  deleteReview: noop,
});

export const PlacesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>(MOCK_SUGGESTIONS);
  const [reports, setReports] = useState<PlaceReport[]>(MOCK_REPORTS);
  const [aiStats, setAiStats] = useState<AIStat>(INITIAL_AI_STATS);

  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestVersion = useRef(0);
  const refreshPlaces = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<Place[]>(user?.role === 'admin' ? '/places?include_inactive=true' : '/places');
      if (version !== requestVersion.current) return;
      setPlaces(data);
      if (user?.id && user.role === 'admin') {
        const accounts = await apiRequest<ManagedUser[]>('/users');
        if (version === requestVersion.current) setUsers(accounts);
      }
    } catch (e) {
      if (version === requestVersion.current) setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu.');
    } finally { if (version === requestVersion.current) setIsLoading(false); }
  }, [user]);
  useEffect(() => {
    // Clear data at the session boundary before fetching another account.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers([]);
    setPlaces([]);
    if (!authLoading) void refreshPlaces();
    const invalidate = () => { requestVersion.current++; };
    return invalidate;
  }, [refreshPlaces, authLoading]);

  // Tự động đồng bộ Reviews, Suggestions, Reports & Stats từ Backend nếu server đang chạy
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [revRes, sugRes, repRes, statsRes] = await Promise.all([
        communityApi.getReviews(),
        communityApi.getSuggestions(),
        communityApi.getReports(),
        communityApi.getAdminStats(),
      ]);
      if (!mounted) return;
      if (revRes?.success && revRes.data && revRes.data.length > 0) setReviews(revRes.data);
      if (sugRes?.success && sugRes.data && sugRes.data.length > 0) setSuggestions(sugRes.data);
      if (repRes?.success && repRes.data && repRes.data.length > 0) setReports(repRes.data);
      if (statsRes?.success && statsRes.data && statsRes.data.aiStats.total_calls > 0) {
        setAiStats(statsRes.data.aiStats);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const today = () => new Date().toISOString().slice(0, 10);

  const addSuggestion = (userName: string, data: NewSuggestion) => {
    setSuggestions((prev) => [
      { id: 's' + Date.now(), ...data, user_name: userName, created_at: today(), status: 'pending' },
      ...prev,
    ]);
    void communityApi.createSuggestion({ user_name: userName, ...data });
  };

  const setSuggestionStatus = (id: string, status: ReviewStatus) =>
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));

  const rejectSuggestion = (id: string) => {
    setSuggestionStatus(id, 'rejected');
    void communityApi.rejectSuggestion(id);
  };

  /** Duyệt đề xuất: thêm vào danh sách địa điểm ở trạng thái ẨN, admin bổ sung thông tin rồi mới bật cho AI */
  const approveSuggestion = (id: string) => {
    void communityApi.approveSuggestion(id).then(result => {
      if (!result?.success) { Alert.alert('Lỗi', result?.message || 'Không thể duyệt đề xuất.'); return; }
      setSuggestionStatus(id, 'approved');
      void refreshPlaces();
    });
  };

  const reportClosed = (placeId: string, userName: string): 'ok' | 'duplicate' => {
    const dup = reports.some((r) => r.place_id === placeId && r.user_name === userName && r.status === 'open');
    if (dup) return 'duplicate';
    setReports((prev) => [
      { id: 'rp' + Date.now(), place_id: placeId, user_name: userName, created_at: today(), status: 'open' },
      ...prev,
    ]);
    void communityApi.createReport({ place_id: placeId, user_name: userName });
    return 'ok';
  };

  /** confirmClosed = true: xác nhận quán đóng cửa -> ẩn khỏi AI luôn */
  const resolveReport = (id: string, confirmClosed: boolean) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    void communityApi.resolveReport(id, confirmClosed).then(result => {
      if (!result?.success) { Alert.alert('Lỗi', result?.message || 'Không thể xử lý báo cáo.'); return; }
      setReports(prev => prev.map(item =>
        item.place_id === report.place_id && item.status === 'open' && (confirmClosed || item.id === id)
          ? { ...item, status: confirmClosed ? 'closed_confirmed' : 'dismissed' } : item));
      void refreshPlaces();
    });
  };

  const savePlace = (place: Place) => setPlaces(prev => {
    const exists = prev.some(p => p.id === place.id);
    return exists ? prev.map(p => p.id === place.id ? place : p) : [place, ...prev];
  });
  const resetPlacesToDefault = async () => {
    const result = await apiRequest<{ restored_count: number; places: Place[] }>('/places/reset-seed', { method: 'POST' });
    setPlaces(prev => {
      const restoredIds = new Set(result.places.map(p => p.id));
      return [...result.places, ...prev.filter(p => !restoredIds.has(p.id))];
    });
    return result.restored_count;
  };
  const togglePlaceActive = async (id: string) => {
    const current = places.find(p => p.id === id);
    savePlace(await apiRequest<Place>(`/places/${id}/toggle`, {
      method: 'PATCH', body: JSON.stringify({ is_active: !current?.is_active }),
    }));
  };
  const addPlace = async (data: Omit<Place, 'id' | 'rating' | 'review_count'>) => {
    savePlace(await apiRequest<Place>('/places', { method: 'POST', body: JSON.stringify(data) }));
  };
  const updatePlace = async (id: string, updated: Partial<Place>) => {
    savePlace(await apiRequest<Place>(`/places/${id}`, { method: 'PUT', body: JSON.stringify(updated) }));
  };
  const deletePlace = async (id: string) => {
    savePlace(await apiRequest<Place>(`/places/${id}`, { method: 'DELETE' }));
  };
  const toggleUserLock = async (id: string) => {
    const current = users.find(u => u.id === id);
    const updated = await apiRequest<ManagedUser>(`/users/${id}/lock`, {
      method: 'PATCH', body: JSON.stringify({ is_locked: !current?.is_locked }),
    });
    setUsers(prev => prev.map(u => u.id === id ? updated : u));
  };

  const recordAICall = (success: boolean) =>
    setAiStats((prev) => {
      const newTotal = prev.total_calls + 1;
      const successCount = Math.round((prev.total_calls * prev.success_rate) / 100) + (success ? 1 : 0);
      return {
        ...prev,
        total_calls: newTotal,
        success_rate: Number(((successCount / newTotal) * 100).toFixed(1)),
      };
    });

  const addReview = (placeId: string, userName: string, rating: number, content: string) => {
    setReviews((prev) => [
      {
        id: 'r' + Date.now(),
        place_id: placeId,
        user_name: userName,
        rating,
        content,
        created_at: new Date().toISOString().slice(0, 10),
        status: 'pending',
      },
      ...prev,
    ]);
    void communityApi.createReview({ place_id: placeId, user_name: userName, rating, content });
  };

  const setReviewStatus = (reviewId: string, status: ReviewStatus) => {
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status } : r)));
    void communityApi.updateReviewStatus(reviewId, status);
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    void communityApi.deleteReview(reviewId);
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        isLoading, error, refreshPlaces, resetPlacesToDefault,
        users,
        reviews,
        suggestions,
        reports,
        addSuggestion,
        approveSuggestion,
        rejectSuggestion,
        reportClosed,
        resolveReport,
        aiStats,
        togglePlaceActive,
        addPlace,
        updatePlace,
        deletePlace,
        toggleUserLock,
        recordAICall,
        addReview,
        setReviewStatus,
        deleteReview,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlaces = () => useContext(PlacesContext);
