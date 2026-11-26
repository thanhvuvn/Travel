import express from 'express';
import cors from 'cors';
import reviewsRouter from './routes/reviews.routes';
import suggestionsRouter from './routes/suggestions.routes';
import reportsRouter from './routes/reports.routes';
import statsRouter from './routes/stats.routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'Vivu AI Backend API',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ROUTES ĐÃ HOÀN THIỆN (Trưởng nhóm: Cộng đồng, Kiểm duyệt & Thống kê Admin)
// ============================================================================
app.use('/api/reviews', reviewsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin/stats', statsRouter);

// ============================================================================
// TODO - Thành viên A gắn routes vào đây:
// app.use('/api/auth', authRouter);
// app.use('/api/places', placesRouter);
// app.use('/api/users', usersRouter);
//
// TODO - Thành viên B gắn routes vào đây:
// app.use('/api/ai', aiRouter);
// app.use('/api/itineraries', itinerariesRouter);
// app.use('/api/favorites', favoritesRouter);
// ============================================================================

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại.' });
});

export default app;
