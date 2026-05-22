import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLiveSubscriberCount } from '../lib/fetchLiveSubscriberCount.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const LIVE_POLL_MS = 5000;
const LIVE_POLL_BACKOFF_MS = 15000;

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
  const hasShownCountRef = useRef(false);
  const preciseSourceActiveRef = useRef(false);
  const pollFailStreakRef = useRef(0);
  const pollIntervalMsRef = useRef(LIVE_POLL_MS);
  const apiRoundedRef = useRef(null);

  const applySubscriberCount = useCallback((next, { allowDelta = true } = {}) => {
    setSubscriberCount((prev) => {
      if (
        allowDelta &&
        hasShownCountRef.current &&
        prev != null &&
        next !== prev
      ) {
        setDelta(next - prev);
      }
      return next;
    });
    if (next != null) hasShownCountRef.current = true;
    setLastUpdate(new Date());
  }, []);

  const stopPrecisePolling = useCallback(() => {
    if (precisePollRef.current) {
      clearInterval(precisePollRef.current);
      precisePollRef.current = null;
    }
  }, []);

  const schedulePrecisePoll = useCallback(
    (channelId, pollFn) => {
      stopPrecisePolling();
      pollFn();
      precisePollRef.current = setInterval(pollFn, pollIntervalMsRef.current);
    },
    [stopPrecisePolling]
  );

  const startPrecisePolling = useCallback(
    (channelId) => {
      pollFailStreakRef.current = 0;
      pollIntervalMsRef.current = LIVE_POLL_MS;

      const poll = async () => {
        try {
          const stats = await fetchLiveSubscriberCount(channelId, {
            apiRounded: apiRoundedRef.current,
          });
          if (stats.apiRounded != null) {
            apiRoundedRef.current = stats.apiRounded;
          }
          pollFailStreakRef.current = 0;
          if (pollIntervalMsRef.current !== LIVE_POLL_MS) {
            pollIntervalMsRef.current = LIVE_POLL_MS;
            schedulePrecisePoll(channelId, poll);
            return;
          }
          const wasRounded = !preciseSourceActiveRef.current;
          preciseSourceActiveRef.current = stats.precise !== false;
          applySubscriberCount(stats.subscriberCount, {
            allowDelta: preciseSourceActiveRef.current && !wasRounded,
          });
        } catch {
          pollFailStreakRef.current += 1;
          if (
            pollFailStreakRef.current >= 2 &&
            pollIntervalMsRef.current !== LIVE_POLL_BACKOFF_MS
          ) {
            pollIntervalMsRef.current = LIVE_POLL_BACKOFF_MS;
            schedulePrecisePoll(channelId, poll);
          }
        }
      };

      schedulePrecisePoll(channelId, poll);
    },
    [applySubscriberCount, schedulePrecisePoll]
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
        if (data.channel.subscriberCountApiRounded != null) {
          apiRoundedRef.current = data.channel.subscriberCountApiRounded;
        } else if (
          data.channel.subscriberCount != null &&
          data.channel.subscriberCountPrecise === false
        ) {
          apiRoundedRef.current = data.channel.subscriberCount;
        }
        const isInitial = data.change?.type === 'initial';
        const fromServer = data.channel.subscriberCount != null;
        if (fromServer) {
          if (data.channel.subscriberCountPrecise) {
            preciseSourceActiveRef.current = true;
          }
          applySubscriberCount(data.channel.subscriberCount, {
            allowDelta: !isInitial && data.channel.subscriberCountPrecise,
          });
        }
        setStatus('live');
        setError(null);
      });

      source.addEventListener('heartbeat', (event) => {
        const data = JSON.parse(event.data);
        if (data.subscriberCountApiRounded != null) {
          apiRoundedRef.current = data.subscriberCountApiRounded;
        }
        if (data.subscriberCount != null) {
          applySubscriberCount(data.subscriberCount, {
            allowDelta: data.subscriberCountPrecise === true,
          });
          if (data.subscriberCountPrecise) {
            preciseSourceActiveRef.current = true;
          }
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
      hasShownCountRef.current = false;
      preciseSourceActiveRef.current = false;
      pollFailStreakRef.current = 0;
      setSubscriberCount(null);
      disconnect();

      try {
        const res = await fetch(`${API_BASE}/api/channel/lookup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: trimmed }),
        });

        const data = await res.json();
        if (!res.ok) {
          // Se o backend retornou erro formatado com sugestão
          if (data.title && data.suggestion) {
            throw new Error(`${data.title}\n${data.message}\n\n${data.suggestion}`);
          }
          throw new Error(data.error || 'Erro ao buscar canal.');
        }

        setChannel(data.channel);
        apiRoundedRef.current =
          data.channel.subscriberCountApiRounded ?? data.channel.subscriberCount;
        setDelta(0);

        if (!data.channel.hiddenSubscriberCount) {
          try {
            const stats = await fetchLiveSubscriberCount(data.channel.id, {
              apiRounded: apiRoundedRef.current,
            });
            if (stats.apiRounded != null) {
              apiRoundedRef.current = stats.apiRounded;
            }
            preciseSourceActiveRef.current = stats.precise !== false;
            applySubscriberCount(stats.subscriberCount, { allowDelta: false });
          } catch {
            preciseSourceActiveRef.current = false;
            applySubscriberCount(data.channel.subscriberCount, {
              allowDelta: false,
            });
          }
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
    hasShownCountRef.current = false;
    preciseSourceActiveRef.current = false;
    pollFailStreakRef.current = 0;
    apiRoundedRef.current = null;
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
