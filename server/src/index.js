import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchCurrencyList, fetchRates } from './exchangeRates.js';
import { fetchChannelInfo, fetchSubscriberCount } from './youtube-service.js';

// Ensure .env is loaded from project root if not already loaded
if (!process.env.YOUTUBE_API_KEY) {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && !key.startsWith('#')) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    });
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());

// Ensure API endpoints return JSON for unsupported methods (avoid HTML responses
// that break client-side JSON parsing). If the method is not POST, respond 405.
app.all('/api/youtube/channel', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }
  next();
});

app.all('/api/youtube/subscribers', (req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST' });
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
  });
});

app.get('/api/currency/currencies', async (_req, res) => {
  try {
    const currencies = await fetchCurrencyList();
    res.json(currencies);
  } catch (error) {
    res.status(503).json({
      error: error.message || 'Não foi possível carregar as moedas.',
    });
  }
});

app.get('/api/currency/latest', async (req, res) => {
  try {
    const rates = await fetchRates(req.query.from || 'BRL');
    res.json(rates);
  } catch (error) {
    res.status(503).json({
      error: error.message || 'Não foi possível carregar as cotações.',
    });
  }
});

app.post('/api/youtube/channel', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query é obrigatória'
      });
    }

    const channelInfo = await fetchChannelInfo(query.trim());
    res.json(channelInfo);
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Erro ao buscar canal'
    });
  }
});

app.post('/api/youtube/subscribers', async (req, res) => {
  try {
    const { channelId } = req.body;

    if (!channelId || typeof channelId !== 'string') {
      return res.status(400).json({
        error: 'channelId é obrigatório'
      });
    }

    const subscriberCount = await fetchSubscriberCount(channelId);
    res.json({ count: subscriberCount, fetchedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({
      error: error.message || 'Erro ao buscar inscritos'
    });
  }
});

const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
