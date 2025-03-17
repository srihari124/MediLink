import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    localStorage.removeItem('token'); // Remove JWT token
    logout(); // Update authentication context
    navigate('/login'); // Redirect to login page
  }, [navigate, logout]);

  return (
    <div className="container mt-5 text-center">
      <h2>Logging out...</h2>
    </div>
  );
};

export default Logout;
