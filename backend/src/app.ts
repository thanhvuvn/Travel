import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import placesRouter from './routes/places.routes';
import usersRouter from './routes/users.routes';
import { errorHandler, HttpError } from './lib/http';
import reviewsRouter from './routes/reviews.routes';
import suggestionsRouter from './routes/suggestions.routes';
import reportsRouter from './routes/reports.routes';
import statsRouter from './routes/stats.routes';

const app = express();

const origins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:19006').split(',').map(v => v.trim());
app.use(cors({ origin(origin, callback) {
  if (!origin || origins.includes(origin)) callback(null, true);
  else callback(new HttpError(403, 'Origin không được phép.'));
} }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: { service: 'Vivu AI Backend API', timestamp: new Date().toISOString() },
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
app.use('/api/auth', authRouter);
app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);
//
// TODO - Thành viên B gắn routes vào đây:
// app.use('/api/ai', aiRouter);
// app.use('/api/itineraries', itinerariesRouter);
// app.use('/api/favorites', favoritesRouter);
// ============================================================================

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại.' });
});

app.use(errorHandler);

export default app;
