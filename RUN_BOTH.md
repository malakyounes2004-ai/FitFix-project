# How to Run Frontend and Backend Together

## 🚀 Quick Start (Recommended)

Run both frontend and backend with a single command:

```bash
npm run dev:all
```

This will start:
- **Backend** on `http://localhost:3000`
- **Frontend** on `http://localhost:5173`

The output will be color-coded:
- 🔵 Blue = Backend logs
- 🟢 Green = Frontend logs

---

## 📋 Alternative Methods

### Method 1: Two Separate Terminals

**Terminal 1 (Backend):**
```bash
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Method 2: Individual Scripts

**Backend only:**
```bash
npm run dev
```

**Frontend only:**
```bash
npm run dev:frontend
```

---

## ⚙️ Setup (First Time Only)

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Make sure your `.env` file is configured** (backend needs Firebase credentials)

---

## 🛑 Stopping

Press `Ctrl + C` in the terminal to stop both servers.

---

## 📝 Notes

- Backend must be running for the frontend login to work
- The frontend is configured to proxy API calls to `http://localhost:3000`
- Both servers will auto-reload on file changes (nodemon for backend, Vite for frontend)

