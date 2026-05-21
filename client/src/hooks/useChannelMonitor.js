import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function useChannelMonitor() {
  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [delta, setDelta] = useState(0);
  const [status, setStatus] = useState('idle');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const sourceRef = useRef(null);

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
    setStatus('idle');
  }, []);

  const connectSSE = useCallback(
    (channelId) => {
      disconnect();
      setStatus('connecting');
      setError(null);

      const source = new EventSource(
        `${API_BASE}/api/events?channelId=${encodeURIComponent(channelId)}`
      );
      sourceRef.current = source;

      source.addEventListener('connected', () => {
        setStatus('live');
      });

      source.addEventListener('stats', (event) => {
        const data = JSON.parse(event.data);
        setChannel(data.channel);
        setSubscriberCount(data.channel.subscriberCount);
        setDelta(data.change?.delta ?? 0);
        setLastUpdate(new Date(data.fetchedAt));
        setStatus('live');
        setError(null);
      });

      source.addEventListener('heartbeat', (event) => {
        const data = JSON.parse(event.data);
        if (data.subscriberCount != null) {
          setSubscriberCount((prev) => {
            if (prev != null && prev !== data.subscriberCount) {
              setDelta(data.subscriberCount - prev);
            }
            return data.subscriberCount;
          });
        }
        setLastUpdate(new Date(data.fetchedAt));
        setStatus('live');
      });

      source.addEventListener('error', (event) => {
        if (event.data) {
          try {
            const data = JSON.parse(event.data);
            setError(data.message);
          } catch {
            /* ignore */
          }
        }
      });

      source.onerror = () => {
        setStatus('reconnecting');
        source.close();
        setTimeout(() => connectSSE(channelId), 3000);
      };
    },
    [disconnect]
  );

  const searchChannel = useCallback(
    async (query) => {
      const trimmed = query?.trim();
      if (!trimmed) {
        setError('Digite o link ou nome do canal.');
        return;
      }

      setLoading(true);
      setError(null);
      setDelta(0);
      disconnect();

      try {
        const res = await fetch(`${API_BASE}/api/channel/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao buscar canal.');

        setChannel(data.channel);
        setSubscriberCount(data.channel.subscriberCount);
        setLastUpdate(new Date(data.fetchedAt));
        connectSSE(data.channel.id);
      } catch (err) {
        setError(err.message);
        setChannel(null);
        setSubscriberCount(null);
      } finally {
        setLoading(false);
      }
    },
    [connectSSE, disconnect]
  );

  const stopMonitoring = useCallback(() => {
    disconnect();
    setChannel(null);
    setSubscriberCount(null);
    setDelta(0);
    setLastUpdate(null);
    setError(null);
  }, [disconnect]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    channel,
    subscriberCount,
    delta,
    status,
    lastUpdate,
    error,
    loading,
    searchChannel,
    stopMonitoring,
  };
}
