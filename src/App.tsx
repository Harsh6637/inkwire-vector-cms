import React, { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './routes/PrivateRoute';
import { AuthContext } from './context/AuthContext';

function App() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('App must be used within an AuthProvider');
  }

  const { checkExistingLogin } = context;

  // FIXED: Prevent auto-scroll from navigation
  useEffect(() => {
    if (checkExistingLogin()) {
      // Use replace instead of navigate to prevent history-based scrolling
      navigate('/dashboard', { replace: true });
    }
  }, [checkExistingLogin, navigate]);

  // CRITICAL: Disable all scroll restoration globally
  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Override scroll functions globally
    const originalScrollTo = window.scrollTo;
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    const originalScrollBy = window.scrollBy;

    // Completely disable all scrolling functions
    window.scrollTo = () => {};
    window.scrollBy = () => {};
    Element.prototype.scrollIntoView = () => {};

    // Keep body at top position
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      // Restore functions on unmount (cleanup)
      window.scrollTo = originalScrollTo;
      window.scrollBy = originalScrollBy;
      Element.prototype.scrollIntoView = originalScrollIntoView;
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;