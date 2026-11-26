import { TravelEvent } from '../types';

export const MOCK_TRAVEL_EVENTS: TravelEvent[] = [
  {
    id: 'hoian_lantern',
    title: 'Đêm Rằm Phố Cổ Hội An',
    titleEn: 'Hoi An Full Moon Lantern Festival',
    area: 'hoian',
    period: 'Tối 14 & 15 Âm lịch hàng tháng',
    periodEn: '14th & 15th Lunar nights monthly',
    badge: 'Lễ hội truyền thống',
    badgeEn: 'Traditional Festival',
    icon: '🏮',
    description:
      'Toàn bộ khu phố cổ tắt đèn điện, thắp sáng bằng hàng nghìn lồng đèn lung linh. Du khách thả hoa đăng trên sông Hoài và chơi bài chòi dân gian.',
    descriptionEn:
      'The Ancient Town turns off electric lights and glows with thousands of colorful lanterns. Release flower lanterns on Hoai River and enjoy folk games.',
    related_places: ['ha01', 'ha04', 'ha05'],
  },
  {
    id: 'diff_fireworks',
    title: 'Lễ Hội Pháo Hoa Quốc Tế Đà Nẵng (DIFF)',
    titleEn: 'Da Nang Int. Fireworks Festival (DIFF)',
    area: 'danang',
    period: 'Tháng 6 - Tháng 7 hàng năm',
    periodEn: 'June – July annually',
    badge: 'Sự kiện quốc tế',
    badgeEn: 'International Event',
    icon: '🎆',
    description:
      'Các màn trình diễn pháo hoa rực rỡ từ các đội tuyển thế giới soi bóng bên bờ sông Hàn. Lịch trình sẽ ưu tiên các điểm xem pháo hoa và du thuyền.',
    descriptionEn:
      'Spectacular international fireworks competitions reflecting over the Han River. AI prioritizes riverside viewing spots and cruises.',
    related_places: ['dn02', 'dn03'],
  },
  {
    id: 'weekend_fire',
    title: 'Cầu Rồng Phun Lửa & Phun Nước',
    titleEn: 'Dragon Bridge Fire & Water Show',
    area: 'danang',
    period: '21:00 Thứ 7 & Chủ Nhật hàng tuần',
    periodEn: 'Sat & Sun at 21:00 weekly',
    badge: 'Sự kiện cuối tuần',
    badgeEn: 'Weekend Show',
    icon: '🐉',
    description:
      'Biểu tượng du lịch số 1 của Đà Nẵng. Cầu cấm xe từ 20:45 để du khách đứng ngắm rồng phun lửa 2 đợt và phun nước 3 đợt.',
    descriptionEn:
      'Da Nang’s #1 icon. Traffic stops at 20:45 so visitors can watch the giant steel dragon breathe real fire and water.',
    related_places: ['dn02'],
  },
  {
    id: 'summer_beach',
    title: 'Mùa Du Lịch Biển Đà Nẵng',
    titleEn: 'Da Nang Summer Beach Season',
    area: 'danang',
    period: 'Tháng 4 - Tháng 8 (Mùa Hè)',
    periodEn: 'April – August (Summer)',
    badge: 'Mùa du lịch vàng',
    badgeEn: 'Peak Beach Season',
    icon: '🌊',
    description:
      'Biển trong xanh như ngọc bích, cát trắng mịn, thích hợp chơi mô tô nước, dù lượn và thưởng thức hải sản tươi sống bên bờ biển.',
    descriptionEn:
      'Turquoise water and powdery white sand, ideal for jet-skiing, parasailing, and fresh beachfront seafood.',
    related_places: ['dn03', 'dn04'],
  },
  {
    id: 'nam_o_moss',
    title: 'Mùa Rêu Xanh Rạn Nam Ô',
    titleEn: 'Nam O Reef Green Moss Season',
    area: 'danang',
    period: 'Tháng 1 - Tháng 3 (Sau Tết)',
    periodEn: 'January – March (Post-Tet)',
    badge: 'Hiện tượng thiên nhiên',
    badgeEn: 'Natural Wonder',
    icon: '🌿',
    description:
      'Các tảng đá ven biển phủ kín một lớp rêu xanh mướt huyền ảo, điểm check-in bình minh tuyệt tác của các nhiếp ảnh gia.',
    descriptionEn:
      'Coastal reefs carpeted in vivid emerald moss — a breathtaking sunrise spot for photographers.',
    related_places: ['dn01', 'dn04'],
  },
];
