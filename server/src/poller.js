import { getChannelById } from './socialcounts.js';
import { clearSubscriberOffset } from './socialcounts.js';
import { broadcastToChannel } from './sse.js';

const snapshots = new Map();
let pollTimer = null;

function getPollInterval() {
  return Number(process.env.POLL_INTERVAL_MS) || 3000;
}

function detectChange(channelId, current) {
  const prev = snapshots.get(channelId);
  if (!prev) {
    return { type: 'initial', delta: 0, hasChanges: true };
  }

  const delta = current.subscriberCount - prev.subscriberCount;
  if (delta !== 0) {
    return { type: 'update', delta, hasChanges: true };
  }

  return { type: 'heartbeat', delta: 0, hasChanges: false };
}

async function pollChannel(channelId) {
  const channel = await getChannelById(channelId);
  const change = detectChange(channelId, channel);
  snapshots.set(channelId, channel);

  const payload = {
    channel,
    change,
    fetchedAt: new Date().toISOString(),
  };

  if (change.hasChanges) {
    broadcastToChannel(channelId, 'stats', payload);
  } else {
    broadcastToChannel(channelId, 'heartbeat', {
      fetchedAt: payload.fetchedAt,
      subscriberCount: channel.subscriberCount,
      subscriberCountApiRounded: channel.subscriberCountApiRounded,
      subscriberCountPrecise: channel.subscriberCountPrecise,
    });
  }
}

async function pollAll(activeChannelIds) {
  await Promise.all(
    [...activeChannelIds].map((id) =>
      pollChannel(id).catch((err) => {
        console.error(`[poller] ${id}:`, err.message);
        broadcastToChannel(id, 'error', {
          message: err.message,
          at: new Date().toISOString(),
        });
      })
    )
  );
}

export function startPoller(getActiveChannelIds) {
  if (pollTimer) return;

  const tick = () => {
    const ids = getActiveChannelIds();
    if (ids.size === 0) return;
    pollAll(ids);
  };

  tick();
  pollTimer = setInterval(tick, getPollInterval());
  console.log(`[poller] intervalo ${getPollInterval()}ms`);
}

export function clearChannelSnapshot(channelId) {
  snapshots.delete(channelId);
  clearSubscriberOffset(channelId);
}
