export interface EmergencyHotline {
  id: string;
  title: string;
  phone: string;
  displayPhone: string;
  desc: string;
  icon: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  group: 'beach' | 'temple' | 'city';
}

export interface LocalTip {
  id: string;
  title: string;
  icon: string;
  detail: string;
}

export const EMERGENCY_HOTLINES: EmergencyHotline[] = [
  {
    id: 'hl_tourist_center',
    title: 'Trung tâm Hỗ trợ Du khách ĐN',
    phone: '02363550111',
    displayPhone: '0236 3550 111',
    desc: 'Hỗ trợ tham quan, mất giấy tờ, tư vấn du lịch Đà Nẵng',
    icon: 'headset-outline',
  },
  {
    id: 'hl_1022',
    title: 'Tổng đài Dịch vụ công 1022',
    phone: '02361022',
    displayPhone: '0236 1022',
    desc: 'Tiếp nhận thông tin phản ánh, hướng dẫn mọi vướng mắc 24/7',
    icon: 'information-circle-outline',
  },
  {
    id: 'hl_rapid',
    title: 'Phản ứng nhanh Du lịch (Ép giá)',
    phone: '0919247009',
    displayPhone: '0919 247 009',
    desc: 'Tiếp nhận khẩn cấp tình trạng chèo kéo, chặt chém, lừa đảo',
    icon: 'shield-checkmark-outline',
  },
  {
    id: 'hl_beach',
    title: 'Đội Cứu nạn Bãi tắm Đà Nẵng',
    phone: '02363920477',
    displayPhone: '0236 3920 477',
    desc: 'Cứu hộ an toàn bờ biển Mỹ Khê, Phạm Văn Đồng, Non Nước',
    icon: 'boat-outline',
  },
  {
    id: 'hl_sos',
    title: 'Cấp cứu Y tế (115)',
    phone: '115',
    displayPhone: '115',
    desc: 'Xe cứu thương & cấp cứu khẩn cấp toàn thành phố',
    icon: 'medkit-outline',
  },
];

export const PACKING_CHECKLIST: ChecklistItem[] = [
  // Đi biển
  { id: 'chk_1', label: 'Kem chống nắng SPF 50+ & kính râm', group: 'beach' },
  { id: 'chk_2', label: 'Đồ bơi, khăn tắm & túi chống nước điện thoại', group: 'beach' },
  { id: 'chk_3', label: 'Dép lê / sandal đi cát', group: 'beach' },
  // Chùa & tâm linh
  { id: 'chk_4', label: 'Trang phục lịch sự qua đầu gối (Chùa Linh Ứng)', group: 'temple' },
  { id: 'chk_5', label: 'Giày thể thao đế bám leo bậc đá Ngũ Hành Sơn', group: 'temple' },
  // Phố cổ & dạo chơi
  { id: 'chk_6', label: 'Tiền mặt lẻ (trả ghe hoa đăng & ăn vặt)', group: 'city' },
  { id: 'chk_7', label: 'Sạc dự phòng chụp ảnh Hội An buổi tối', group: 'city' },
  { id: 'chk_8', label: 'CCCD / Hộ chiếu & bằng lái xe máy (nếu thuê xe)', group: 'city' },
];

export const CHECKLIST_GROUPS: { key: ChecklistItem['group']; title: string }[] = [
  { key: 'beach', title: '🏖️ Đi biển Mỹ Khê / Cù Lao Chàm' },
  { key: 'temple', title: '⛩️ Viếng Chùa & Ngũ Hành Sơn' },
  { key: 'city', title: '🏮 Dạo Phố Cổ & Di chuyển' },
];

export const LOCAL_SURVIVAL_TIPS: LocalTip[] = [
  {
    id: 'tip_market',
    title: 'Mẹo đi Chợ Hàn & Chợ Cồn không bị hớ',
    icon: '🛍️',
    detail:
      'Luôn hỏi giá trước khi ăn hoặc mua. Với quần áo, đồ lưu niệm ở Chợ Hàn bạn có thể trả giá nhẹ 20–30%. Đặc sản (chả bò, mực rim me) nên chọn quầy có niêm yết giá rõ ràng.',
  },
  {
    id: 'tip_hoian',
    title: 'Quy định vé tham quan Phố Cổ Hội An',
    icon: '🏮',
    detail:
      'Đi dạo đường phố và ăn uống ở Hội An hoàn toàn miễn phí. Bạn chỉ cần mua vé (80.000đ/khách Việt) nếu vào bên trong Chùa Cầu, Nhà cổ Tấn Ký hoặc các Hội quán.',
  },
  {
    id: 'tip_grab',
    title: 'Kinh nghiệm gọi xe Đà Nẵng ↔ Hội An',
    icon: '🚕',
    detail:
      'Quãng đường khoảng 28km (~45 phút). Đi 1–2 người nên thuê xe máy (~120k/ngày) hoặc đi Grab/XanhSM. Nhóm 4 người có thể đặt xe ghép/GrabCar khứ hồi để tiết kiệm hơn.',
  },
];
