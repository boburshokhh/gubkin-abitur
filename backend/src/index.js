const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { Server: SocketIOServer } = require('socket.io');
const { invitationRateLimit } = require('./middleware/rate-limit');
require('dotenv').config();

const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const invitationsRouter = require('./routes/invitations');
const feedbackRouter = require('./routes/feedback');
const { initFeedbackSocket } = require('./socket/feedback');
const { FRONTEND_ORIGIN } = require('./config/auth');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || 'local';
const GIT_SHA = process.env.GIT_SHA || 'unknown';
const BUILD_DATE = process.env.BUILD_DATE || 'unknown';

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim() || req.ip;

    console.log(JSON.stringify({
      type: 'access',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(1)),
      ip,
      userAgent: req.get('user-agent') || null
    }));
  });

  next();
});

// Настройка CORS для работы с фронтендом
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Маршруты API
app.use('/api/auth', authRouter);
app.use('/api/invitations', invitationRateLimit, invitationsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api', apiRouter);

// Базовый эндпоинт для проверки здоровья (health check)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    version: APP_VERSION,
    gitSha: GIT_SHA,
    buildDate: BUILD_DATE,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера', message: err.message });
});

// Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST']
  }
});
initFeedbackSocket(io);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер бэкенда успешно запущен на порту ${PORT}`);
  console.log(`Backend build: version=${APP_VERSION} gitSha=${GIT_SHA} buildDate=${BUILD_DATE}`);
});
