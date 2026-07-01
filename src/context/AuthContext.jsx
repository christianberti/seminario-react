import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token'),
    name: localStorage.getItem('name'),
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    userId: localStorage.getItem('userId'),
  }));

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

  const updateUserInfo = (name) => {
    localStorage.setItem('name', name);
    setAuth((prev) => ({ ...prev, name }));
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};