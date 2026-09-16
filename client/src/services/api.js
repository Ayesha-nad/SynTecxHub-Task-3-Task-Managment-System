import axios from 'axios';

/**
 * Global Axios API Client
 * Configured with baseURL, JWT interceptor, 401 handler,
 * and seamless in-browser demo mock storage fallback for static live hosts (like GitHub Pages).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Seed default mock data if not initialized
const initializeMockStorage = () => {
  if (!localStorage.getItem('corkboard_mock_tasks')) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const futureDate2 = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString();

    const starterTasks = [
      {
        _id: 'mock_1',
        title: 'Review Q4 design roadmap',
        description: 'Finalize tactile corkboard components, drop shadows, and pushpin physics for production release.',
        dueDate: pastDate,
        priority: 'high',
        status: 'todo',
        tags: ['design', 'roadmap', 'urgent'],
        color: '#f39a8a',
        pinStyle: 'red-pin',
        rotation: -2.5,
        createdAt: new Date(now.getTime() - 40000).toISOString(),
      },
      {
        _id: 'mock_2',
        title: 'Draft weekly client summary',
        description: 'Summarize completed sprint tasks and send progress notes to the team.',
        dueDate: futureDate1,
        priority: 'normal',
        status: 'todo',
        tags: ['client', 'summary'],
        color: '#f5e07a',
        pinStyle: 'brass-pin',
        rotation: 1.8,
        createdAt: new Date(now.getTime() - 30000).toISOString(),
      },
      {
        _id: 'mock_3',
        title: 'Implement JWT authentication & rate limiters',
        description: 'Attach Authorization: Bearer token to all task requests and handle 401 auto logout.',
        dueDate: futureDate2,
        priority: 'normal',
        status: 'in-progress',
        tags: ['backend', 'security', 'api'],
        color: '#a9cce8',
        pinStyle: 'washi-tape',
        rotation: -1.2,
        createdAt: new Date(now.getTime() - 20000).toISOString(),
      },
      {
        _id: 'mock_4',
        title: 'Build torn-paper confirmation modal',
        description: 'Style "Pull the pin?" popup with realistic jagged sawtooth edges and tactile buttons.',
        dueDate: null,
        priority: 'low',
        status: 'done',
        tags: ['ui', 'modal'],
        color: '#a8d8b9',
        pinStyle: 'teal-pin',
        rotation: 2.1,
        createdAt: new Date(now.getTime() - 10000).toISOString(),
      },
      {
        _id: 'mock_5',
        title: 'Setup MongoDB schemas & Mongoose indexes',
        description: 'Configured User and Task models with compound indexes and validators.',
        dueDate: null,
        priority: 'normal',
        status: 'done',
        tags: ['database', 'mongoose'],
        color: '#a8d8b9',
        pinStyle: 'wood-pin',
        rotation: -0.8,
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(starterTasks));
  }
};

initializeMockStorage();

// In-browser mock handler for static deployments (GitHub Pages)
const handleMockFallback = (method, url, data = null, params = null) => {
  const tasksStr = localStorage.getItem('corkboard_mock_tasks') || '[]';
  let tasks = JSON.parse(tasksStr);

  // 1. Auth routes
  if (url.includes('/auth/login')) {
    const { email, password } = data || {};
    if (email === 'demo@corkboard.app' || (password && password.length >= 6)) {
      const name = email.split('@')[0];
      const mockUser = {
        id: 'mock_user_' + Date.now(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email.toLowerCase(),
        avatarColor: '#f5e07a',
      };
      return {
        data: {
          success: true,
          message: 'Signed in successfully (Live Demo Mode).',
          token: 'mock_jwt_token_' + Date.now(),
          user: mockUser,
        },
      };
    }
    return {
      status: 401,
      data: {
        success: false,
        message: 'Invalid email or password. Click "Fill Demo" for instant login.',
      },
    };
  }

  if (url.includes('/auth/register')) {
    const { name, email } = data || {};
    const mockUser = {
      id: 'mock_user_' + Date.now(),
      name: name || 'Demo User',
      email: (email || 'user@corkboard.app').toLowerCase(),
      avatarColor: '#ffd39a',
    };
    return {
      data: {
        success: true,
        message: 'Account created successfully! Welcome to your corkboard.',
        token: 'mock_jwt_token_' + Date.now(),
        user: mockUser,
      },
    };
  }

  if (url.includes('/auth/me')) {
    const cachedUser = localStorage.getItem('corkboard_user');
    return {
      data: {
        success: true,
        user: cachedUser
          ? JSON.parse(cachedUser)
          : { id: 'mock_me', name: 'Demo User', email: 'demo@corkboard.app', avatarColor: '#f5e07a' },
      },
    };
  }

  // 2. Task stats route
  if (url.includes('/tasks/stats/summary')) {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || []))).filter(Boolean);

    return {
      data: {
        success: true,
        stats: { total, todo, inProgress, done, highPriority, overdue },
        availableTags: allTags,
      },
    };
  }

  // 3. Task status patch
  if (method === 'patch' && url.match(/\/tasks\/([^/]+)\/status/)) {
    const id = url.split('/tasks/')[1].split('/status')[0];
    const { status } = data || {};
    tasks = tasks.map((t) => {
      if (t._id === id) {
        return {
          ...t,
          status,
          color: status === 'done' ? '#a8d8b9' : t.color || '#f5e07a',
        };
      }
      return t;
    });
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    const updated = tasks.find((t) => t._id === id);
    return { data: { success: true, task: updated } };
  }

  // 4. Task delete
  if (method === 'delete' && url.match(/\/tasks\/([^/]+)/)) {
    const id = url.split('/tasks/')[1];
    tasks = tasks.filter((t) => t._id !== id);
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    return { data: { success: true, deletedTaskId: id } };
  }

  // 5. Task update
  if (method === 'put' && url.match(/\/tasks\/([^/]+)/)) {
    const id = url.split('/tasks/')[1];
    tasks = tasks.map((t) => (t._id === id ? { ...t, ...data, _id: id } : t));
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    const updated = tasks.find((t) => t._id === id);
    return { data: { success: true, task: updated } };
  }

  // 6. Task create
  if (method === 'post' && url.endsWith('/tasks')) {
    const newTask = {
      ...data,
      _id: 'task_' + Date.now() + Math.random().toString(36).substring(2, 6),
      rotation: Number((Math.random() * 6 - 3).toFixed(1)),
      createdAt: new Date().toISOString(),
    };
    tasks = [newTask, ...tasks];
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    return { data: { success: true, task: newTask } };
  }

  // 7. Tasks list with search & filter
  if (method === 'get' && (url.endsWith('/tasks') || url.includes('/tasks?'))) {
    let result = [...tasks];
    const { priority, tag, search, sort = 'createdAt', order = 'desc' } = params || {};

    if (priority && priority !== 'all') {
      result = result.filter((t) => t.priority === priority);
    }
    if (tag) {
      result = result.filter((t) => (t.tags || []).includes(tag));
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sort === 'dueDate') {
        const d1 = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const d2 = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return order === 'desc' ? d2 - d1 : d1 - d2;
      }
      if (sort === 'title') {
        return order === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      }
      const c1 = new Date(a.createdAt || 0).getTime();
      const c2 = new Date(b.createdAt || 0).getTime();
      return order === 'desc' ? c2 - c1 : c1 - c2;
    });

    return { data: { success: true, count: result.length, tasks: result } };
  }

  return { data: { success: true } };
};

// Request Interceptor: Attach JWT from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('corkboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and network errors with smart mock fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if network error (e.g. static host without backend or backend offline)
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status === 404 ||
      error.response?.status === 502;

    if (isNetworkError) {
      console.info('📌 [PinBoard] Operating in live in-browser storage mode.');
      const method = error.config.method?.toLowerCase() || 'get';
      const url = error.config.url || '';
      let data = null;
      try {
        data = typeof error.config.data === 'string' ? JSON.parse(error.config.data) : error.config.data;
      } catch (e) {}

      const mockResponse = handleMockFallback(method, url, data, error.config.params);
      if (mockResponse.status === 401) {
        return Promise.reject({ response: mockResponse });
      }
      return Promise.resolve(mockResponse);
    }

    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');

      if (!isAuthRoute) {
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: {
              message:
                error.response.data?.message ||
                'Your session has expired. Please sign in again.',
            },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export default api;
