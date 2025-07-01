import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import App from '../App';
import Homepage from '../pages/Homepage';
import { AuthContextProvider } from '../contexts/AuthContext';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Contact from '../pages/Contact';
import Wallet from '../pages/Wallet';
import GameLog from '../pages/GameLog';
import Promotion from '../pages/Promotion';
import Ads from '../pages/Ads';
import GameListPage from '../pages/GameListPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthContextProvider>
        <Homepage />
      </AuthContextProvider>
    ),
  },
  {
    path: '/login',
    element: (
      <AuthContextProvider>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/home',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/game',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/contact',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <Contact />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/wallet',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <Wallet />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/gamelog',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <GameLog />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/promotion',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <Promotion />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/ads',
    element: (
      <AuthContextProvider>
        <ProtectedRoute>
          <Ads />
        </ProtectedRoute>
      </AuthContextProvider>
    ),
  },
  {
    path: '/games/:gameTypeId/:productId',
    element: (
      <AuthContextProvider>
        <GameListPage />
      </AuthContextProvider>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
]);

export default router; 