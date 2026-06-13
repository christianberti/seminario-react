import { useState } from 'react';
import api from '../utils/axiosConfig';
import '../assets/styles/Registro.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegistroPage = () => {
  const [formData, setFormData] = useState({ email: '', name: '', password: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validar = () => {
    const nuevosErrores = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])[A-Za-z\d@$!%*?&+]{8,}$/;

    if (!emailRegex.test(formData.email)) {
      nuevosErrores.email = 'El email debe tener un formato válido.';
    }
    if (!formData.name || formData.name.length > 30) {
      nuevosErrores.name = 'El nombre no puede estar vacío y debe tener máximo 30 caracteres.';
    }
    if (!passRegex.test(formData.password)) {
      nuevosErrores.password = 'La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.';
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0; // true si no hay errores
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (validar() === true) {
      try {
        setLoading(true);
        await api.post('/users', formData);
        setMensaje('Registro exitoso. Ya podés iniciar sesión.');
        setFormData({ email: '', name: '', password: '' });
        setErrores({});
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          setMensaje(error.response.data.message);
        } else {
          setMensaje('Error al registrar el usuario.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="registro-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errores.email && <p className="error">{errores.email}</p>}
        </div>
        <div>
          <label>Nombre:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          {errores.name && <p className="error">{errores.name}</p>}
        </div>
        <div>
          <label>Contraseña:</label>
          <input  name="password" value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'}/>
          <button type="button" className="password-toggle"onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errores.password && <p className="error">{errores.password}</p>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      {mensaje && <p className="mensaje-feedback">{mensaje}</p>}
    </main>
  );
};

export default RegistroPage;