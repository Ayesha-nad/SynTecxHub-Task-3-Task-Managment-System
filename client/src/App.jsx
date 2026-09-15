import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Board from './pages/Board';

// Import CSS Design System & Corkboard Theme Styles
import './styles/index.css';
import './styles/corkboard.css';
import './styles/stickynote.css';
import './styles/notebook-auth.css';
import './styles/modal-toast.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Corkboard Task Manager */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Board />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to board / login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
