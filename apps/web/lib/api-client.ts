import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  withCredentials: true,
});

let _accessToken: string | null = null;
let _onRefresh: (() => Promise<string | null>) | null = null;
let _pendingRefresh: Promise<string | null> | null = null;

export function setApiToken(token: string | null) {
  _accessToken = token;
}

export function setRefreshCallback(fn: (() => Promise<string | null>) | null) {
  _onRefresh = fn;
}

apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && _onRefresh) {
      original._retry = true;
      if (!_pendingRefresh) {
        _pendingRefresh = _onRefresh().finally(() => {
          _pendingRefresh = null;
        });
      }
      const newToken = await _pendingRefresh;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(error);
  }
);
