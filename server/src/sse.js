const clientsByChannel = new Map();

function getChannelSet(channelId) {
  if (!clientsByChannel.has(channelId)) {
    clientsByChannel.set(channelId, new Set());
  }
  return clientsByChannel.get(channelId);
}

export function addClient(channelId, res) {
  const set = getChannelSet(channelId);
  set.add(res);

  return () => {
    set.delete(res);
    if (set.size === 0) clientsByChannel.delete(channelId);
  };
}

export function getActiveChannelIds() {
  return new Set(clientsByChannel.keys());
}

export function getClientCount() {
  let total = 0;
  for (const set of clientsByChannel.values()) total += set.size;
  return total;
}

export function broadcastToChannel(channelId, event, data) {
  const clients = clientsByChannel.get(channelId);
  if (!clients?.size) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}
