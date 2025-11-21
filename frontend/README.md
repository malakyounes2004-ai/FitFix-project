# FitFix Frontend

React frontend for the FitFix Health & Fitness application.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000 (make sure your backend is running)

## Features

- **Login Page** (`/login`)
  - Email and password authentication
  - Form validation
  - Role-based redirection:
    - Admin → `/admin-dashboard`
    - Employee → `/employee-dashboard`
    - User → `/dashboard`
  - Token stored in localStorage

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Login.jsx      # Login component
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind CSS imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Dependencies

- **React** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## API Integration

The Login component calls:
- `POST http://localhost:3000/api/auth/login`
- Expects: `{ email, password }`
- Returns: `{ success, data: { token, user: { role, ... } } }`

