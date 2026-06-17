import { useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/EditarPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const EditarPage = () => { 
    const { auth, updateUserInfo } = useContext(AuthContext);
    const [formData, setFormData] = useState({name: auth.name, password: '', confirmPassword: '' });
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { userId } = useParams();
    const isAdminMode = Boolean(userId);
    const targetUserId = isAdminMode ? userId : auth.userId;
 

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrores((prev) => ({ ...prev, [e.target.name]: undefined }));
        setMensaje('');
    };

    useEffect(() => {
    const loadUser = async () => {
        try {
        const id = isAdminMode ? userId : auth.userId;
        const res = await api.get(`/users/${id}`);

        setFormData({
            name: res.data.data.name,
            password: '',
            confirmPassword: ''
        });

        } catch (err) {
            setMensaje('Error al cargar usuario');
        }
    };

    loadUser();
    }, [userId]);
    
    const validarForm = () => {
        const nuevosErrores = {};
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+])[A-Za-z\d@$!%*?&+]{8,}$/;
        

        if (!formData.name.trim()) {
            nuevosErrores.name = 'El nombre no puede estar vacío ';
        }else if (formData.name.length > 30) {
            nuevosErrores.name = 'El nombre debe tener máximo 30 caracteres.';
        }
        if (formData.password ){
            if (!passRegex.test(formData.password)) {
                nuevosErrores.password = 'La contraseña nueva debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.';
            }
            if (formData.password !== formData.confirmPassword) {
                nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
            }
        }else if (formData.confirmPassword) {
            nuevosErrores.password = 'Si se ingresa una contraseña de confirmación, también debe ingresarse la nueva contraseña.';
        }
        
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        if (validarForm()) {
            try {
                const updateData = { name: formData.name .trim() };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await api.put(`/users/${targetUserId}`, updateData);
                setMensaje('Usuario actualizado correctamente');
                if (!isAdminMode){
                    updateUserInfo(formData.name);
                }
                setErrores({}); 
                setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
                setTimeout(() => setMensaje(''), 5000);
            } catch (error) {
                setMensaje(error.response?.data?.message || 'Error al actualizar el usuario');
            }
        }
    };


    return (
        <main className="editar-container">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    {errores.name && <p className="error">{errores.name}</p>}
                </div>
                <div className="password-group">
                    <label>Contraseña:</label>
                    <input name="password" value={formData.password} onChange={handleChange} type={showPassword ? 'text' : 'password'} />
                    <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errores.password && <p className="error">{errores.password}</p>}
                </div>
                <div className="password-group">
                    <label> Confirmar Contraseña:</label>
                    <input name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type={showConfirmPassword ? 'text' : 'password'}/>
                    <button className="password-toggle" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errores.confirmPassword && <p className="error">{errores.confirmPassword}</p>}
                </div>
                <button type="submit" >Guardar Cambios</button>
                {mensaje && <p className="success">{mensaje}</p>}

            </form>

        </main>
    );
}

export default EditarPage;