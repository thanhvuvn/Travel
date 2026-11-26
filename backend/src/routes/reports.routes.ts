import { Router } from 'express';
import { ReportStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

const router = Router();

const formatReport = (r: {
  id: string;
  place_id: string;
  user_name: string;
  status: ReportStatus;
  created_at: Date;
}) => ({
  id: r.id,
  place_id: r.place_id,
  user_name: r.user_name,
  status: r.status,
  created_at: r.created_at.toISOString().slice(0, 10),
});

/** GET /api/reports?status=... */
router.get('/', async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? (req.query.status as ReportStatus) : undefined;
    const reports = await prisma.placeReport.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: reports.map(formatReport) });
  } catch (err) {
    console.error('[GET /api/reports]', err);
    res.status(500).json({ success: false, message: 'Không thể tải danh sách báo cáo.' });
  }
});

/** POST /api/reports -> Báo quán đã đóng cửa (chống trùng lặp) */
router.post('/', async (req, res) => {
  try {
    const { place_id, user_id, user_name } = req.body ?? {};
    if (!place_id || !user_name?.trim()) {
      res.status(400).json({ success: false, message: 'Thiếu place_id hoặc user_name.' });
      return;
    }

    const existing = await prisma.placeReport.findFirst({
      where: {
        place_id: String(place_id),
        user_name: String(user_name).trim(),
        status: 'open',
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        code: 'duplicate',
        message: 'Bạn đã báo cáo quán này rồi, Admin đang xử lý.',
      });
      return;
    }

    const created = await prisma.placeReport.create({
      data: {
        place_id: String(place_id),
        user_id: user_id ? String(user_id) : null,
        user_name: String(user_name).trim(),
        status: 'open',
      },
    });

    res.status(201).json({ success: true, data: formatReport(created) });
  } catch (err) {
    console.error('[POST /api/reports]', err);
    res.status(500).json({ success: false, message: 'Không thể gửi báo cáo đóng cửa.' });
  }
});

/** PATCH /api/reports/:id/resolve -> confirmClosed=true sẽ tự động ẩn quán khỏi AI (is_active=false) */
router.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const confirmClosed = Boolean(req.body?.confirmClosed);

    const report = await prisma.placeReport.findUnique({ where: { id } });
    if (!report) {
      res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo.' });
      return;
    }

    if (confirmClosed) {
      await prisma.$transaction([
        prisma.place.update({
          where: { id: report.place_id },
          data: { is_active: false },
        }),
        prisma.placeReport.updateMany({
          where: { place_id: report.place_id, status: 'open' },
          data: { status: 'closed_confirmed' },
        }),
      ]);
    } else {
      await prisma.placeReport.update({
        where: { id },
        data: { status: 'dismissed' },
      });
    }

    res.json({
      success: true,
      data: {
        id,
        place_id: report.place_id,
        status: confirmClosed ? 'closed_confirmed' : 'dismissed',
        placeDisabled: confirmClosed,
      },
    });
  } catch (err) {
    console.error('[PATCH /api/reports/:id/resolve]', err);
    res.status(500).json({ success: false, message: 'Không thể xử lý báo cáo.' });
  }
});

export default router;
