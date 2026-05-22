import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { addClient, getActiveChannelIds, getClientCount } from './sse.js';
import { startPoller } from './poller.js';
import { clearChannelSnapshot } from './poller.js';
import { resolveChannel, getChannelById } from './socialcounts.js';
import { resolveLiveSubscriberStats } from './socialcounts.js';
import { formatErrorForUser } from './error-messages.js';
import { fetchCurrencyList, fetchRates } from './exchangeRates.js';

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

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    clients: getClientCount(),
    activeChannels: getActiveChannelIds().size,
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

app.post('/api/channel/lookup', async (req, res) => {
  try {
    const { query } = req.body ?? {};
    const channel = await resolveChannel(query);
    clearChannelSnapshot(channel.id);
    res.json({ channel, fetchedAt: new Date().toISOString() });
  } catch (error) {
    const formattedError = formatErrorForUser(error);
    res.status(400).json({ 
      error: formattedError.message,
      title: formattedError.title,
      suggestion: formattedError.suggestion,
      type: formattedError.type,
    });
  }
});

app.get('/api/channel/:channelId', async (req, res) => {
  try {
    const channel = await getChannelById(req.params.channelId);
    res.json({ channel, fetchedAt: new Date().toISOString() });
  } catch (error) {
    const formattedError = formatErrorForUser(error);
    res.status(400).json({ 
      error: formattedError.message,
      title: formattedError.title,
      suggestion: formattedError.suggestion,
      type: formattedError.type,
    });
  }
});

app.get('/api/channel/:channelId/live-stats', async (req, res) => {
  try {
    const channelId = req.params.channelId.trim();
    const apiRounded =
      req.query.apiRounded != null ? Number(req.query.apiRounded) : undefined;
    const stats = await resolveLiveSubscriberStats(channelId, apiRounded);
    res.json({ stats, fetchedAt: new Date().toISOString() });
  } catch (error) {
    const formattedError = formatErrorForUser(error);
    res.status(503).json({ 
      error: formattedError.message,
      title: formattedError.title,
      suggestion: formattedError.suggestion,
      type: formattedError.type,
    });
  }
});

app.get('/api/events', (req, res) => {
  const channelId = req.query.channelId?.trim();
  if (!channelId) {
    return res.status(400).json({ error: 'channelId é obrigatório.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  res.write(
    `event: connected\ndata: ${JSON.stringify({
      channelId,
      at: new Date().toISOString(),
    })}\n\n`
  );

  const remove = addClient(channelId, res);

  req.on('close', () => {
    remove();
    res.end();
  });
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
  console.log(`[server] Usando SocialCounts API (sem chave do YouTube necessária)`);
  startPoller(getActiveChannelIds);
});
