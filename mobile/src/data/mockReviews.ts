import { Review } from '../types';

export const MOCK_REVIEWS: Review[] = [
  { id: 'r1', place_id: 'dn01', user_name: 'Thuỷ Tiên', rating: 5, content: 'Mì Quảng ếch rất đậm đà, nước nhưn ngon, giá hợp lý. Sáng nào cũng đông khách.', created_at: '2026-11-08', status: 'approved' },
  { id: 'r2', place_id: 'dn01', user_name: 'Bảo Long', rating: 4, content: 'Ngon nhưng giờ cao điểm phải chờ khoảng 10 phút.', created_at: '2026-11-10', status: 'approved' },
  { id: 'r3', place_id: 'dn02', user_name: 'Minh Hoàng', rating: 5, content: 'Tối thứ 7 xem phun lửa cực đã, nên đến sớm để chọn chỗ đứng.', created_at: '2026-11-09', status: 'approved' },
  { id: 'r4', place_id: 'ha01', user_name: 'Du Khách', rating: 5, content: 'Chùa Cầu về đêm đẹp lung linh, chụp ảnh rất thích.', created_at: '2026-11-11', status: 'approved' },
  { id: 'r5', place_id: 'ha03', user_name: 'Khánh Linh', rating: 4, content: 'Bánh mì giòn, nhân đầy đặn. Hơi đông nhưng đáng thử.', created_at: '2026-11-12', status: 'approved' },
  { id: 'r6', place_id: 'dn03', user_name: 'Ẩn danh 231', rating: 1, content: 'Link quảng cáo vay tiền nhanh, liên hệ ngay!!!', created_at: '2026-11-15', status: 'pending' },
  { id: 'r7', place_id: 'ha02', user_name: 'Hoài Nam', rating: 5, content: 'Cao lầu chuẩn vị Hội An, sợi mì dai, thịt xá xíu thơm.', created_at: '2026-11-16', status: 'pending' },
];
