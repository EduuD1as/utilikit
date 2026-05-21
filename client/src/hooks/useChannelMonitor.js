import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLiveSubscriberCount } from '../lib/fetchLiveSubscriberCount.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const LIVE_POLL_MS = 3000;

export function useChannelMonitor() {
  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [delta, setDelta] = useState(0);
  const [status, setStatus] = useState('idle');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const sourceRef = useRef(null);
  const precisePollRef = useRef(null);

  const applySubscriberCount = useCallback((next) => {
    setSubscriberCount((prev) => {
      if (prev != null && next !== prev) {
        setDelta(next - prev);
      }
      return next;
    });
    setLastUpdate(new Date());
  }, []);

  const stopPrecisePolling = useCallback(() => {
    if (precisePollRef.current) {
      clearInterval(precisePollRef.current);
      precisePollRef.current = null;
    }
  }, []);

  const startPrecisePolling = useCallback(
    (channelId) => {
      stopPrecisePolling();

      const poll = async () => {
        try {
          const stats = await fetchLiveSubscriberCount(channelId);
          applySubscriberCount(stats.subscriberCount);
        } catch {
          /* mantém último valor do servidor */
        }
      };

      poll();
      precisePollRef.current = setInterval(poll, LIVE_POLL_MS);
    },
    [applySubscriberCount, stopPrecisePolling]
  );

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
        if (data.channel.subscriberCountPrecise) {
          applySubscriberCount(data.channel.subscriberCount);
          if (data.change?.delta) setDelta(data.change.delta);
        }
        setStatus('live');
        setError(null);
      });

      source.addEventListener('heartbeat', (event) => {
        const data = JSON.parse(event.data);
        if (data.subscriberCountPrecise && data.subscriberCount != null) {
          applySubscriberCount(data.subscriberCount);
        }
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
    [applySubscriberCount, disconnect]
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
        setDelta(0);
        if (data.channel.subscriberCountPrecise) {
          applySubscriberCount(data.channel.subscriberCount);
        } else {
          setSubscriberCount(data.channel.subscriberCount);
        }
        if (!data.channel.hiddenSubscriberCount) {
          startPrecisePolling(data.channel.id);
        }
        connectSSE(data.channel.id);
      } catch (err) {
        setError(err.message);
        setChannel(null);
        setSubscriberCount(null);
      } finally {
        setLoading(false);
      }
    },
    [applySubscriberCount, connectSSE, disconnect, startPrecisePolling]
  );

  const stopMonitoring = useCallback(() => {
    stopPrecisePolling();
    disconnect();
    setChannel(null);
    setSubscriberCount(null);
    setDelta(0);
    setLastUpdate(null);
    setError(null);
  }, [disconnect, stopPrecisePolling]);

  useEffect(
    () => () => {
      stopPrecisePolling();
      disconnect();
    },
    [disconnect, stopPrecisePolling]
  );

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
