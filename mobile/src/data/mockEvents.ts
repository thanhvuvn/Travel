import { TravelEvent } from '../types';

export const MOCK_TRAVEL_EVENTS: TravelEvent[] = [
  {
    id: 'hoian_lantern',
    title: 'Đêm Rằm Phố Cổ Hội An',
    area: 'hoian',
    period: 'Tối 14 & 15 Âm lịch hàng tháng',
    badge: 'Lễ hội truyền thống',
    icon: '🏮',
    description:
      'Toàn bộ khu phố cổ tắt đèn điện, thắp sáng bằng hàng nghìn lồng đèn lung linh. Du khách thả hoa đăng trên sông Hoài và chơi bài chòi dân gian.',
    related_places: ['ha01', 'ha04', 'ha05'],
  },
  {
    id: 'diff_fireworks',
    title: 'Lễ Hội Pháo Hoa Quốc Tế Đà Nẵng (DIFF)',
    area: 'danang',
    period: 'Tháng 6 - Tháng 7 hàng năm',
    badge: 'Sự kiện quốc tế',
    icon: '🎆',
    description:
      'Các màn trình diễn pháo hoa rực rỡ từ các đội tuyển thế giới soi bóng bên bờ sông Hàn. Lịch trình sẽ ưu tiên các điểm xem pháo hoa và du thuyền.',
    related_places: ['dn02', 'dn03'],
  },
  {
    id: 'weekend_fire',
    title: 'Cầu Rồng Phun Lửa & Phun Nước',
    area: 'danang',
    period: '21:00 Thứ 7 & Chủ Nhật hàng tuần',
    badge: 'Sự kiện cuối tuần',
    icon: '🐉',
    description:
      'Biểu tượng du lịch số 1 của Đà Nẵng. Cầu cấm xe từ 20:45 để du khách đứng ngắm rồng phun lửa 2 đợt và phun nước 3 đợt.',
    related_places: ['dn02'],
  },
  {
    id: 'summer_beach',
    title: 'Mùa Du Lịch Biển Đà Nẵng',
    area: 'danang',
    period: 'Tháng 4 - Tháng 8 (Mùa Hè)',
    badge: 'Mùa du lịch vàng',
    icon: '🌊',
    description:
      'Biển trong xanh như ngọc bích, cát trắng mịn, thích hợp chơi mô tô nước, dù lượn và thưởng thức hải sản tươi sống bên bờ biển.',
    related_places: ['dn03', 'dn04'],
  },
  {
    id: 'nam_o_moss',
    title: 'Mùa Rêu Xanh Rạn Nam Ô',
    area: 'danang',
    period: 'Tháng 1 - Tháng 3 (Sau Tết)',
    badge: 'Hiện tượng thiên nhiên',
    icon: '🌿',
    description:
      'Các tảng đá ven biển phủ kín một lớp rêu xanh mướt huyền ảo, điểm check-in bình minh tuyệt tác của các nhiếp ảnh gia.',
    related_places: ['dn01', 'dn04'],
  },
];
