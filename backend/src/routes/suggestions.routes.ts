import { Router } from 'express';
import { Area, ReviewStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

const formatSuggestion = (s: {
  id: string;
  name: string;
  area: Area;
  category: string;
  note: string;
  lat: number | null;
  lng: number | null;
  user_name: string;
  status: ReviewStatus;
  created_at: Date;
}) => ({
  id: s.id,
  name: s.name,
  area: s.area,
  category: s.category,
  note: s.note,
  lat: s.lat,
  lng: s.lng,
  user_name: s.user_name,
  status: s.status,
  created_at: s.created_at.toISOString().slice(0, 10),
});

/** GET /api/suggestions?status=... */
router.get('/', async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? (req.query.status as ReviewStatus) : undefined;
    const suggestions = await prisma.placeSuggestion.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: suggestions.map(formatSuggestion) });
  } catch (err) {
    console.error('[GET /api/suggestions]', err);
    res.status(500).json({ success: false, message: 'Không thể tải danh sách đề xuất.' });
  }
});

/** POST /api/suggestions */
router.post('/', async (req, res) => {
  try {
    const { user_id, user_name, name, area, category, note, lat, lng } = req.body ?? {};

    if (!name?.trim() || !['danang', 'hoian'].includes(area) || !category) {
      res.status(400).json({ success: false, message: 'Thiếu tên quán, khu vực (danang/hoian) hoặc danh mục.' });
      return;
    }

    const created = await prisma.placeSuggestion.create({
      data: {
        user_id: user_id ? String(user_id) : null,
        user_name: String(user_name || 'Du khách').trim(),
        name: String(name).trim(),
        area: area as Area,
        category: String(category),
        note: String(note || '').trim(),
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: formatSuggestion(created) });
  } catch (err) {
    console.error('[POST /api/suggestions]', err);
    res.status(500).json({ success: false, message: 'Không thể gửi đề xuất địa điểm.' });
  }
});

/** PATCH /api/suggestions/:id/approve -> Duyệt đề xuất và tự thêm Place ở trạng thái tạm ẩn (is_active = false) */
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const suggestion = await prisma.placeSuggestion.findUnique({ where: { id } });

    if (!suggestion) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đề xuất này.' });
      return;
    }

    const center =
      suggestion.area === 'danang'
        ? { lat: 16.0612, lng: 108.2198 }
        : { lat: 15.8771, lng: 108.326 };

    const [updatedSuggestion, createdPlace] = await prisma.$transaction([
      prisma.placeSuggestion.update({
        where: { id },
        data: { status: 'approved' },
      }),
      prisma.place.create({
        data: {
          area: suggestion.area,
          name: suggestion.name,
          type: 'Địa điểm do người dùng đề xuất',
          category: suggestion.category,
          lat: suggestion.lat ?? center.lat,
          lng: suggestion.lng ?? center.lng,
          description: suggestion.note || 'Địa điểm do người dùng đề xuất, đang chờ Admin bổ sung thông tin.',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
          avg_cost: 0,
          open_hours: 'Chưa cập nhật',
          tags: ['người dùng đề xuất'],
          is_active: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        suggestion: formatSuggestion(updatedSuggestion),
        place: createdPlace,
      },
    });
  } catch (err) {
    console.error('[PATCH /api/suggestions/:id/approve]', err);
    res.status(500).json({ success: false, message: 'Không thể phê duyệt đề xuất.' });
  }
});

/** PATCH /api/suggestions/:id/reject */
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.placeSuggestion.update({
      where: { id },
      data: { status: 'rejected' },
    });

    res.json({ success: true, data: formatSuggestion(updated) });
  } catch (err) {
    console.error('[PATCH /api/suggestions/:id/reject]', err);
    res.status(500).json({ success: false, message: 'Không thể từ chối đề xuất.' });
  }
});

export default router;
