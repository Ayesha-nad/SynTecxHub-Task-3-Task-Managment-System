import axios from 'axios';

/**
 * Check if the application is running in a static web hosting environment (e.g. GitHub Pages)
 * where no backend Node server is running on the same domain.
 */
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.protocol === 'file:') &&
  !import.meta.env.VITE_API_URL;

/**
 * Initialize persistent mock database in localStorage for live static demo
 */
const initializeMockStorage = () => {
  // 1. Mock Users
  if (!localStorage.getItem('corkboard_mock_users')) {
    const defaultUsers = [
      {
        id: 'user_demo_1',
        name: 'Alex Morgan',
        email: 'demo@corkboard.app',
        password: 'DemoPass123!',
        avatarColor: '#f5e07a',
      },
    ];
    localStorage.setItem('corkboard_mock_users', JSON.stringify(defaultUsers));
  }

  // 2. Mock Tasks
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

/**
 * In-Browser Mock Store Request Dispatcher
 */
const executeMockOperation = (method, url, data = null, params = null) => {
  const users = JSON.parse(localStorage.getItem('corkboard_mock_users') || '[]');
  let tasks = JSON.parse(localStorage.getItem('corkboard_mock_tasks') || '[]');

  // Clean URL path
  const path = url.replace(/^\/?api/, '').replace(/^\/+/, '/');

  // 1. POST /auth/login
  if (path === '/auth/login' || path.endsWith('/auth/login')) {
    const { email, password } = data || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check registered mock users or default demo
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (user && (user.password === password || normalizedEmail === 'demo@corkboard.app')) {
      const token = 'mock_jwt_token_' + Date.now();
      const safeUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor || '#f5e07a',
      };
      return Promise.resolve({
        data: {
          success: true,
          message: 'Signed in successfully! (Live Demo Mode)',
          token,
          user: safeUser,
        },
      });
    }

    // If demo credentials matched
    if (normalizedEmail === 'demo@corkboard.app' && password === 'DemoPass123!') {
      const token = 'mock_jwt_token_' + Date.now();
      const safeUser = {
        id: 'user_demo_1',
        name: 'Alex Morgan',
        email: 'demo@corkboard.app',
        avatarColor: '#f5e07a',
      };
      return Promise.resolve({
        data: {
          success: true,
          message: 'Signed in as Demo User!',
          token,
          user: safeUser,
        },
      });
    }

    return Promise.reject({
      response: {
        status: 401,
        data: {
          success: false,
          message: 'Invalid email or password. Click "Fill Demo" for instant 1-click login.',
          code: 'INVALID_CREDENTIALS',
        },
      },
    });
  }

  // 2. POST /auth/register
  if (path === '/auth/register' || path.endsWith('/auth/register')) {
    const { name, email, password } = data || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!name || name.trim().length < 2) {
      return Promise.reject({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Name must be at least 2 characters long.',
            errors: { name: 'Name must be at least 2 characters' },
          },
        },
      });
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return Promise.reject({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Please provide a valid email address.',
            errors: { email: 'Please provide a valid email address' },
          },
        },
      });
    }

    if (!password || password.length < 6) {
      return Promise.reject({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Password must be at least 6 characters long.',
            errors: { password: 'Password must be at least 6 characters long' },
          },
        },
      });
    }

    // Check duplicate email
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing && normalizedEmail !== 'demo@corkboard.app') {
      return Promise.reject({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'An account with this email address already exists. Please log in.',
            errors: { email: 'Email already registered' },
          },
        },
      });
    }

    const AVATAR_COLORS = ['#f5e07a', '#f39a8a', '#a8d8b9', '#a9cce8', '#e8d5f5', '#ffd39a'];
    const randomAvatar = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newUser = {
      id: 'mock_user_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      avatarColor: randomAvatar,
    };

    users.push(newUser);
    localStorage.setItem('corkboard_mock_users', JSON.stringify(users));

    const token = 'mock_jwt_token_' + Date.now();
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarColor: newUser.avatarColor,
    };

    return Promise.resolve({
      data: {
        success: true,
        message: 'Account created successfully! Welcome to your corkboard.',
        token,
        user: safeUser,
      },
    });
  }

  // 3. GET /auth/me
  if (path === '/auth/me' || path.endsWith('/auth/me')) {
    const cachedUser = localStorage.getItem('corkboard_user');
    const user = cachedUser
      ? JSON.parse(cachedUser)
      : { id: 'mock_user_1', name: 'Alex Morgan', email: 'demo@corkboard.app', avatarColor: '#f5e07a' };
    return Promise.resolve({
      data: {
        success: true,
        user,
      },
    });
  }

  // 4. GET /tasks/stats/summary
  if (path.includes('/tasks/stats/summary')) {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;

    const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || []))).filter(Boolean);

    return Promise.resolve({
      data: {
        success: true,
        stats: { total, todo, inProgress, done, highPriority, overdue },
        availableTags: allTags,
      },
    });
  }

  // 5. PATCH /tasks/:id/status
  if (method === 'patch' && path.match(/\/tasks\/([^/]+)\/status/)) {
    const id = path.split('/tasks/')[1].split('/status')[0];
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
    return Promise.resolve({ data: { success: true, task: updated } });
  }

  // 6. DELETE /tasks/:id
  if (method === 'delete' && path.match(/\/tasks\/([^/]+)/)) {
    const id = path.split('/tasks/')[1];
    tasks = tasks.filter((t) => t._id !== id);
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    return Promise.resolve({ data: { success: true, deletedTaskId: id } });
  }

  // 7. PUT /tasks/:id
  if (method === 'put' && path.match(/\/tasks\/([^/]+)/)) {
    const id = path.split('/tasks/')[1];
    tasks = tasks.map((t) => (t._id === id ? { ...t, ...data, _id: id } : t));
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    const updated = tasks.find((t) => t._id === id);
    return Promise.resolve({ data: { success: true, task: updated } });
  }

  // 8. POST /tasks
  if (method === 'post' && (path === '/tasks' || path.endsWith('/tasks'))) {
    const newTask = {
      ...data,
      _id: 'task_' + Date.now() + Math.random().toString(36).substring(2, 6),
      rotation: Number((Math.random() * 6 - 3).toFixed(1)),
      createdAt: new Date().toISOString(),
    };
    tasks = [newTask, ...tasks];
    localStorage.setItem('corkboard_mock_tasks', JSON.stringify(tasks));
    return Promise.resolve({ data: { success: true, task: newTask } });
  }

  // 9. GET /tasks
  if (method === 'get' && (path === '/tasks' || path.endsWith('/tasks') || path.includes('/tasks?'))) {
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

    return Promise.resolve({ data: { success: true, count: result.length, tasks: result } });
  }

  return Promise.resolve({ data: { success: true } });
};

/**
 * Global API Client Object with automatic Static Host routing & Axios fallback
 */
const api = {
  get: (url, config = {}) => {
    if (isStaticHost) {
      return executeMockOperation('get', url, null, config.params);
    }
    return axiosInstance.get(url, config).catch((err) => handleFallbackOrReject('get', url, null, config.params, err));
  },
  post: (url, data = {}, config = {}) => {
    if (isStaticHost) {
      return executeMockOperation('post', url, data, config.params);
    }
    return axiosInstance.post(url, data, config).catch((err) => handleFallbackOrReject('post', url, data, config.params, err));
  },
  put: (url, data = {}, config = {}) => {
    if (isStaticHost) {
      return executeMockOperation('put', url, data, config.params);
    }
    return axiosInstance.put(url, data, config).catch((err) => handleFallbackOrReject('put', url, data, config.params, err));
  },
  patch: (url, data = {}, config = {}) => {
    if (isStaticHost) {
      return executeMockOperation('patch', url, data, config.params);
    }
    return axiosInstance.patch(url, data, config).catch((err) => handleFallbackOrReject('patch', url, data, config.params, err));
  },
  delete: (url, config = {}) => {
    if (isStaticHost) {
      return executeMockOperation('delete', url, null, config.params);
    }
    return axiosInstance.delete(url, config).catch((err) => handleFallbackOrReject('delete', url, null, config.params, err));
  },
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('corkboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const handleFallbackOrReject = (method, url, data, params, error) => {
  const isNetworkFailure =
    !error.response ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.response?.status === 404 ||
    error.response?.status === 405 ||
    error.response?.status === 502;

  if (isNetworkFailure) {
    console.info('📌 [PinBoard] Backend unreachable; switching to local in-browser storage mode.');
    return executeMockOperation(method, url, data, params);
  }

  if (error.response && error.response.status === 401) {
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
    if (!isAuthRoute) {
      window.dispatchEvent(
        new CustomEvent('auth:unauthorized', {
          detail: {
            message: error.response.data?.message || 'Your session has expired. Please sign in again.',
          },
        })
      );
    }
  }

  return Promise.reject(error);
};

export default api;
