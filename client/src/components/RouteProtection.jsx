import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { userAuthorContextObj } from '../contexts/UserAuthorContext';

// Protected route component for admin routes
export const AdminRoute = ({ children }) => {
  const { currentUser } = useContext(userAuthorContextObj);
  const location = useLocation();

  // Check if user is authenticated, has admin role, and is active
  if (!currentUser.email) {
    // Redirect to sign-in page if not logged in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  } else if (currentUser.role !== 'admin') {
    // Redirect to home if not an admin
    return <Navigate to="/" replace />;
  } else if (!currentUser.isActive) {
    // Redirect to home if account is blocked/inactive
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

// Protected route component for author routes
export const AuthorRoute = ({ children }) => {
  const { currentUser } = useContext(userAuthorContextObj);
  const location = useLocation();

  // Check if user is authenticated, has author role, and is active
  if (!currentUser.email) {
    // Redirect to sign-in page if not logged in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  } else if (currentUser.role !== 'author') {
    // Redirect to home if not an author
    return <Navigate to="/" replace />;
  } else if (!currentUser.isActive) {
    // Redirect to home if account is blocked/inactive
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};

// Protected route component for user routes
export const UserRoute = ({ children }) => {
  const { currentUser } = useContext(userAuthorContextObj);
  const location = useLocation();

  // Check if user is authenticated, has user role, and is active
  if (!currentUser.email) {
    // Redirect to sign-in page if not logged in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  } else if (currentUser.role !== 'user') {
    // Redirect to home if not a user
    return <Navigate to="/" replace />;
  } else if (!currentUser.isActive) {
    // Redirect to home if account is blocked/inactive
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component
  return children;
};