// API helper that routes requests through the background script
// This bypasses CORS restrictions for localhost requests

export const apiRequest = async (url: string, options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
} = {}) => {
  const timeoutMs = options.timeoutMs ?? 10000;
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Request timed out'));
      }
    }, timeoutMs);

    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      url,
      method: options.method || 'GET',
      headers: options.headers || { 'Content-Type': 'application/json' },
      body: options.body
    }, (response) => {
      if (settled) return;
      clearTimeout(timer);

      if (chrome.runtime.lastError) {
        settled = true;
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response && response.success) {
        settled = true;
        resolve(response.data);
      } else {
        settled = true;
        const errMsg = response?.error || 'Unknown error';
        reject(new Error(errMsg));
      }
    });
  });
};

export const api = {
  get: (url: string) => apiRequest(url),
  post: (url: string, data: any) => apiRequest(url, { method: 'POST', body: data }),
  put: (url: string, data: any) => apiRequest(url, { method: 'PUT', body: data }),
  delete: (url: string) => apiRequest(url, { method: 'DELETE' })
};