import React, { createContext, useContext, useState } from 'react';
import { ItineraryDay, ItineraryItem, Place, Area, WeatherCondition } from '../types';
import { calculateHaversineDistance } from '../utils/distance';
import { parseTimeRange } from '../utils/scheduleValidator';
import { useAuth } from './AuthContext';
import { usePlaces } from './PlacesContext';

export const TIME_SLOTS = [
  '07:30 - 08:30',
  '09:00 - 11:00',
  '12:00 - 13:30',
  '15:00 - 17:00',
  '19:00 - 20:30',
];

export const GUEST_AI_LIMIT = 2;

export interface PlanParams {
  area: Area | 'both';
  days: number;
  people: number;
  interests: string[];
  budget: number;
  event?: string;
  weatherPreference?: WeatherCondition;
}

export interface PlanState {
  params: PlanParams;
  days: ItineraryDay[];
}

export interface SimState {
  aiError: boolean;
  gpsDenied: boolean;
  cameraDenied: boolean;
}

export type CreatePlanResult = 'ok' | 'limit' | 'error' | 'empty';

interface AppDataValue {
  // Yêu thích
  favorites: string[];
  isFavorite: (placeId: string) => boolean;
  toggleFavorite: (placeId: string) => void;

  // Thời tiết hiện tại (động)
  weatherCondition: WeatherCondition;
  setWeatherCondition: (c: WeatherCondition) => void;

  // Lịch trình
  plan: PlanState | null;
  guestUsed: number;
  createPlan: (params: PlanParams) => CreatePlanResult;
  clearPlan: () => void;
  moveItem: (dayIndex: number, index: number, dir: 'up' | 'down') => void;
  removeItem: (dayIndex: number, index: number) => void;
  addPlaceToDay: (dayIndex: number, place: Place) => void;
  regenerateDay: (dayIndex: number) => void;
  optimizeDay: (dayIndex: number) => void;

  // Mô phỏng trạng thái lỗi (phục vụ demo)
  sim: SimState;
  setSim: (patch: Partial<SimState>) => void;
}

const noop = () => {};

const AppDataContext = createContext<AppDataValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: noop,
  weatherCondition: 'sunny',
  setWeatherCondition: noop,
  plan: null,
  guestUsed: 0,
  createPlan: () => 'error',
  clearPlan: noop,
  moveItem: noop,
  removeItem: noop,
  addPlaceToDay: noop,
  regenerateDay: noop,
  optimizeDay: noop,
  sim: { aiError: false, gpsDenied: false, cameraDenied: false },
  setSim: noop,
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sắp xếp theo "điểm gần nhau" (nearest neighbor), bắt đầu bằng quán ăn nếu có */
function orderByProximity(list: Place[]): Place[] {
  if (list.length <= 2) return list;
  const remaining = [...list];
  const startIdx = Math.max(
    0,
    remaining.findIndex((p) => p.category === 'food')
  );
  const result: Place[] = [remaining.splice(startIdx, 1)[0]];
  while (remaining.length) {
    const last = result[result.length - 1];
    let best = 0;
    let bestDist = Infinity;
    remaining.forEach((p, i) => {
      const d = calculateHaversineDistance(last.lat, last.lng, p.lat, p.lng);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    result.push(remaining.splice(best, 1)[0]);
  }
  return result;
}

function buildDay(
  dayNumber: number,
  dayArea: Area,
  pool: Place[],
  params: PlanParams,
  exclude: Set<string>
): ItineraryDay {
  const count = Math.min(params.days <= 2 ? 5 : 4, pool.length);
  let candidates = pool.filter((p) => !exclude.has(p.id));
  if (candidates.length < count) {
    candidates = [...candidates, ...pool.filter((p) => exclude.has(p.id))];
  }

  const scored = shuffle(candidates)
    .map((p) => {
      let score = 0;
      if (params.interests.includes(p.category)) score += 2;
      // Ưu tiên theo sự kiện đặc biệt
      if (params.event && params.event !== 'none' && p.events?.includes(params.event)) {
        score += 5;
      }
      // Ưu tiên theo thời tiết
      if (params.weatherPreference === 'rainy') {
        if (p.weather_suitability === 'indoor') score += 3;
        if (p.category === 'beach') score -= 3;
      } else if (params.weatherPreference === 'sunny') {
        if (p.weather_suitability === 'sunny' || p.category === 'beach') score += 2;
      }
      return { p, s: score };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map((x) => x.p);

  const items: ItineraryItem[] = orderByProximity(scored).map((p, i) => {
    let noteText = p.description;
    if (p.best_time) {
      noteText = `⏰ Giờ vàng: ${p.best_time}. ${p.description}`;
    }
    return {
      id: `${p.id}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      place_id: p.id,
      place: p,
      time: TIME_SLOTS[i] ?? '21:00 - 22:00',
      note: noteText,
      est_cost: p.avg_cost * params.people,
    };
  });

  return { day: dayNumber, area: items[0]?.place?.area ?? dayArea, items };
}

function poolFor(params: PlanParams, dayIndex: number, places: Place[]): { area: Area; pool: Place[] } {
  const active = places.filter((p) => p.is_active);
  if (params.area === 'both') {
    if (params.days === 1) return { area: 'danang', pool: active };
    const area: Area = dayIndex % 2 === 0 ? 'danang' : 'hoian';
    return { area, pool: active.filter((p) => p.area === area) };
  }
  return { area: params.area, pool: active.filter((p) => p.area === params.area) };
}

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { places } = usePlaces();
  const { role } = useAuth();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('sunny');
  const [plan, setPlan] = useState<PlanState | null>(null);
  const [guestUsed, setGuestUsed] = useState(0);
  const [sim, setSimState] = useState<SimState>({
    aiError: false,
    gpsDenied: false,
    cameraDenied: false,
  });

  const setSim = (patch: Partial<SimState>) => setSimState((prev) => ({ ...prev, ...patch }));

  const isFavorite = (id: string) => favorites.includes(id);
  const toggleFavorite = (id: string) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const createPlan = (params: PlanParams): CreatePlanResult => {
    if (role === 'guest' && guestUsed >= GUEST_AI_LIMIT) return 'limit';
    if (sim.aiError) return 'error';

    const used = new Set<string>();
    const days: ItineraryDay[] = [];
    for (let i = 0; i < params.days; i++) {
      const { area, pool } = poolFor(params, i, places);
      if (pool.length === 0) continue;
      const day = buildDay(days.length + 1, area, pool, params, used);
      day.items.forEach((it) => used.add(it.place_id));
      days.push(day);
    }
    if (days.length === 0) return 'empty';

    setPlan({ params, days });
    if (role === 'guest') setGuestUsed((n) => n + 1);
    return 'ok';
  };

  const clearPlan = () => setPlan(null);

  const updateDay = (dayIndex: number, fn: (d: ItineraryDay) => ItineraryDay) =>
    setPlan((prev) =>
      prev
        ? { ...prev, days: prev.days.map((d, i) => (i === dayIndex ? fn(d) : d)) }
        : prev
    );

  const moveItem = (dayIndex: number, index: number, dir: 'up' | 'down') =>
    updateDay(dayIndex, (d) => {
      const target = dir === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= d.items.length) return d;
      const times = d.items.map((it) => it.time);
      const items = [...d.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...d, items: items.map((it, i) => ({ ...it, time: times[i] })) };
    });

  const removeItem = (dayIndex: number, index: number) =>
    updateDay(dayIndex, (d) => ({
      ...d,
      items: d.items
        .filter((_, i) => i !== index)
        .map((it, i) => ({ ...it, time: TIME_SLOTS[i] ?? it.time })),
    }));

  const addPlaceToDay = (dayIndex: number, place: Place) =>
    updateDay(dayIndex, (d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: `${place.id}-${Date.now()}`,
          place_id: place.id,
          place,
          time: TIME_SLOTS[d.items.length] ?? '21:00 - 22:00',
          note: place.description,
          est_cost: place.avg_cost * (plan?.params.people ?? 1),
        },
      ],
    }));

  const regenerateDay = (dayIndex: number) => {
    if (!plan) return;
    const { params } = plan;
    const others = new Set<string>();
    plan.days.forEach((d, i) => {
      if (i !== dayIndex) d.items.forEach((it) => others.add(it.place_id));
    });
    const { area, pool } = poolFor(params, dayIndex, places);
    if (pool.length === 0) return;
    const fresh = buildDay(plan.days[dayIndex].day, area, pool, params, others);
    updateDay(dayIndex, () => fresh);
  };

  /**
   * Tự động tối ưu thứ tự các điểm trong ngày theo giờ mở cửa & khoảng cách gần nhau
   */
  const optimizeDay = (dayIndex: number) =>
    updateDay(dayIndex, (d) => {
      if (d.items.length <= 1) return d;
      const sorted = [...d.items].sort((a, b) => {
        const rangeA = a.place ? parseTimeRange(a.place.open_hours) : null;
        const rangeB = b.place ? parseTimeRange(b.place.open_hours) : null;
        // Ưu tiên điểm mở sớm lên trước, điểm mở chiều/tối (như thả hoa đăng 17:30) xuống cuối
        const startA = rangeA ? rangeA[0] : 420;
        const startB = rangeB ? rangeB[0] : 420;
        const endA = rangeA ? rangeA[1] : 1320;
        const endB = rangeB ? rangeB[1] : 1320;
        if (startA !== startB) return startA - startB;
        return endA - endB;
      });
      return {
        ...d,
        items: sorted.map((it, idx) => ({
          ...it,
          time: TIME_SLOTS[idx] ?? '21:00 - 22:00',
        })),
      };
    });

  return (
    <AppDataContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        weatherCondition,
        setWeatherCondition,
        plan,
        guestUsed,
        createPlan,
        clearPlan,
        moveItem,
        removeItem,
        addPlaceToDay,
        regenerateDay,
        optimizeDay,
        sim,
        setSim,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);
