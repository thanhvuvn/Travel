import { Area, WeatherCondition, WeatherInfo } from '../types';

export const MOCK_WEATHER_DATA: Record<Area, Record<WeatherCondition, WeatherInfo>> = {
  danang: {
    sunny: {
      area: 'danang',
      temp: 31,
      condition: 'sunny',
      label: 'Nắng đẹp ven biển',
      labelEn: 'Sunny Coastal Breeze',
      description: 'Trời trong xanh, sóng êm, tầm nhìn xa tuyệt vời.',
      descriptionEn: 'Clear blue sky, calm waves, and crystal-clear visibility.',
      recommendation:
        'Lý tưởng tắm biển Mỹ Khê (sáng sớm hoặc sau 16:30), check-in bán đảo Sơn Trà. Giữa trưa nên ghé Bảo tàng hoặc nghỉ ngơi.',
      recommendationEn:
        'Ideal for My Khe Beach (early morning or after 16:30) and Son Tra Peninsula. Visit indoor museums or rest around noon.',
      rain_chance: 10,
      humidity: 68,
    },
    rainy: {
      area: 'danang',
      temp: 26,
      condition: 'rainy',
      label: 'Mưa rào rải rác',
      labelEn: 'Scattered Showers',
      description: 'Có mưa từng đợt, đường ven biển trơn trượt.',
      descriptionEn: 'Intermittent rain showers, coastal roads may be slippery.',
      recommendation:
        'Ưu tiên tham quan trong nhà: Bảo tàng Điêu khắc Chăm, Chợ Hàn có mái che, thưởng thức bánh tráng cuốn thịt heo hoặc lẩu hải sản nóng hổi.',
      recommendationEn:
        'Prioritize indoor spots: Cham Sculpture Museum, covered Han Market, pork rice paper rolls, or hot seafood hotpot.',
      rain_chance: 85,
      humidity: 88,
    },
    cloudy: {
      area: 'danang',
      temp: 28,
      condition: 'cloudy',
      label: 'Dịu mát, gió nhẹ',
      labelEn: 'Cool & Breezy',
      description: 'Nắng nhẹ dịu mắt, gió biển Đông mát rượi.',
      descriptionEn: 'Soft sunlight with a refreshing sea breeze.',
      recommendation:
        'Thời tiết lý tưởng cho mọi hoạt động ngoài trời, dạo bộ ngắm Cầu Rồng, công viên APEC và cà phê ven sông Hàn.',
      recommendationEn:
        'Perfect weather for outdoor walks along Dragon Bridge, APEC Park, and riverside Han River cafes.',
      rain_chance: 25,
      humidity: 74,
    },
  },
  hoian: {
    sunny: {
      area: 'hoian',
      temp: 30,
      condition: 'sunny',
      label: 'Nắng vàng phố cổ',
      labelEn: 'Golden Ancient Town Sun',
      description: 'Mái ngói rêu phong rực rỡ dưới nắng.',
      descriptionEn: 'Mossy heritage rooftops glowing under golden sunlight.',
      recommendation:
        'Nên đi dạo phố cổ từ 16:30 để đón hoàng hôn trên sông Hoài và ngắm phố lên đèn lung linh. Trưa nên vào quán Faifo hoặc thưởng thức chè mát lạnh.',
      recommendationEn:
        'Stroll the Old Town from 16:30 for Hoai River sunset and glowing lanterns. Cool down at Faifo Coffee around midday.',
      rain_chance: 15,
      humidity: 72,
    },
    rainy: {
      area: 'hoian',
      temp: 25,
      condition: 'rainy',
      label: 'Phố cổ mưa lãng mạn',
      labelEn: 'Romantic Old Town Rain',
      description: 'Mưa phùn cổ kính, dòng sông Hoài trầm mặc.',
      descriptionEn: 'Gentle nostalgic drizzle over the peaceful Hoai River.',
      recommendation:
        'Ngắm phố cổ dưới mưa từ tầng 2 các quán cà phê cổ, ăn cao lầu nóng, ghé nhà cổ Tấn Ký hoặc làm đèn lồng thủ công trong nhà.',
      recommendationEn:
        'Watch the rain from 2nd-floor heritage cafes, enjoy hot Cao Lau, visit Tan Ky Old House, or try indoor lantern making.',
      rain_chance: 80,
      humidity: 90,
    },
    cloudy: {
      area: 'hoian',
      temp: 27,
      condition: 'cloudy',
      label: 'Trời thu mát mẻ',
      labelEn: 'Mild & Pleasant',
      description: 'Thời tiết ôn hòa, gió sông Hoài se lạnh về chiều.',
      descriptionEn: 'Mild temperatures with a cool breeze by the Hoai River.',
      recommendation:
        'Đạp xe dạo quanh làng gốm Thanh Hà, làng rau Trà Quế và thưởng thức bánh mì Phượng ngắm dòng người qua lại.',
      recommendationEn:
        'Cycle around Thanh Ha Pottery Village, Tra Que Vegetable Village, and enjoy Banh Mi Phuong.',
      rain_chance: 30,
      humidity: 75,
    },
  },
};

/** Gợi ý khung giờ vàng chuẩn du lịch bản địa */
export const LOCAL_TIMING_TIPS = [
  {
    title: 'Phố Cổ Hội An',
    bestTime: '16:30 - 21:00',
    tip: 'Phố cấm xe máy, lồng đèn đồng loạt thắp sáng và có thuyền hoa đăng sông Hoài.',
    icon: '🏮',
  },
  {
    title: 'Cầu Rồng Đà Nẵng',
    bestTime: '20:30 - 21:30',
    tip: 'Thứ 7 & Chủ Nhật có màn phun lửa & phun nước ấn tượng lúc đúng 21:00.',
    icon: '🐉',
  },
  {
    title: 'Bãi Biển Mỹ Khê',
    bestTime: '05:00 - 06:30 & 16:30 - 18:00',
    tip: 'Khung giờ đón bình minh trên biển hoặc tắm biển mát rượi, tránh tia UV gắt.',
    icon: '🏖️',
  },
  {
    title: 'Bán Đảo Sơn Trà',
    bestTime: '07:00 - 09:30',
    tip: 'Không khí trong lành, sương vừa tan, dễ bắt gặp voọc chà vá chân nâu quý hiếm.',
    icon: '🐒',
  },
];
