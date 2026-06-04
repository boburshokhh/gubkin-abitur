const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка CORS для работы с фронтендом
app.use(cors({
  origin: '*', // В продакшене лучше ограничить конкретными доменами
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Маршруты API
app.use('/api', apiRouter);

// Базовый эндпоинт для проверки здоровья (health check)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер бэкенда успешно запущен на порту ${PORT}`);
});
