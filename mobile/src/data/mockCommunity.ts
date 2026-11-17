import { PlaceReport, PlaceSuggestion } from '../types';

export const MOCK_SUGGESTIONS: PlaceSuggestion[] = [
  {
    id: 's1',
    name: 'Bánh xèo Bà Dưỡng',
    area: 'danang',
    category: 'food',
    note: 'Bánh xèo giòn, nước chấm ngon, nằm trong hẻm K280 Hoàng Diệu.',
    lat: 16.0583,
    lng: 108.2161,
    user_name: 'Minh Hoàng',
    created_at: '2026-11-16',
    status: 'pending',
  },
];

export const MOCK_REPORTS: PlaceReport[] = [
  {
    id: 'rp1',
    place_id: 'dn08',
    user_name: 'Khánh Linh',
    created_at: '2026-11-16',
    status: 'open',
  },
];
