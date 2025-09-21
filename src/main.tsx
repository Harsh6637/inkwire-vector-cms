import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './routes/PrivateRoute';
import './index.css';

// Create router with scroll restoration disabled
const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
    )
  }
], {
  // CRITICAL: Disable automatic scroll restoration
  future: {
    v7_startTransition: true,
  }
});

// Override scroll restoration globally before anything renders
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Disable all scroll functions immediately
const originalScrollTo = window.scrollTo;
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalScrollBy = window.scrollBy;

window.scrollTo = () => {};
window.scrollBy = () => {};
Element.prototype.scrollIntoView = () => {};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ResourceProvider>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </ResourceProvider>
    </AuthProvider>
  </React.StrictMode>
);