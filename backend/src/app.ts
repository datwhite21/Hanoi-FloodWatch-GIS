import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { publicApiLimiter } from './middlewares/rateLimiter.middleware.js';

export const app = express();

// 1. CẤU HÌNH BẢO MẬT CORS
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (ví dụ curl hoặc mobile app)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.pages.dev') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
  })
);

// 2. PARSE BODY
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. LOGGER REQUEST
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 4. RATE LIMITING
app.use('/api', publicApiLimiter);

// 5. ROOT HEALTH ENDPOINT
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Hanoi FloodWatch GIS API',
    version: '1.0.0',
    description: 'Hệ thống WebGIS theo dõi và cảnh báo nguy cơ ngập úng đô thị tại Hà Nội',
    status: 'ONLINE',
    docs: '/api/health',
  });
});

// 6. MOUNT API ROUTES
app.use('/api', apiRouter);

// 7. XỬ LÝ 404 NOT FOUND
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`,
  });
});

// 8. GLOBAL ERROR HANDLER
app.use(errorHandler);
