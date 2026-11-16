export type Area = 'danang' | 'hoian';

export type Category = 'all' | 'food' | 'beach' | 'checkin' | 'culture' | 'cafe';

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

export type MainTab = 'home' | 'planner' | 'itinerary' | 'vision' | 'profile';
