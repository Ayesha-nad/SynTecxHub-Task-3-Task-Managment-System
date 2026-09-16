# 📌 PinBoard — Corkboard & Sticky Notes Task Manager

A full-stack, tactile task management web application built with **React**, **Node.js + Express**, and **MongoDB (Mongoose)**. Featuring secure **JWT Authentication**, full CRUD capabilities, native HTML5 drag-and-drop, and an original **"Corkboard & Sticky Notes"** physical productivity-wall aesthetic.

---

## 🎨 Visual Identity & Theme: "Corkboard & Sticky Notes"

Unlike traditional dark-neon SaaS dashboards or plain table cards, PinBoard is crafted to evoke the feeling of a physical corkboard wall in a creative studio:

- **Warm Corkboard Surface (`#a9784f`)**: Procedural tactile cork speckle pattern with soft lighting vignette and wooden outer frame trim.
- **Natural Sticky Notes**: Realistic rotated notes (-3.5° to +3.5°) with 3D drop-shadows, bottom-corner peel curls, and hover tilt physics.
- **Physical Pushpins & Washi Tape**: Multi-color 3D pushpins (🔴 Red, 🟡 Brass, 🟢 Teal, 🟤 Wood) and semi-translucent washi tape strips.
- **Rotating Color Palette**:
  - 🟡 **Soft Yellow (`#f5e07a`)** — Normal priority / To-Do notes
  - 🔴 **Coral Pink (`#f39a8a`)** — High-priority / Urgent tasks
  - 🟢 **Mint Green (`#a8d8b9`)** — Completed / Done tasks
  - 🔵 **Sky Blue (`#a9cce8`)** — In-progress tasks
  - 🟣 **Lavender (`#e8d5f5`)** — Low-priority / Ideas
- **Dual Typography Pairing**:
  - Display / Titles: **Caveat** & **Kalam** handwritten fonts.
  - Body & Meta: **Inter** & **Work Sans** for crisp legibility.
- **Notebook Memo Binder Auth**: Login and registration styled as an authentic lined-page planner with spiral rings and vintage stamps.
- **Torn-Paper Modal**: Deletion confirmation styled as a torn paper scrap prompting *"Pull the pin?"*.

---

## 📸 Interface Previews

### 1. Corkboard Kanban View (Desktop)
```
+---------------------------------------------------------------------------------------+
| 📌 PinBoard [Columns | Pinboard]              📌 12 Total | ✓ 4 Done | ⚠ 1 Overdue   |
+---------------------------------------------------------------------------------------+
| [🔍 Search notes...]  [🔥 High] [📌 Normal] [🌱 Low]  [🏷️ Tag: #design]  [Sort: Newest] |
+---------------------------------------------------------------------------------------+
|  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐                |
|  │ 🔴 TO DO     (3) │    │ 🔵 IN PROGRESS(2)│    │ 🟢 DONE      (4) │                |
|  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤                |
|  │ 📌 [Normal]      │    │ 📌 [High]   🔥   │    │ 📌 [Done]    ✓   │                |
|  │ "Finish wireframe│    │ "API Auth routes"│    │ "Setup database" │                |
|  │  for client"     │    │  (Lifted shadow  │    │  (Mint green note│                |
|  │  🏷️ #design      │    │   on drag start) │    │   strikethrough) │                |
|  │  📅 Oct 24       │    │  📅 Today        │    │  ✓ Completed     │                |
|  └──────────────────┘    └──────────────────┘    └──────────────────┘                |
+---------------------------------------------------------------------------------------+
| 📌 Drag notes between columns or toggle completion with the check pin                |
+---------------------------------------------------------------------------------------+
```

### 2. Notebook Memo Binder (Authentication)
```
   ╔═══════════════════════════════════════════════╗
   ║ ⚪ ⚪ ⚪  PINBOARD DAILY      [★ AUTH 2026 ★] ║
   ║ ⚪ ⚪ ⚪  Open Your Board                     ║
   ║ ⚪ ⚪ ⚪  ----------------------------------- ║
   ║ ⚪ ⚪ ⚪  Email Address: [ alex@corkboard.app ]║
   ║ ⚪ ⚪ ⚪  Password:      [ ••••••••••••••••  ]║
   ║ ⚪ ⚪ ⚪  [ Enter Workspace → ]               ║
   ║ ⚪ ⚪ ⚪  [ Quick Demo Mode: Fill Demo ]      ║
   ╚═══════════════════════════════════════════════╝
```

---

## 🛠️ Technology Stack

| Layer | Technology | Key Features |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite SPA) | Functional components, Hooks, Context API (`AuthContext`, `ToastContext`), Axios API client with global 401 interceptor |
| **Styling** | Vanilla CSS Design System | Custom CSS variables, SVG procedural cork texture, tactile drop-shadows, responsive mobile column tabs |
| **Backend** | Node.js + Express (REST API) | Modular routing, JWT middleware, centralized error handler, `express-rate-limit`, `helmet`, `cors` |
| **Database** | MongoDB + Mongoose ODM | User & Task schemas, compound indexes, bcrypt password hashing hooks, zero-config In-Memory MongoDB fallback |
| **Icons & Fonts** | Lucide React + Google Fonts | Pushpin, tape, calendar, tag, check icons + Caveat, Kalam, Inter fonts |

---

## 🚀 Getting Started & Setup Guide

### Prerequisites
- **Node.js** (v18+ or v20+ recommended)
- **NPM** (v9+)
- *(Optional)* Local **MongoDB** or **MongoDB Atlas** connection string (an embedded in-memory MongoDB instance will automatically run if no external URI is provided).

---

### Step 1: Clone or Navigate to Project Directory

```bash
cd "Task Manager Task 3"
```

---

### Step 2: Configure Environment Variables

Create `.env` in `/server`:

```bash
# /server/.env
PORT=5000
NODE_ENV=development

# Optional: Provide MongoDB Atlas / local URI (leave blank for zero-config In-Memory MongoDB)
MONGODB_URI=

# Secret key for JWT signing
JWT_SECRET=corkboard-tactile-sticky-secret-key-super-secure-2026
JWT_EXPIRES_IN=1h

# Allowed frontend client origin
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Start the Backend Server

```bash
cd server
npm install
npm run dev
```

> The server will start on `http://localhost:5000`. If `MONGODB_URI` is not set, it will automatically launch `mongodb-memory-server` and connect seamlessly!

---

### Step 4: Start the Frontend Client

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

> The Vite dev server will start on `http://localhost:5173`. Open your browser and explore the Corkboard!

---

## 🔐 Authentication & Security Architecture

### 1. Registration Flow (`POST /api/auth/register`)
- Input validation via `express-validator` (valid email, minimum 6-character password, 2-60 character name).
- Checks for duplicate emails and returns a friendly error note.
- Passwords are automatically hashed with `bcryptjs` (salt rounds = 10) in Mongoose pre-save hooks.
- Automatically assigns a random pastel sticky note avatar color.
- Generates a signed JWT access token (1h expiration) and returns safe user profile data.

### 2. Login Flow (`POST /api/auth/login`)
- Verifies credentials against hashed password using `user.comparePassword()`.
- Issues signed JWT token.
- Passwords are never returned in responses (`select: false` on the User schema).
- Rate-limited via `express-rate-limit` (30 attempts per 15-minute window) to prevent brute-force attacks.

### 3. Protected Route Middleware (`authMiddleware.js`)
- Every `/api/tasks/*` route requires the `Authorization: Bearer <token>` header.
- Decodes JWT and attaches authenticated user to `req.user`.
- Missing, expired, or tampered tokens return standard `401 Unauthorized` with clear codes (`TOKEN_EXPIRED`, `TOKEN_INVALID`).

### 4. Client-Side Session & 401 Auto-Logout
- Token stored in memory and synchronized with `localStorage` for page reload persistence.
- **Global Axios Interceptor**: Automatically catches `401 Unauthorized` responses on API calls, clears local session storage, dispatches a toast notification (*"Your session has expired. Please sign in again."*), and redirects to `/login`.
- **Security Trade-off Note**:
  - `localStorage` enables seamless multi-tab access and simple deployment without requiring sticky cookie configurations across domains.
  - In high-security environments, `httpOnly` secure cookies with CSRF token verification should be used to protect against XSS token leakage.

---

## 📡 API Endpoint Documentation

All `/api/tasks` endpoints require `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ No | `{ "name": "Alex", "email": "alex@app.com", "password": "Secret123!" }` | Registers user & returns JWT |
| `POST` | `/api/auth/login` | ❌ No | `{ "email": "alex@app.com", "password": "Secret123!" }` | Authenticates user & returns JWT |
| `GET` | `/api/auth/me` | ✅ Yes | *None* | Returns current authenticated profile |

---

### Task Endpoints (`/api/tasks`)

| Method | Endpoint | Auth | Query / Body | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/tasks` | ✅ Yes | `?status=todo&priority=high&tag=design&search=wireframe&sort=dueDate&order=asc` | Fetch user tasks with filter/search/sort |
| `GET` | `/api/tasks/stats/summary`| ✅ Yes | *None* | Aggregate task counts (total, todo, in-progress, done, overdue) |
| `POST` | `/api/tasks` | ✅ Yes | `{ "title": "Wireframe", "description": "...", "priority": "high", "dueDate": "2026-10-24", "tags": ["design"], "color": "#f39a8a", "pinStyle": "red-pin" }` | Pins a new sticky note |
| `GET` | `/api/tasks/:id` | ✅ Yes | *None* | Get single task details |
| `PUT` | `/api/tasks/:id` | ✅ Yes | `{ "title": "Updated title", "priority": "normal", ... }` | Update task details |
| `PATCH`| `/api/tasks/:id/status` | ✅ Yes | `{ "status": "in-progress" }` | Quick status change (drag & drop / toggle complete) |
| `DELETE`| `/api/tasks/:id` | ✅ Yes | *None* | Delete note (pull the pin) |

---

### Consistent Error Response Shape

All errors return a predictable JSON payload:

```json
{
  "success": false,
  "message": "Validation failed. Please check your inputs.",
  "code": "VALIDATION_ERROR",
  "errors": {
    "title": "Task title is required",
    "email": "Please provide a valid email address"
  }
}
```

- `400 Bad Request` — Validation failures, invalid ObjectIds.
- `401 Unauthorized` — Missing, expired, or invalid JWT.
- `403 Forbidden` — Attempting to access another user's task.
- `404 Not Found` — Resource or route not found.
- `500 Server Error` — Unhandled server exceptions (with sanitized message).

---

## 📱 Responsive & Mobile Touch Support

- **Desktop**: 3-Column Kanban Board with native HTML5 Drag-and-Drop + Freeform Pinboard scatter view.
- **Mobile**: Sticky header with column switcher tabs (`To Do`, `In Progress`, `Done`) and dedicated touch dropdowns (`Move to...`) on each card for quick column switching on mobile devices.

---

## 📄 License
MIT License. Built with ❤️ for productive minds.
