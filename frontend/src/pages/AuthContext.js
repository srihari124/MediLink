import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        try {
          const parsedUser = jwtDecode(token);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const parsedUser = jwtDecode(token);
      setUser(parsedUser);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
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