import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    name: null,
    isAdmin: false,
    userId: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userId = localStorage.getItem('userId');
    
    if (token) {
      setAuth({ token, name, isAdmin, userId });
    }
  }, []);

  const login = (token, name, isAdmin, userId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('name', name);
    localStorage.setItem('isAdmin', isAdmin);
    localStorage.setItem('userId', userId);
    setAuth({ token, name, isAdmin, userId });
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    setAuth({ token: null, name: null, isAdmin: false, userId: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};