import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parsedUser = jwtDecode(token);
        console.log('Decoded user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse token:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const parsedUser = jwtDecode(token);
      console.log('Decoded user:', parsedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error('Failed to parse token during login:', error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}