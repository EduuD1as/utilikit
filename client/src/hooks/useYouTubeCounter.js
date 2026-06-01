import { useState, useCallback, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const POLL_INTERVAL = 5000; // 5 segundos

export function useYouTubeCounter() {
  const [channel, setChannel] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const pollIntervalRef = useRef(null);
  const channelUrlRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const fetchSubscribers = useCallback(async (channelId) => {
    try {
      const response = await fetch(`${API_BASE}/api/youtube/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });

      // Safe JSON parsing: some error responses may be empty or non-JSON.
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = { error: text || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar inscritos');
      }

      setSubscriberCount(data.count);
      setLastUpdate(new Date(data.fetchedAt));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [API_BASE]);

  const startPolling = useCallback((channelId) => {
    stopPolling();
    channelUrlRef.current = channelId;

    // Busca imediatamente
    fetchSubscribers(channelId);

    // Configura polling
    pollIntervalRef.current = setInterval(() => {
      fetchSubscribers(channelId);
    }, POLL_INTERVAL);
  }, [fetchSubscribers, stopPolling]);

  const searchChannel = useCallback(async (query) => {
    if (!query || typeof query !== 'string') {
      setError('Digite um nome de canal válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSubscriberCount(null);
    stopPolling();

    try {
      const response = await fetch(`${API_BASE}/api/youtube/channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      // Safe JSON parsing: some error responses may be empty or non-JSON.
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = { error: text || `HTTP ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar canal');
      }

      setChannel(data);
      startPolling(data.channelId);
    } catch (err) {
      setError(err.message);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, startPolling, stopPolling]);

  const stopMonitoring = useCallback(() => {
    stopPolling();
    setChannel(null);
    setSubscriberCount(null);
    setLastUpdate(null);
    setError(null);
    channelUrlRef.current = null;
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    channel,
    subscriberCount,
    loading,
    error,
    lastUpdate,
    searchChannel,
    stopMonitoring,
  };
}
