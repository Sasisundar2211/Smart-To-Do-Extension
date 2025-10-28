import React, { useEffect, useState } from 'react';
import { Task } from './types';
import { AI_PARSE_ENDPOINT, TASKS_ENDPOINT } from './config';
import { api } from './api';

export default function Popup() {
  const [text, setText] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Helpers
  const isSafeHttpUrl = (url?: string) => !!url && /^https?:\/\//i.test(url);
  const openInNewTab = (url?: string) => {
    if (!isSafeHttpUrl(url)) return;
    try { chrome.tabs.create({ url: url! }); } catch {}
  };

  const loadLocalTasks = (): Promise<Task[]> => new Promise((resolve) => {
    try {
      chrome.storage.local.get(['tasks'], (res) => resolve(res.tasks || []));
    } catch {
      resolve([]);
    }
  });

  const saveLocalTasks = (t: Task[]): Promise<void> => new Promise((resolve) => {
    try {
      chrome.storage.local.set({ tasks: t }, () => resolve());
    } catch {
      resolve();
    }
  });

  useEffect(() => {
    // load tasks from the server; fallback to local storage
    api.get(TASKS_ENDPOINT).then((data: any) => {
      setTasks(Array.isArray(data) ? data : []);
    }).catch(async () => {
      const local = await loadLocalTasks();
      setTasks(local);
    });
  }, []);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      // Prepare context
      const page = await getCurrentTabUrl();

      // Try AI parse first
      let t: Task;
      try {
        const parsed = await api.post(AI_PARSE_ENDPOINT, { text, context: { url: page } }) as any;
        t = {
          title: parsed?.title || text,
          description: parsed?.description || '',
          dueDate: parsed?.dueDate || null,
          priority: parsed?.priority || 2,
          contextUrl: page,
          tags: parsed?.tags || []
        };
      } catch (e) {
        console.warn('AI Parse unavailable, falling back to basic task:', e);
        t = { id: Date.now().toString(), title: text, contextUrl: page };
      }

      // Try to persist to server; fallback to local storage
      try {
        const created = await api.post(TASKS_ENDPOINT, t) as Task;
        setTasks([created, ...tasks]);
      } catch (e) {
        console.warn('Tasks API unavailable, saving locally:', e);
        const localTask: Task = { ...t, _id: t._id || t.id || Date.now().toString() };
        const updated = [localTask, ...tasks];
        setTasks(updated);
        await saveLocalTasks(updated);
      }

      setText('');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTabUrl = (): Promise<string> =>
    new Promise((res) => {
      try {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          res(tabs[0]?.url || '');
        });
      } catch {
        res('');
      }
    });

  const toggleComplete = async (id?: string) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    try {
      const updatedTask: any = await api.put(`${TASKS_ENDPOINT}/${id}`, { completed: !task.completed });
      const newTasks = tasks.map(t => t._id === id ? updatedTask : t);
      setTasks(newTasks);
    } catch (e) {
      // Fallback: update locally
      const newTasks = tasks.map(t => t._id === id ? { ...t, completed: !t.completed } : t);
      setTasks(newTasks);
      await saveLocalTasks(newTasks);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 4: return '#ff4757'; // Urgent - Red
      case 3: return '#ffa502'; // High - Orange
      case 2: return '#3742fa'; // Medium - Blue
      case 1: return '#7bed9f'; // Low - Green
      default: return '#3742fa';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return 'Urgent';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Medium';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAdd();
    }
  };

  return (
    <div style={{
      width: 360,
      background: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1a1a1a',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa'
      }}>
        <div style={{
          padding: '16px 20px 12px',
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>🧠 Smart Todo <span style={{ color: '#888', fontWeight: '400', fontSize: '14px' }}>({tasks.length})</span></h1>
        </div>
      </div>

      {/* Tasks Content */}
      <div>
          {/* Clean Input */}
          <div style={{ padding: '20px' }}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What needs to be done?" 
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#007aff'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        <button 
          onClick={handleAdd} 
          disabled={loading || !text.trim()}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '10px',
            background: loading || !text.trim() ? '#f5f5f5' : '#007aff',
            color: loading || !text.trim() ? '#999' : 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Processing...' : 'Add Task'}
        </button>
      </div>

      {/* Clean Tasks List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {tasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
            fontSize: '14px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
            <div>No tasks yet</div>
          </div>
        ) : (
          tasks.map(t => (
            <div key={t._id} style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f0f0f0',
              background: t.completed ? '#fafafa' : 'white',
              opacity: t.completed ? 0.6 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  checked={!!t.completed} 
                  onChange={() => toggleComplete(t._id)}
                  style={{
                    marginTop: '2px',
                    accentColor: getPriorityColor(t.priority || 2)
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: t.completed ? '#999' : '#333',
                    textDecoration: t.completed ? 'line-through' : 'none',
                    marginBottom: '6px',
                    wordBreak: 'break-word'
                  }}>
                    {t.title}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Priority dot */}
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getPriorityColor(t.priority || 2),
                      flexShrink: 0
                    }} />
                    
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      {getPriorityLabel(t.priority || 2)}
                    </span>
                    
                    {/* Tags */}
                    {t.tags && t.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '11px',
                        color: '#666',
                        background: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {tag}
                      </span>
                    ))}
                    
                    {/* Due date */}
                    {t.dueDate && (
                      <span style={{
                        fontSize: '11px',
                        color: '#ff6b6b',
                        background: '#fff5f5',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  {t.description && (
                    <div style={{
                      fontSize: '12px',
                      color: '#777',
                      marginTop: '4px',
                      fontStyle: 'italic'
                    }}>
                      {t.description}
                    </div>
                  )}
                  
                  {/* Context link */}
                  {isSafeHttpUrl(t.contextUrl) && (
                    <button 
                      onClick={() => openInNewTab(t.contextUrl)}
                      style={{
                        fontSize: '11px',
                        color: '#007aff',
                        textDecoration: 'none',
                        marginTop: '4px',
                        display: 'inline-block',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer'
                      }}
                    >
                      View source
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
