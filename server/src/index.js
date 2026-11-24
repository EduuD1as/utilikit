import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchCurrencyList, fetchRates } from './exchangeRates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/currency/currencies', async (_req, res) => {
  try {
    res.json(await fetchCurrencyList());
  } catch (error) {
    res.status(503).json({ error: error.message || 'Não foi possível carregar as moedas.' });
  }
});

app.get('/api/currency/latest', async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=900');
    res.json(await fetchRates(req.query.from || req.query.base));
  } catch (error) {
    res.status(error.status || 503).json({ error: error.message || 'Não foi possível carregar as cotações.' });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Em produção o servidor também entrega o front-end (build do Vite).
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' })
  );
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  // Arquivo inexistente (ex.: /favicon.png) responde 404 em vez do HTML da SPA.
  app.get(/\.[a-z0-9]+$/i, (_req, res) => {
    res.status(404).end();
  });
  // Qualquer outra rota devolve o index.html (SPA).
  app.get('*', (_req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
