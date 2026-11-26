import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_PLACES } from '../data/mockPlaces';
import { MOCK_REVIEWS } from '../data/mockReviews';
import { MOCK_USERS } from '../data/mockUsers';
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
  togglePlaceActive: (id: string) => void;
  addPlace: (place: Omit<Place, 'id' | 'rating' | 'review_count'>) => void;
  updatePlace: (id: string, updated: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  resetPlacesToDefault: () => void;
  toggleUserLock: (userId: string) => void;
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
  places: MOCK_PLACES,
  users: MOCK_USERS,
  reviews: MOCK_REVIEWS,
  suggestions: MOCK_SUGGESTIONS,
  reports: MOCK_REPORTS,
  addSuggestion: noop,
  approveSuggestion: noop,
  rejectSuggestion: noop,
  reportClosed: () => 'ok',
  resolveReport: noop,
  aiStats: INITIAL_AI_STATS,
  togglePlaceActive: noop,
  addPlace: noop,
  updatePlace: noop,
  deletePlace: noop,
  resetPlacesToDefault: noop,
  toggleUserLock: noop,
  recordAICall: noop,
  addReview: noop,
  setReviewStatus: noop,
  deleteReview: noop,
});

export const PlacesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>(MOCK_SUGGESTIONS);
  const [reports, setReports] = useState<PlaceReport[]>(MOCK_REPORTS);
  const [aiStats, setAiStats] = useState<AIStat>(INITIAL_AI_STATS);

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
    const s = suggestions.find((x) => x.id === id);
    if (!s) return;
    const center = s.area === 'danang' ? { lat: 16.0612, lng: 108.2198 } : { lat: 15.8771, lng: 108.326 };
    addPlace({
      area: s.area,
      name: s.name,
      type: 'Địa điểm do người dùng đề xuất',
      category: s.category,
      lat: s.lat ?? center.lat,
      lng: s.lng ?? center.lng,
      description: s.note || 'Địa điểm do người dùng đề xuất, đang chờ bổ sung thông tin.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      avg_cost: 0,
      open_hours: 'Chưa cập nhật',
      tags: ['người dùng đề xuất'],
      is_active: false,
    });
    setSuggestionStatus(id, 'approved');
    void communityApi.approveSuggestion(id);
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
    const r = reports.find((x) => x.id === id);
    if (!r) return;
    if (confirmClosed) {
      setPlaces((prev) => prev.map((p) => (p.id === r.place_id ? { ...p, is_active: false } : p)));
    }
    setReports((prev) =>
      prev.map((x) =>
        x.place_id === r.place_id && x.status === 'open' && (confirmClosed || x.id === id)
          ? { ...x, status: confirmClosed ? 'closed_confirmed' : 'dismissed' }
          : x
      )
    );
    void communityApi.resolveReport(id, confirmClosed);
  };

  const togglePlaceActive = (id: string) =>
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)));

  const addPlace = (data: Omit<Place, 'id' | 'rating' | 'review_count'>) => {
    const newPlace: Place = {
      ...data,
      id: (data.area === 'danang' ? 'dn' : 'ha') + (Date.now() % 10000),
      rating: 5.0,
      review_count: 1,
    };
    setPlaces((prev) => [newPlace, ...prev]);
  };

  const updatePlace = (id: string, updated: Partial<Place>) =>
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

  const deletePlace = (id: string) => setPlaces((prev) => prev.filter((p) => p.id !== id));

  const resetPlacesToDefault = () => setPlaces(MOCK_PLACES);

  const toggleUserLock = (userId: string) =>
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_locked: !u.is_locked } : u)));

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
        resetPlacesToDefault,
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
