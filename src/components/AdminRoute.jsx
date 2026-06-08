import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { auth } = useContext(AuthContext)
  return auth.isAdmin ? children : <Navigate to="/" />
}

export default AdminRoute;