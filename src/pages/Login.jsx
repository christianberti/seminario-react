import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMensaje('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    
    try {
      const response = await api.post('/login', formData);
      const { name, isAdmin, userId } = response.data;
      
      const token = response.data.token || response.headers.authorization || `token_${Date.now()}`;
      
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('isAdmin', isAdmin);
      localStorage.setItem('userId', userId);
      
      login(token, name, isAdmin, userId);
      navigate('/');
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al iniciar sesión. Verificá tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange}
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      {mensaje && <p className="error">{mensaje}</p>}
    </main>
  );
};

export default Login;