import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { SEED_PLACES } from '../src/data/seedPlaces';
import { Area, PrismaClient, ReportStatus, ReviewStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_USERS = [
  { id: 'u-1', name: 'Nguyễn Văn Du Khách', email: 'dukhach@vivuai.vn', role: 'user' as UserRole, is_locked: false },
  { id: 'u-2', name: 'Lê Thị Thuỷ Tiên', email: 'thuytien.travel@gmail.com', role: 'user' as UserRole, is_locked: false },
  { id: 'u-3', name: 'Trần Bảo Long', email: 'long.tran@outlook.com', role: 'user' as UserRole, is_locked: true },
  { id: 'u-4', name: 'Quản Trị Viên Vivu', email: 'admin@vivuai.vn', role: 'admin' as UserRole, is_locked: false },
  { id: 'u-5', name: 'Đặng Minh Hoàng', email: 'hoang.danang@gmail.com', role: 'user' as UserRole, is_locked: false },
];


const SEED_REVIEWS = [
  { id: 'r1', place_id: 'dn01', user_id: 'u-2', user_name: 'Thuỷ Tiên', rating: 5, content: 'Mì Quảng ếch rất đậm đà, nước nhưn ngon, giá hợp lý. Sáng nào cũng đông khách.', status: 'approved' as ReviewStatus },
  { id: 'r2', place_id: 'dn01', user_id: 'u-3', user_name: 'Bảo Long', rating: 4, content: 'Ngon nhưng giờ cao điểm phải chờ khoảng 10 phút.', status: 'approved' as ReviewStatus },
  { id: 'r3', place_id: 'dn02', user_id: 'u-5', user_name: 'Minh Hoàng', rating: 5, content: 'Tối thứ 7 xem phun lửa cực đã, nên đến sớm để chọn chỗ đứng.', status: 'approved' as ReviewStatus },
  { id: 'r4', place_id: 'ha01', user_id: 'u-1', user_name: 'Du Khách', rating: 5, content: 'Chùa Cầu về đêm đẹp lung linh, chụp ảnh rất thích.', status: 'approved' as ReviewStatus },
  { id: 'r5', place_id: 'ha03', user_id: null, user_name: 'Khánh Linh', rating: 4, content: 'Bánh mì giòn, nhân đầy đặn. Hơi đông nhưng đáng thử.', status: 'approved' as ReviewStatus },
  { id: 'r6', place_id: 'dn03', user_id: null, user_name: 'Ẩn danh 231', rating: 1, content: 'Link quảng cáo vay tiền nhanh, liên hệ ngay!!!', status: 'pending' as ReviewStatus },
  { id: 'r7', place_id: 'ha02', user_id: null, user_name: 'Hoài Nam', rating: 5, content: 'Cao lầu chuẩn vị Hội An, sợi mì dai, thịt xá xíu thơm.', status: 'pending' as ReviewStatus },
];

async function main() {
  const url = new URL(process.env.DATABASE_URL || '');
  const direct = new URL(process.env.DIRECT_URL || process.env.DATABASE_URL || '');
  const local = (u: URL) => ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  if (process.env.NODE_ENV === 'production' || !local(url) || !local(direct)) {
    throw new Error('Seed chỉ được phép trên PostgreSQL local/test ở localhost.');
  }
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const userPassword = process.env.SEED_USER_PASSWORD;
  for (const value of [adminPassword, userPassword]) {
    if (!value || value.length < 6 || Buffer.byteLength(value) > 72) throw new Error('Cần SEED_ADMIN_PASSWORD và SEED_USER_PASSWORD (6 ký tự đến 72 bytes).');
  }
  console.log('Đang thêm dữ liệu mẫu còn thiếu vào PostgreSQL local...');

  // Check identity collisions before any writes; preserve relations to stable demo IDs.
  for (const u of SEED_USERS) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ id: u.id }, { email: u.email }] } });
    if (existing && (existing.id !== u.id || existing.email !== u.email)) {
      throw new Error('Seed user identity collision; reconcile demo IDs manually before seeding.');
    }
  }

  // 1. Seed Users
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        ...u,
        password_hash: await bcrypt.hash((u.role === 'admin' ? adminPassword : userPassword)!, 12),
      },
    });
  }

  for (const u of SEED_USERS) {
    await prisma.user.updateMany({
      where: { id: u.id, email: u.email, password_hash: 'demo_hash_123456' },
      data: { password_hash: await bcrypt.hash((u.role === 'admin' ? adminPassword : userPassword)!, 12) },
    });
  }

  // 2. Seed Places (16 địa điểm Đà Nẵng & Hội An)
  for (const p of SEED_PLACES) {
    await prisma.place.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p },
    });
  }

  // 3. Seed Reviews (7 đánh giá chuẩn theo place_id)
  for (const r of SEED_REVIEWS) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r },
    });
  }

  // 4. Seed Suggestions & Reports
  await prisma.placeSuggestion.upsert({
    where: { id: 's1' },
    update: {},
    create: {
      id: 's1',
      user_id: 'u-5',
      user_name: 'Minh Hoàng',
      name: 'Bánh xèo Bà Dưỡng',
      area: 'danang',
      category: 'food',
      note: 'Bánh xèo giòn, nước chấm ngon, nằm trong hẻm K280 Hoàng Diệu.',
      lat: 16.0583,
      lng: 108.2161,
      status: 'pending',
    },
  });

  await prisma.placeReport.upsert({
    where: { id: 'rp1' },
    update: {},
    create: {
      id: 'rp1',
      place_id: 'dn08',
      user_name: 'Khánh Linh',
      status: 'open' as ReportStatus,
    },
  });

  // 5. Seed vài bản ghi AiLog 7 ngày gần nhất để biểu đồ Admin có dữ liệu thật
  const existingLogs = await prisma.aiLog.count();
  if (existingLogs === 0) {
    const counts = [6, 9, 5, 11, 8, 14, 10];
    const logsData = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - (6 - i));
      for (let j = 0; j < counts[i]; j++) {
        logsData.push({
          user_id: 'u-1',
          endpoint: j % 4 === 0 ? 'vision' : 'plan',
          is_success: true,
          response_ms: 1700 + (j % 5) * 150,
          tokens_est: 380,
          created_at: dayDate,
        });
      }
    }
    await prisma.aiLog.createMany({ data: logsData });
  }

  console.log(`✅ Đã nạp thành công: ${SEED_USERS.length} users, ${SEED_PLACES.length} địa điểm, ${SEED_REVIEWS.length} đánh giá, 1 đề xuất, 1 báo cáo & lịch sử AI!`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
