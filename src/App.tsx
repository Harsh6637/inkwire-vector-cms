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

  // If a user is already stored in localStorage, bypass login
  useEffect(() => {
    if (checkExistingLogin()) navigate('/dashboard');
  }, [checkExistingLogin, navigate]);

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