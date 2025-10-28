import { API_BASE_URL } from './config';

console.log('Background service worker running for Smart To-Do AI');

// Create context menu for selected text
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-todo',
    title: 'Add to Smart To-Do',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'add-to-todo' && info.selectionText) {
    chrome.storage.local.set({ lastSelection: info.selectionText }, () => {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Smart To-Do',
        message: 'Selected text saved to clipboard for quick add.'
      });
    });
  }
});

// Simple helper to ensure absolute URLs
const makeAbsoluteUrl = (url) => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const baseUrl = 'http://localhost:3001';
  return baseUrl + (url.startsWith('/') ? url : `/${url}`);
};

// Local storage helpers
const storage = {
  get: (key: string): Promise<any> => new Promise((res) => {
    try { chrome.storage.local.get([key], (out) => res(out[key])); } catch { res(undefined); }
  }),
  set: (key: string, value: any): Promise<void> => new Promise((res) => {
    try { chrome.storage.local.set({ [key]: value }, () => res()); } catch { res(); }
  })
};

const offlineTasks = {
  list: async () => {
    return (await storage.get('tasks')) || [];
  },
  create: async (task: any) => {
    const tasks = (await storage.get('tasks')) || [];
    const id = task._id || task.id || Date.now().toString();
    const newTask = { ...task, _id: id };
    await storage.set('tasks', [newTask, ...tasks]);
    return newTask;
  },
  update: async (id: string, patch: any) => {
    const tasks = (await storage.get('tasks')) || [];
    const idx = tasks.findIndex((t: any) => t._id === id);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...patch };
      await storage.set('tasks', tasks);
      return tasks[idx];
    }
    return null;
  },
  remove: async (id: string) => {
    const tasks = (await storage.get('tasks')) || [];
    const filtered = tasks.filter((t: any) => t._id !== id);
    await storage.set('tasks', filtered);
    return { ok: true };
  }
};

const tryOfflineTasks = async (req: any) => {
  const url = (req.url || '').toString();
  const method = (req.method || 'GET').toUpperCase();
  // Matches /api/tasks and /api/tasks/:id
  const listRe = /\/api\/tasks$/;
  const itemRe = /\/api\/tasks\/([^/]+)$/;

  if (listRe.test(url)) {
    if (method === 'GET') {
      return { success: true, data: await offlineTasks.list() };
    }
    if (method === 'POST') {
      return { success: true, data: await offlineTasks.create(req.body || {}) };
    }
  }
  const m = url.match(itemRe);
  if (m) {
    const id = decodeURIComponent(m[1]);
    if (method === 'PUT' || method === 'PATCH') {
      const updated = await offlineTasks.update(id, req.body || {});
      return { success: !!updated, data: updated, error: updated ? undefined : 'Not found' };
    }
    if (method === 'DELETE') {
      const res = await offlineTasks.remove(id);
      return { success: true, data: res };
    }
  }
  return null;
};

// Handle API requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_REQUEST') {
    const absoluteUrl = makeAbsoluteUrl(request.url);

    (async () => {
      try {
        const resp = await fetch(absoluteUrl, {
          method: request.method || 'GET',
          headers: request.headers || { 'Content-Type': 'application/json' },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        const contentType = resp.headers.get('content-type') || '';
        let data: any = null;
        try {
          if (contentType.includes('application/json')) {
            data = await resp.json();
          } else {
            const text = await resp.text();
            try {
              data = JSON.parse(text);
            } catch {
              data = { message: text };
            }
          }
        } catch (e) {
          data = { message: 'No content' };
        }

        if (!resp.ok) {
          // AI offline fallbacks
          const url = (request.url || '').toString();
          if (/\/api\/ai\/parse-task$/.test(url)) {
            const input = (request.body && request.body.text) ? String(request.body.text) : '';
            const trimmed = input.trim();
            const firstLine = trimmed.split(/\r?\n/)[0] || trimmed;
            const title = firstLine.slice(0, 80) || 'New Task';
            const tags = (trimmed.match(/#\w+/g) || []).map(t => t.replace('#',''));
            const guessPriority = /\b(urgent|asap|high)\b/i.test(trimmed) ? 3 : (/\b(low)\b/i.test(trimmed) ? 1 : 2);
            sendResponse({ success: true, data: { title, description: trimmed, tags, priority: guessPriority } });
            return;
          }
          if (/\/api\/ai\/chat$/.test(url)) {
            const message = request.body?.message || '';
            const pageTitle = request.body?.context?.pageContent?.title || '';
            const headings = request.body?.context?.pageContent?.headings || [];
            const tasks = request.body?.context?.tasks || [];
            const reply = `Offline assistant: You said \"${message}\". Page: ${pageTitle || 'unknown'}.` +
              (headings?.length ? ` Headings: ${headings.slice(0,3).join(' | ')}.` : '') +
              (tasks?.length ? ` Recent tasks: ${tasks.length}.` : '');
            sendResponse({ success: true, data: { message: reply } });
            return;
          }
          // Tasks offline fallbacks
          const offline = await tryOfflineTasks(request);
          if (offline) { sendResponse(offline); return; }

          sendResponse({ success: false, error: `HTTP ${resp.status}: ${data?.message || 'Request failed'}` });
          return;
        }

        sendResponse({ success: true, data });
      } catch (error: any) {
        // Network failure; try offline fallbacks
        try {
          const url = (request.url || '').toString();
          if (/\/api\/ai\/parse-task$/.test(url)) {
            const input = (request.body && request.body.text) ? String(request.body.text) : '';
            const trimmed = input.trim();
            const firstLine = trimmed.split(/\r?\n/)[0] || trimmed;
            const title = firstLine.slice(0, 80) || 'New Task';
            const tags = (trimmed.match(/#\w+/g) || []).map(t => t.replace('#',''));
            const guessPriority = /\b(urgent|asap|high)\b/i.test(trimmed) ? 3 : (/\b(low)\b/i.test(trimmed) ? 1 : 2);
            sendResponse({ success: true, data: { title, description: trimmed, tags, priority: guessPriority } });
            return;
          }
          if (/\/api\/ai\/chat$/.test(url)) {
            const message = request.body?.message || '';
            const pageTitle = request.body?.context?.pageContent?.title || '';
            const headings = request.body?.context?.pageContent?.headings || [];
            const tasks = request.body?.context?.tasks || [];
            const reply = `Offline assistant: You said \"${message}\". Page: ${pageTitle || 'unknown'}.` +
              (headings?.length ? ` Headings: ${headings.slice(0,3).join(' | ')}.` : '') +
              (tasks?.length ? ` Recent tasks: ${tasks.length}.` : '');
            sendResponse({ success: true, data: { message: reply } });
            return;
          }
          const offline = await tryOfflineTasks(request);
          if (offline) { sendResponse(offline); return; }
        } catch {}

        sendResponse({ success: false, error: error?.message || 'Network error' });
      }
    })();

    return true; // Keep message channel open for async response
  }
});
