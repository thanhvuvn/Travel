export interface EmergencyHotline {
  id: string;
  title: string;
  titleEn: string;
  phone: string;
  displayPhone: string;
  desc: string;
  descEn: string;
  icon: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  labelEn: string;
  group: 'beach' | 'temple' | 'city';
}

export interface LocalTip {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  detail: string;
  detailEn: string;
}

export const EMERGENCY_HOTLINES: EmergencyHotline[] = [
  {
    id: 'hl_tourist_center',
    title: 'Trung tâm Hỗ trợ Du khách ĐN',
    titleEn: 'Da Nang Visitor Support Center',
    phone: '02363550111',
    displayPhone: '0236 3550 111',
    desc: 'Hỗ trợ tham quan, mất giấy tờ, tư vấn du lịch Đà Nẵng',
    descEn: 'Sightseeing help, lost documents & official Da Nang travel support',
    icon: 'headset-outline',
  },
  {
    id: 'hl_1022',
    title: 'Tổng đài Dịch vụ công 1022',
    titleEn: 'Da Nang Public Hotline 1022',
    phone: '02361022',
    displayPhone: '0236 1022',
    desc: 'Tiếp nhận thông tin phản ánh, hướng dẫn mọi vướng mắc 24/7',
    descEn: '24/7 city information, incident reports & general guidance',
    icon: 'information-circle-outline',
  },
  {
    id: 'hl_rapid',
    title: 'Phản ứng nhanh Du lịch (Ép giá)',
    titleEn: 'Tourism Rapid Response (Overcharging)',
    phone: '0919247009',
    displayPhone: '0919 247 009',
    desc: 'Tiếp nhận khẩn cấp tình trạng chèo kéo, chặt chém, lừa đảo',
    descEn: 'Emergency hotline for overcharging, touting or tourist scams',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'hl_beach',
    title: 'Đội Cứu nạn Bãi tắm Đà Nẵng',
    titleEn: 'Da Nang Beach Rescue Team',
    phone: '02363920477',
    displayPhone: '0236 3920 477',
    desc: 'Cứu hộ an toàn bờ biển Mỹ Khê, Phạm Văn Đồng, Non Nước',
    descEn: 'Lifeguard & beach safety for My Khe, Pham Van Dong & Non Nuoc',
    icon: 'boat-outline',
  },
  {
    id: 'hl_sos',
    title: 'Cấp cứu Y tế (115)',
    titleEn: 'Medical Emergency (115)',
    phone: '115',
    displayPhone: '115',
    desc: 'Xe cứu thương & cấp cứu khẩn cấp toàn thành phố',
    descEn: 'City-wide ambulance & emergency medical response',
    icon: 'medkit-outline',
  },
];

export const PACKING_CHECKLIST: ChecklistItem[] = [
  // Đi biển
  {
    id: 'chk_1',
    label: 'Kem chống nắng SPF 50+ & kính râm',
    labelEn: 'Sunscreen SPF 50+ & sunglasses',
    group: 'beach',
  },
  {
    id: 'chk_2',
    label: 'Đồ bơi, khăn tắm & túi chống nước điện thoại',
    labelEn: 'Swimwear, towel & waterproof phone pouch',
    group: 'beach',
  },
  {
    id: 'chk_3',
    label: 'Dép lê / sandal đi cát',
    labelEn: 'Flip-flops / beach sandals',
    group: 'beach',
  },
  // Chùa & tâm linh
  {
    id: 'chk_4',
    label: 'Trang phục lịch sự qua đầu gối (Chùa Linh Ứng)',
    labelEn: 'Modest knee-length outfit (Linh Ung Pagoda)',
    group: 'temple',
  },
  {
    id: 'chk_5',
    label: 'Giày thể thao đế bám leo bậc đá Ngũ Hành Sơn',
    labelEn: 'Grip sneakers for Marble Mountains stone steps',
    group: 'temple',
  },
  // Phố cổ & dạo chơi
  {
    id: 'chk_6',
    label: 'Tiền mặt lẻ (trả ghe hoa đăng & ăn vặt)',
    labelEn: 'Small cash bills (lantern boats & street food)',
    group: 'city',
  },
  {
    id: 'chk_7',
    label: 'Sạc dự phòng chụp ảnh Hội An buổi tối',
    labelEn: 'Power bank for evening Hoi An lantern photos',
    group: 'city',
  },
  {
    id: 'chk_8',
    label: 'CCCD / Hộ chiếu & bằng lái xe máy (nếu thuê xe)',
    labelEn: 'ID / Passport & motorbike license (if renting)',
    group: 'city',
  },
];

export const CHECKLIST_GROUPS: { key: ChecklistItem['group']; title: string; titleEn: string }[] = [
  { key: 'beach', title: '🏖️ Đi biển Mỹ Khê / Cù Lao Chàm', titleEn: '🏖️ My Khe Beach / Cham Islands' },
  { key: 'temple', title: '⛩️ Viếng Chùa & Ngũ Hành Sơn', titleEn: '⛩️ Pagodas & Marble Mountains' },
  { key: 'city', title: '🏮 Dạo Phố Cổ & Di chuyển', titleEn: '🏮 Hoi An Old Town & Transit' },
];

export const LOCAL_SURVIVAL_TIPS: LocalTip[] = [
  {
    id: 'tip_market',
    title: 'Mẹo đi Chợ Hàn & Chợ Cồn không bị hớ',
    titleEn: 'Smart shopping tips for Han & Con Markets',
    icon: '🛍️',
    detail:
      'Luôn hỏi giá trước khi ăn hoặc mua. Với quần áo, đồ lưu niệm ở Chợ Hàn bạn có thể trả giá nhẹ 20–30%. Đặc sản (chả bò, mực rim me) nên chọn quầy có niêm yết giá rõ ràng.',
    detailEn:
      'Always ask the price before buying or eating. At Han Market, polite bargaining (20–30% off) is common for clothes and souvenirs. Buy local specialties at stalls with listed prices.',
  },
  {
    id: 'tip_hoian',
    title: 'Quy định vé tham quan Phố Cổ Hội An',
    titleEn: 'Hoi An Ancient Town entrance ticket rules',
    icon: '🏮',
    detail:
      'Đi dạo đường phố và ăn uống ở Hội An hoàn toàn miễn phí. Bạn chỉ cần mua vé (80.000đ/khách Việt) nếu vào bên trong Chùa Cầu, Nhà cổ Tấn Ký hoặc các Hội quán.',
    detailEn:
      'Strolling the lantern streets and dining in Hoi An is free. You only need a sightseeing ticket (120,000 VND for international / 80,000 VND for domestic) to enter heritage sites like the Japanese Bridge or Tan Ky House.',
  },
  {
    id: 'tip_grab',
    title: 'Kinh nghiệm gọi xe Đà Nẵng ↔ Hội An',
    titleEn: 'Getting between Da Nang & Hoi An',
    icon: '🚕',
    detail:
      'Quãng đường khoảng 28km (~45 phút). Đi 1–2 người nên thuê xe máy (~120k/ngày) hoặc đi Grab/XanhSM. Nhóm 4 người có thể đặt xe ghép/GrabCar khứ hồi để tiết kiệm hơn.',
    detailEn:
      'The distance is ~28 km (~45 mins). Solo travelers or couples can rent a motorbike (~120k/day) or take Grab/XanhSM. Groups of 4 save more by booking a round-trip GrabCar or shared shuttle.',
  },
];
