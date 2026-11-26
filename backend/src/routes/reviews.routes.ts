import { Router } from 'express';
import { ReviewStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

const formatReview = (r: {
  id: string;
  place_id: string;
  user_name: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  created_at: Date;
}) => ({
  id: r.id,
  place_id: r.place_id,
  user_name: r.user_name,
  rating: r.rating,
  content: r.content,
  status: r.status,
  created_at: r.created_at.toISOString().slice(0, 10),
});

/** Tính lại rating trung bình & số lượt đánh giá cho địa điểm dựa trên các review đã duyệt */
async function recalculatePlaceRating(placeId: string) {
  const agg = await prisma.review.aggregate({
    where: { place_id: placeId, status: 'approved' },
    _avg: { rating: true },
    _count: { id: true },
  });

  if (agg._count.id > 0 && agg._avg.rating !== null) {
    await prisma.place.update({
      where: { id: placeId },
      data: {
        rating: Number(agg._avg.rating.toFixed(1)),
        review_count: agg._count.id,
      },
    });
  }
}

/** GET /api/reviews?place_id=...&status=... */
router.get('/', async (req, res) => {
  try {
    const placeId = typeof req.query.place_id === 'string' ? req.query.place_id : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as ReviewStatus) : undefined;

    const reviews = await prisma.review.findMany({
      where: {
        ...(placeId ? { place_id: placeId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: reviews.map(formatReview) });
  } catch (err) {
    console.error('[GET /api/reviews]', err);
    res.status(500).json({ success: false, message: 'Không thể tải danh sách đánh giá.' });
  }
});

/** POST /api/reviews */
router.post('/', async (req, res) => {
  try {
    const { place_id, user_id, user_name, rating, content } = req.body ?? {};

    if (!place_id || !user_name || !content?.trim()) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin place_id, user_name hoặc content.' });
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ success: false, message: 'Số sao đánh giá phải từ 1 đến 5.' });
      return;
    }

    const created = await prisma.review.create({
      data: {
        place_id: String(place_id),
        user_id: user_id ? String(user_id) : null,
        user_name: String(user_name).trim(),
        rating: numericRating,
        content: String(content).trim(),
        status: 'pending',
      },
    });

    res.status(201).json({ success: true, data: formatReview(created) });
  } catch (err) {
    console.error('[POST /api/reviews]', err);
    res.status(500).json({ success: false, message: 'Không thể gửi đánh giá mới.' });
  }
});

/** PATCH /api/reviews/:id/status */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
      return;
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { status: status as ReviewStatus },
    });

    await recalculatePlaceRating(updated.place_id);

    res.json({ success: true, data: formatReview(updated) });
  } catch (err) {
    console.error('[PATCH /api/reviews/:id/status]', err);
    res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái đánh giá.' });
  }
});

/** DELETE /api/reviews/:id */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.review.delete({ where: { id } });
    await recalculatePlaceRating(deleted.place_id);

    res.json({ success: true, data: { id: deleted.id } });
  } catch (err) {
    console.error('[DELETE /api/reviews/:id]', err);
    res.status(500).json({ success: false, message: 'Không thể xóa đánh giá.' });
  }
});

export default router;
