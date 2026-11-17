export type Area = 'danang' | 'hoian';

export type Category = 'all' | 'food' | 'beach' | 'checkin' | 'culture' | 'cafe';

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy';

export interface WeatherInfo {
  area: Area;
  temp: number;
  condition: WeatherCondition;
  label: string;
  description: string;
  recommendation: string;
  rain_chance: number;
  humidity: number;
}

export interface TravelEvent {
  id: string;
  title: string;
  area: Area | 'both';
  period: string;
  badge: string;
  icon: string;
  description: string;
  related_places: string[];
}

export interface Place {
  id: string;
  area: Area;
  name: string;
  type: string;
  category: Category;
  lat: number;
  lng: number;
  description: string;
  image: string;
  avg_cost: number;
  open_hours: string;
  rating: number;
  review_count: number;
  tags: string[];
  is_active: boolean;
  best_time?: string;
  weather_suitability?: 'all' | 'sunny' | 'rainy' | 'indoor';
  events?: string[];
  seasons?: ('spring' | 'summer' | 'autumn' | 'winter' | 'all')[];
}

export interface ItineraryItem {
  id: string;
  place_id: string;
  place?: Place;
  time: string;
  note: string;
  est_cost: number;
}

export interface ItineraryDay {
  day: number;
  area: Area;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  title: string;
  areas: Area[];
  days: ItineraryDay[];
  total_cost: number;
  people: number;
  created_at: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_locked: boolean;
  created_at: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  place_id: string;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
  status: ReviewStatus;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  area: Area;
  category: Category;
  note: string;
  lat: number | null;
  lng: number | null;
  user_name: string;
  created_at: string;
  status: ReviewStatus;
}

export type ReportStatus = 'open' | 'closed_confirmed' | 'dismissed';

export interface PlaceReport {
  id: string;
  place_id: string;
  user_name: string;
  created_at: string;
  status: ReportStatus;
}

export interface AIStat {
  total_calls: number;
  success_rate: number;
  avg_time_sec: number;
  prompt_tokens_est: number;
}

export type MainTab = 'home' | 'planner' | 'itinerary' | 'vision' | 'profile' | 'admin';
