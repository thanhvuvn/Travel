import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** GET /api/admin/stats -> Thống kê tổng quan & biểu đồ 7 ngày từ PostgreSQL */
router.get('/', async (_req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalPlaces,
      activePlaces,
      daNangPlaces,
      hoiAnPlaces,
      totalUsers,
      lockedUsers,
      pendingReviews,
      pendingSuggestions,
      openReports,
      hotPlaces,
      aiTotal,
      aiSuccess,
      aiAvg,
      recentLogs,
    ] = await Promise.all([
      prisma.place.count(),
      prisma.place.count({ where: { is_active: true } }),
      prisma.place.count({ where: { area: 'danang' } }),
      prisma.place.count({ where: { area: 'hoian' } }),
      prisma.user.count(),
      prisma.user.count({ where: { is_locked: true } }),
      prisma.review.count({ where: { status: 'pending' } }),
      prisma.placeSuggestion.count({ where: { status: 'pending' } }),
      prisma.placeReport.count({ where: { status: 'open' } }),
      prisma.place.findMany({
        orderBy: { review_count: 'desc' },
        take: 5,
        select: { id: true, name: true, area: true, rating: true, review_count: true },
      }),
      prisma.aiLog.count(),
      prisma.aiLog.count({ where: { is_success: true } }),
      prisma.aiLog.aggregate({
        _avg: { response_ms: true },
        _sum: { tokens_est: true },
      }),
      prisma.aiLog.findMany({
        where: { created_at: { gte: sevenDaysAgo } },
        select: { created_at: true },
      }),
    ]);

    // Gom nhóm lượt gọi AI theo 7 ngày gần nhất
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, 0);
    }
    recentLogs.forEach((log) => {
      const key = log.created_at.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      }
    });

    const weeklyCalls = Array.from(dailyMap.entries()).map(([dateStr, count]) => {
      const dt = new Date(`${dateStr}T00:00:00`);
      return {
        date: dateStr,
        d: DAY_LABELS[dt.getDay()],
        v: count,
      };
    });

    const aiStats = {
      total_calls: aiTotal,
      success_rate: aiTotal > 0 ? Number(((aiSuccess / aiTotal) * 100).toFixed(1)) : 100,
      avg_time_sec: aiAvg._avg.response_ms ? Number((aiAvg._avg.response_ms / 1000).toFixed(1)) : 2.1,
      prompt_tokens_est: aiAvg._sum.tokens_est ?? 0,
    };

    res.json({
      success: true,
      data: {
        places: {
          total: totalPlaces,
          active: activePlaces,
          inactive: totalPlaces - activePlaces,
          danang: daNangPlaces,
          hoian: hoiAnPlaces,
        },
        users: {
          total: totalUsers,
          locked: lockedUsers,
        },
        moderation: {
          pendingReviews,
          pendingSuggestions,
          openReports,
          total: pendingReviews + pendingSuggestions + openReports,
        },
        aiStats,
        weeklyCalls,
        hotPlaces,
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/stats]', err);
    res.status(500).json({ success: false, message: 'Không thể tải báo cáo thống kê.' });
  }
});

export default router;
