import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ResourceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ResourceProvider>
    </AuthProvider>
  </React.StrictMode>
);