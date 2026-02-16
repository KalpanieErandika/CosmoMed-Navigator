import { useContext } from 'react';
import { AuthContext } from '../pages/context/Auth1';
import { Navigate } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';

const RequireAuth = ({ children, requiredRole = null }) => {
  const { user, token, loading } = useContext(AuthContext);

  console.log('RequireAuth - Auth state:', { 
    loading, 
    user: user?.user_type, 
    hasToken: !!token 
  });

  // Check if user is authenticated
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.user_type !== requiredRole) {
    const redirectMap = {
      pharmacist: '/pharmacist-home',
      general_user: '/user-home',
      nmra_official: '/nmra-dashboard'
    };
    return <Navigate to={redirectMap[user.user_type] || '/login'} replace />;
  }
  return children;
};

export default RequireAuth;