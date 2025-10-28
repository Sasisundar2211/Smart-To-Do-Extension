// Choose a sensible default API base URL at runtime:
// - When the code runs as a browser extension (chrome.runtime is present) we still need an absolute
//   URL for the background service worker to call the backend. Use a dev default.
// - When running in a local dev web server on localhost, keep the dev backend URL.
// - Otherwise default to relative URLs.
const DEFAULT_DEV_API = 'http://localhost:3001';
const isExtension = typeof chrome !== 'undefined' && !!(chrome && chrome.runtime && chrome.runtime.id);
const isLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';

// In extension context, prefer the dev API base; in web context, use dev base only on localhost.
export const API_BASE_URL = isExtension ? DEFAULT_DEV_API : (isLocalhost ? DEFAULT_DEV_API : '');
export const AI_PARSE_ENDPOINT = `${API_BASE_URL}/api/ai/parse-task`;
export const AI_CHAT_ENDPOINT = `${API_BASE_URL}/api/ai/chat`;
export const AI_PAGE_ANALYSIS_ENDPOINT = `${API_BASE_URL}/api/ai/analyze-page`;
export const TASKS_ENDPOINT = `${API_BASE_URL}/api/tasks`;
