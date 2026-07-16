import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CompraProvider } from './context/CompraContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CompraProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '14px', background: '#111111', color: '#ffffff', boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } }} />
        </CompraProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
