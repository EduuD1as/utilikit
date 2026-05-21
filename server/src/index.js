import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { addClient, getActiveChannelIds, getClientCount } from './sse.js';
import { startPoller } from './poller.js';
import { clearChannelSnapshot } from './poller.js';
import { isConfigured, resolveChannel, getChannelById } from './youtube.js';

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
    configured: isConfigured(),
    clients: getClientCount(),
    activeChannels: getActiveChannelIds().size,
  });
});

app.post('/api/channel/lookup', async (req, res) => {
  try {
    const { query } = req.body ?? {};
    const channel = await resolveChannel(query);
    clearChannelSnapshot(channel.id);
    res.json({ channel, fetchedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/channel/:channelId', async (req, res) => {
  try {
    const channel = await getChannelById(req.params.channelId);
    res.json({ channel, fetchedAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
  console.log(`[server] YouTube API: ${isConfigured() ? 'configurada' : 'NÃO configurada'}`);
  startPoller(getActiveChannelIds);
});
