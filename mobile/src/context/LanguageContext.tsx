import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppLanguage = 'vi' | 'en';

const LANG_STORAGE_KEY = 'vivu_lang_v1';

const translations = {
  vi: {
    // BottomNav
    tab_home: 'Khám phá',
    tab_planner: 'Tạo lịch',
    tab_itinerary: 'Lịch trình',
    tab_vision: 'Quét AI',
    tab_profile: 'Cá nhân',

    // HomeScreen
    home_greeting_guest: 'Chào bạn đến miền Trung 👋',
    home_greeting_user: 'Xin chào,',
    home_login: 'Đăng nhập',
    home_area_dn: 'Đà Nẵng',
    home_area_ha: 'Hội An',
    home_area_all: 'Cả 2 khu vực',
    home_search_placeholder: 'Tìm quán ăn, bãi biển, Chùa Cầu...',
    home_weather_tip: 'Gợi ý thời tiết: ',
    home_events_title: 'Sự kiện & Mùa lễ hội',
    home_events_live: 'Đang diễn ra',
    home_ai_badge: 'AI LẬP LỊCH TRÌNH',
    home_ai_title: 'Bạn chưa biết đi đâu?',
    home_ai_sub: 'Để Vivu AI sắp xếp trọn vẹn trong 5 giây',
    home_ai_cta: 'Tạo Ngay',
    home_food_title: 'Bản Đồ Ẩm Thực Xứ Quảng',
    home_food_scan: 'Quét món bằng AI',
    home_food_explore: 'Khám phá →',
    home_cat_all: 'Tất cả',
    home_cat_food: 'Ẩm thực',
    home_cat_beach: 'Bãi biển',
    home_cat_checkin: 'Check-in',
    home_cat_culture: 'Văn hóa',
    home_cat_cafe: 'Cà phê',
    home_places_all: 'Điểm nổi bật nhất',
    home_places_dn: 'Điểm đến Đà Nẵng',
    home_places_ha: 'Điểm đến Hội An',
    home_places_count: 'địa điểm',
    home_nearby_title: 'Quanh bạn (GPS)',
    home_suggest_title: 'Biết một nơi hay chưa có trong app?',
    home_suggest_sub: 'Đề xuất để Admin thêm vào cho mọi người.',
    home_suggest_btn: 'Đề xuất',

    // PlannerScreen
    planner_title: 'Lập Lịch Trình Vivu AI',
    planner_sub: 'Tự động tối ưu cung đường & ngân sách',
    planner_timing_title: 'Khung giờ vàng du lịch bản địa',
    planner_step1: '1. Bạn muốn khám phá khu vực nào?',
    planner_step2: '2. Thời gian & Số lượng người đi',
    planner_days: 'Số ngày tham quan',
    planner_people: 'Số người tham gia',
    planner_step3: '3. Sở thích của bạn',
    planner_step3_tip: 'Chọn nhiều mục',
    planner_step4: '4. Dự trù ngân sách',
    planner_step5: '5. Mùa lễ hội & Thời tiết ưu tiên',
    planner_step5_tip: 'Tối ưu trải nghiệm',
    planner_cta: 'Vivu AI, Tạo Lịch Trình Ngay!',
    planner_loading: 'Đang tạo lịch trình...',

    // ItineraryScreen
    itin_empty_title: 'Chưa có lịch trình nào',
    itin_empty_desc: 'Hãy để Vivu AI lập lịch trình theo từng ngày, có giờ giấc, ngân sách và bản đồ chỉ trong vài giây.',
    itin_empty_btn: 'Tạo lịch trình bằng AI',
    itin_total_cost: 'Tổng chi phí',
    itin_days: 'ngày',
    itin_people: 'người',
    itin_per_person: '/người',
    itin_over: 'Vượt',
    itin_left: 'Còn',
    itin_maps_btn: 'Dẫn đường Google Maps',
    itin_day_prefix: 'Ngày',
    itin_day_cost: 'Ngày này',
    itin_add_place: 'Thêm điểm',
    itin_regen_day: 'Tạo lại ngày này',
    itin_valid_bar: 'Lịch trình hợp lý: Giờ mở cửa, khoảng cách và ngân sách đều tối ưu.',
    itin_auto_fix: 'Tự động sửa giờ',
    itin_est_cost: 'Dự trù:',
    itin_directions: 'Dẫn đường',
    itin_save: 'Lưu lịch trình',
    itin_share: 'Chia sẻ',

    // VisionScreen
    vision_title: 'Quét Món Ăn & Danh Thắng',
    vision_sub: 'Chụp ảnh để AI nhận diện và tìm quán ngon chuẩn vị',
    vision_analyzing: 'AI đang phân tích bức ảnh...',
    vision_done: 'Đã nhận diện thành công!',
    vision_pick_sample: 'Chọn mẫu ảnh đặc sản / danh thắng để quét:',
    vision_upload: 'Tải ảnh lên',
    vision_confidence: 'Độ tin cậy',
    vision_how_to_eat: '🍴 Bí quyết thưởng thức đúng điệu:',
    vision_matched_label: 'Địa điểm chuẩn vị trong hệ thống:',
    vision_add_btn: 'Thêm',

    // ProfileScreen
    profile_header: 'Tài Khoản & Cài Đặt',
    profile_guest: 'Khách vãng lai',
    profile_guest_sub: 'Chưa đăng nhập • Chế độ xem thử',
    profile_role: 'Vai trò:',
    profile_admin_btn: 'Mở Trang Quản Trị Hệ Thống (Admin Portal)',
    profile_login: 'Đăng nhập',
    profile_register: 'Đăng ký',
    profile_logout: 'Đăng xuất tài khoản',
    profile_appearance: 'Giao diện & Ngôn ngữ',
    profile_dark_mode: 'Chế độ tối (Dark Mode)',
    profile_dark_on: 'Đang bật giao diện tối',
    profile_dark_off: 'Đang bật giao diện sáng',
    profile_language: 'Ngôn ngữ',
    profile_language_sub: 'Đổi ngôn ngữ hiển thị (Việt / English)',
    profile_favorites: '❤️ Địa điểm yêu thích',
    profile_demo_title: '🧪 Mô phỏng trạng thái lỗi (Demo)',
    profile_demo_sub: 'Bật để trình diễn cách ứng dụng xử lý lỗi, không cần làm hỏng thật.',
    profile_replay_onboarding: 'Xem lại hướng dẫn giới thiệu',
    profile_perms_title: 'Quyền hạn hiện tại:',

    // SurvivalKit
    kit_title: '🎒 Cẩm Nang Bỏ Túi & Hotline',
    kit_sub: 'Chuẩn bị hành lý, mẹo bản địa & hỗ trợ khẩn cấp Đà Nẵng',
    kit_tab_packing: 'Hành lý',
    kit_tab_hotline: 'Hotline 24/7',
    kit_tab_tips: 'Mẹo hay',
    kit_progress: 'Tiến độ chuẩn bị:',
    kit_reset: 'Đặt lại',
  },
  en: {
    // BottomNav
    tab_home: 'Explore',
    tab_planner: 'AI Plan',
    tab_itinerary: 'Itinerary',
    tab_vision: 'Vision AI',
    tab_profile: 'Profile',

    // HomeScreen
    home_greeting_guest: 'Welcome to Central Vietnam 👋',
    home_greeting_user: 'Hello,',
    home_login: 'Sign In',
    home_area_dn: 'Da Nang',
    home_area_ha: 'Hoi An',
    home_area_all: 'Both Areas',
    home_search_placeholder: 'Search food, beaches, Japanese Bridge...',
    home_weather_tip: 'Weather tip: ',
    home_events_title: 'Events & Festivals',
    home_events_live: 'Happening now',
    home_ai_badge: 'AI TRIP PLANNER',
    home_ai_title: 'Not sure where to go?',
    home_ai_sub: 'Let Vivu AI plan your full trip in 5 seconds',
    home_ai_cta: 'Plan Now',
    home_food_title: 'Quang Specialties Food Trail',
    home_food_scan: 'Scan with AI',
    home_food_explore: 'Explore →',
    home_cat_all: 'All',
    home_cat_food: 'Food',
    home_cat_beach: 'Beach',
    home_cat_checkin: 'Check-in',
    home_cat_culture: 'Culture',
    home_cat_cafe: 'Cafe',
    home_places_all: 'Top Highlights',
    home_places_dn: 'Da Nang Highlights',
    home_places_ha: 'Hoi An Highlights',
    home_places_count: 'places',
    home_nearby_title: 'Nearby You (GPS)',
    home_suggest_title: 'Know a hidden gem not in the app?',
    home_suggest_sub: 'Suggest it so Admin can add it for everyone.',
    home_suggest_btn: 'Suggest',

    // PlannerScreen
    planner_title: 'Vivu AI Trip Planner',
    planner_sub: 'Auto-optimize routes, timing & budget',
    planner_timing_title: 'Local Golden-Hour Timing',
    planner_step1: '1. Where do you want to explore?',
    planner_step2: '2. Duration & Group Size',
    planner_days: 'Number of days',
    planner_people: 'Travelers',
    planner_step3: '3. Your Interests',
    planner_step3_tip: 'Multi-select',
    planner_step4: '4. Estimated Budget',
    planner_step5: '5. Festivals & Weather Preference',
    planner_step5_tip: 'Smart optimization',
    planner_cta: 'Vivu AI, Generate Itinerary Now!',
    planner_loading: 'Generating your trip...',

    // ItineraryScreen
    itin_empty_title: 'No itinerary yet',
    itin_empty_desc: 'Let Vivu AI build a day-by-day schedule with opening hours, budget and map in seconds.',
    itin_empty_btn: 'Generate with AI',
    itin_total_cost: 'Total cost',
    itin_days: 'days',
    itin_people: 'people',
    itin_per_person: '/person',
    itin_over: 'Over',
    itin_left: 'Left',
    itin_maps_btn: 'Google Maps Directions',
    itin_day_prefix: 'Day',
    itin_day_cost: 'Day cost',
    itin_add_place: 'Add place',
    itin_regen_day: 'Regenerate day',
    itin_valid_bar: 'Optimal schedule: Opening hours, distances and budget are all balanced.',
    itin_auto_fix: 'Auto-fix hours',
    itin_est_cost: 'Est. cost:',
    itin_directions: 'Directions',
    itin_save: 'Save Trip',
    itin_share: 'Share',

    // VisionScreen
    vision_title: 'Scan Food & Landmarks',
    vision_sub: 'Snap a photo to identify dishes & find authentic spots',
    vision_analyzing: 'AI is analyzing the photo...',
    vision_done: 'Identified successfully!',
    vision_pick_sample: 'Choose a local dish / landmark sample to scan:',
    vision_upload: 'Upload photo',
    vision_confidence: 'Confidence',
    vision_how_to_eat: '🍴 How locals enjoy this dish:',
    vision_matched_label: 'Authentic spot in our database:',
    vision_add_btn: 'Add',

    // ProfileScreen
    profile_header: 'Account & Settings',
    profile_guest: 'Guest Visitor',
    profile_guest_sub: 'Not signed in • Trial mode',
    profile_role: 'Role:',
    profile_admin_btn: 'Open Admin Portal',
    profile_login: 'Sign In',
    profile_register: 'Sign Up',
    profile_logout: 'Sign Out',
    profile_appearance: 'Appearance & Language',
    profile_dark_mode: 'Dark Mode',
    profile_dark_on: 'Dark theme is active',
    profile_dark_off: 'Light theme is active',
    profile_language: 'Language',
    profile_language_sub: 'Switch display language (Tiếng Việt / English)',
    profile_favorites: '❤️ Favorite Places',
    profile_demo_title: '🧪 Error State Simulation (Demo)',
    profile_demo_sub: 'Toggle to demonstrate graceful error handling without breaking anything.',
    profile_replay_onboarding: 'Replay Onboarding Guide',
    profile_perms_title: 'Current Permissions:',

    // SurvivalKit
    kit_title: '🎒 Travel Survival Kit & Hotlines',
    kit_sub: 'Packing checklist, local tips & Da Nang emergency hotlines',
    kit_tab_packing: 'Packing',
    kit_tab_hotline: 'Hotlines 24/7',
    kit_tab_tips: 'Local Tips',
    kit_progress: 'Packing progress:',
    kit_reset: 'Reset',
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;

interface LanguageContextValue {
  lang: AppLanguage;
  isVietnamese: boolean;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'vi',
  isVietnamese: true,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => translations.vi[key],
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>('vi');

  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'vi' || saved === 'en') setLangState(saved);
      })
      .catch(() => {});
  }, []);

  const setLanguage = (next: AppLanguage) => {
    setLangState(next);
    AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {});
  };

  const toggleLanguage = () => setLanguage(lang === 'vi' ? 'en' : 'vi');

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.vi[key];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isVietnamese: lang === 'vi',
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
