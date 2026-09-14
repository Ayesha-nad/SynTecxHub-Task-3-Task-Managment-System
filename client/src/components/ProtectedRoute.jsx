import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component: restricts access to authenticated users
 * Redirects unauthenticated users to /login preserving target location
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="corkboard-container flex-center" style={{ minHeight: '100vh' }}>
        <div className="sticky-skeleton" style={{ width: '300px' }}>
          <div className="skeleton-line title" />
          <div className="skeleton-line desc" />
          <div className="skeleton-line short" />
          <p className="handwritten text-center" style={{ marginTop: '10px', color: '#684a20' }}>
            Unpinning your board...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
