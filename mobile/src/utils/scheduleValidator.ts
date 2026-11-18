import { ItineraryDay, ItineraryItem } from '../types';
import { calculateHaversineDistance } from './distance';
import { formatCurrency } from './format';

export interface ScheduleWarning {
  id: string;
  type: 'hours' | 'distance' | 'budget';
  severity: 'high' | 'medium';
  title: string;
  detail: string;
  itemIndex?: number;
}

/**
 * Chuyển chuỗi "HH:MM" thành số phút tính từ 00:00
 */
function parseMinutes(hhmm: string): number | null {
  const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return h * 60 + min;
}

/**
 * Trích xuất khung giờ [startMin, endMin] từ chuỗi dạng "07:30 - 08:30" hoặc "08:00 - 17:30"
 */
export function parseTimeRange(rangeStr: string): [number, number] | null {
  if (!rangeStr || rangeStr.toLowerCase().includes('cả ngày')) {
    return null;
  }
  const parts = rangeStr.split('-');
  if (parts.length < 2) return null;
  const start = parseMinutes(parts[0]);
  const end = parseMinutes(parts[1]);
  if (start === null || end === null) return null;
  return [start, end];
}

/**
 * Kiểm tra xem một mục trong lịch trình có bị lệch giờ mở cửa của địa điểm không
 */
export function getItemHoursWarning(item: ItineraryItem): string | null {
  const place = item.place;
  if (!place) return null;

  const slotRange = parseTimeRange(item.time);
  const openRange = parseTimeRange(place.open_hours);
  if (!slotRange || !openRange) return null;

  const [slotStart, slotEnd] = slotRange;
  const [openStart, openEnd] = openRange;

  // Nếu đến trước giờ mở cửa hơn 15 phút
  if (slotStart < openStart - 15) {
    return `Quán mở cửa lúc ${place.open_hours} (bạn đang xếp lúc ${item.time})`;
  }

  // Nếu kết thúc sau giờ đóng cửa hơn 15 phút
  if (slotEnd > openEnd + 15) {
    return `Điểm này đóng cửa lúc ${place.open_hours.split('-')[1]?.trim()} (bạn đang xếp lúc ${item.time})`;
  }

  return null;
}

/**
 * Tính khoảng cách đường bộ ước tính (km) và thời gian di chuyển (phút) giữa 2 điểm
 */
export function estimateTravelBetween(
  prevItem?: ItineraryItem,
  currItem?: ItineraryItem
): { roadKm: number; minutes: number } | null {
  if (!prevItem?.place || !currItem?.place) return null;
  const airKm = calculateHaversineDistance(
    prevItem.place.lat,
    prevItem.place.lng,
    currItem.place.lat,
    currItem.place.lng
  );
  const roadKm = Math.max(0.3, airKm * 1.28); // Hệ số đường bộ thực tế
  const avgSpeedKmh = roadKm > 12 ? 32 : 24; // Tốc độ trung bình nội đô vs ngoại ô
  const minutes = Math.max(3, Math.round((roadKm / avgSpeedKmh) * 60));
  return { roadKm, minutes };
}

export interface TravelOptions {
  roadKm: number;
  carMinutes: number;
  carCost: number;
  bikeMinutes: number;
  bikeCost: number;
}

/**
 * Ước tính di chuyển bằng taxi/Grab và xe máy giữa 2 điểm (số liệu demo, làm tròn 1.000đ)
 * Grab: mở cửa 12.000đ + 10.000đ/km | Xe máy: mở cửa 8.000đ + 6.500đ/km
 */
export function estimateTravelOptions(
  prevItem?: ItineraryItem,
  currItem?: ItineraryItem
): TravelOptions | null {
  const base = estimateTravelBetween(prevItem, currItem);
  if (!base) return null;
  const round = (v: number) => Math.round(v / 1000) * 1000;
  return {
    roadKm: base.roadKm,
    carMinutes: base.minutes,
    carCost: round(12000 + base.roadKm * 10000),
    bikeMinutes: Math.max(3, Math.round(base.minutes * 1.1)),
    bikeCost: round(8000 + base.roadKm * 6500),
  };
}

/**
 * Phân tích toàn bộ cảnh báo bất hợp lý cho một ngày và ngân sách chung
 */
export function inspectSchedule(
  day: ItineraryDay,
  totalCost: number,
  budget: number
): ScheduleWarning[] {
  const warnings: ScheduleWarning[] = [];

  // 1. Cảnh báo vượt ngân sách
  if (budget > 0 && totalCost > budget) {
    const diff = totalCost - budget;
    warnings.push({
      id: 'warn-budget',
      type: 'budget',
      severity: 'high',
      title: 'Tổng chi phí vượt ngân sách',
      detail: `Chi phí dự kiến đang vượt ${formatCurrency(diff)} so với mức ngân sách ${formatCurrency(budget)}.`,
    });
  }

  // 2. Cảnh báo xung đột giờ mở cửa của từng điểm
  day.items.forEach((item, idx) => {
    const hoursIssue = getItemHoursWarning(item);
    if (hoursIssue && item.place) {
      warnings.push({
        id: `warn-hours-${item.id}`,
        type: 'hours',
        severity: 'high',
        title: `Lệch giờ mở cửa: ${item.place.name}`,
        detail: hoursIssue,
        itemIndex: idx,
      });
    }
  });

  // 3. Cảnh báo 2 điểm liên tiếp cách nhau quá xa (> 12km đường bộ)
  for (let i = 1; i < day.items.length; i++) {
    const prev = day.items[i - 1];
    const curr = day.items[i];
    const travel = estimateTravelBetween(prev, curr);
    if (travel && travel.roadKm >= 12 && prev.place && curr.place) {
      warnings.push({
        id: `warn-dist-${curr.id}`,
        type: 'distance',
        severity: 'medium',
        title: `Quãng đường xa (${travel.roadKm.toFixed(1)} km ~ ${travel.minutes} phút)`,
        detail: `Di chuyển từ "${prev.place.name}" sang "${curr.place.name}" khá xa trong cùng một buổi.`,
        itemIndex: i,
      });
    }
  }

  return warnings;
}
