import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Log that main.jsx is loading
console.log('🚀 main.jsx loading...');

// Ensure root element exists before rendering
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center; font-family: system-ui;"><h1 style="color: #dc2626;">Error: Root element not found</h1><p>Make sure index.html has a div with id="root"</p></div>';
} else {
  console.log('✅ Root element found, loading App...');
  
  // Dynamically import App to catch any import errors
  Promise.all([
    import('./App'),
    import('./components/ErrorBoundary')
  ]).then(([AppModule, ErrorBoundaryModule]) => {
    const App = AppModule.default;
    const ErrorBoundary = ErrorBoundaryModule.default;
    
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log('✅ App rendered successfully');
    } catch (error) {
      console.error('❌ Failed to render app:', error);
      rootElement.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-family: system-ui;">
          <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
            <h1 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #374151; margin-bottom: 1rem;">Failed to render the application. Please check the browser console (F12) for details.</p>
            <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; word-break: break-all;">${error.message || 'Unknown error'}</p>
            <button 
              onclick="window.location.href='/login'" 
              style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer;"
            >
              Go to Login
            </button>
          </div>
        </div>
      `;
    }
  }).catch((error) => {
    console.error('❌ Failed to import App or ErrorBoundary:', error);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; font-family: system-ui;">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
          <h1 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Import Error</h1>
          <p style="color: #374151; margin-bottom: 1rem;">Failed to load application files. This might be a build or dependency issue.</p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; word-break: break-all;">${error.message || 'Unknown error'}</p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem;">Try running: <code style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">cd frontend && npm install</code></p>
          <button 
            onclick="window.location.reload()" 
            style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; margin-right: 0.5rem;"
          >
            Reload Page
          </button>
          <button 
            onclick="window.location.href='/login'" 
            style="background: #10b981; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer;"
          >
            Try Login Page
          </button>
        </div>
      </div>
    `;
  });
}

