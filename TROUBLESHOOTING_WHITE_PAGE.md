# Troubleshooting White Page Issue

## Quick Fix Steps

1. **Clear browser cache and localStorage:**
   - Open browser DevTools (F12)
   - Go to Application tab → Clear Storage → Clear site data
   - Or manually: `localStorage.clear()` in console

2. **Check browser console for errors:**
   - Press F12 to open DevTools
   - Check Console tab for red errors
   - Share any error messages you see

3. **Verify dependencies are installed:**
   ```bash
   cd frontend
   npm install
   ```

4. **Check if backend is running:**
   - Backend should be on port 3000
   - Frontend should be on port 5173 (or check terminal output)

5. **Try accessing login directly:**
   - Go to: `http://localhost:5173/login`
   - This should bypass any routing issues

## Common Causes

1. **JavaScript Error**: Check browser console (F12)
2. **Missing Dependencies**: Run `npm install` in frontend folder
3. **Firebase Config**: If Firebase isn't configured, the app should still work (it will use REST API only)
4. **Cached Build**: Try clearing browser cache or doing hard refresh (Ctrl+Shift+R)

## What I Fixed

1. ✅ Made Firebase imports non-blocking (app works even without Firebase)
2. ✅ Added better error handling in main.jsx
3. ✅ Added console logging to help debug
4. ✅ Ensured default route redirects to /login

## Next Steps

If you still see a white page:
1. Open browser console (F12)
2. Look for any red error messages
3. Share the error messages so I can fix them

The login page should appear at: `http://localhost:5173/login`

