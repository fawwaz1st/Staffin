import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '../api/client';

const serialize = (value) => {
  if (!value) return '';
  try {
    return JSON.stringify(value, Object.keys(value).sort());
  } catch (error) {
    console.warn('[useFetch] Gagal serialisasi konfigurasi', error);
    return Math.random().toString(36).slice(2);
  }
};

export function useFetch(url, config = {}) {
  const {
    enabled = true,
    params,
    transform,
    client = apiClient,
    onError,
    onSuccess,
    ...axiosConfig
  } = config;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url && enabled));
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const signature = useMemo(() => serialize({ params, axiosConfig, enabled }), [params, axiosConfig, enabled]);

  const memoizedParams = useMemo(() => params, [signature]);
  const memoizedConfig = useMemo(() => axiosConfig, [signature]);

  const execute = useCallback(async () => {
    if (!url || !enabled) {
      return null;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const response = await client.get(url, {
        ...memoizedConfig,
        params: memoizedParams,
        signal: controller.signal,
      });
      const payload = typeof transform === 'function' ? transform(response.data) : response.data;
      setData(payload);
      onSuccess?.(payload);
      return payload;
    } catch (err) {
      if (controller.signal.aborted) {
        return null;
      }
      const message = err?.response?.data?.message || err?.message || 'Terjadi kesalahan';
      setError(message);
      onError?.(err);
      return null;
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [client, enabled, memoizedConfig, memoizedParams, onError, onSuccess, transform, url]);

  useEffect(() => {
    execute();

    return () => {
      abortControllerRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, signature]);

  const refetch = useCallback(() => execute(), [execute]);

  return { data, loading, error, refetch };
}

export default useFetch;
