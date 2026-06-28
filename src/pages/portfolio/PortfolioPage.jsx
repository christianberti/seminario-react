import {useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';


import '../../assets/styles/Portfolio.css';

const PortFolioPage = () => {
    const {auth} = useContext(AuthContext);
    const [dineroDisponible, setDineroDisponible] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const cargarUsuario = async () => {
            try {

                const response = await api.get(`users/${auth.userId}`);
                const userData = response.data.data;

                console.log(userData);
                setDineroDisponible(userData.balance);
            } catch (error) {

                setMensaje(error.response?.data?.message || 'Error al cargar los datos del usuario');
            } finally {
                setCargando(false);
            }
        };

        cargarUsuario();
    }, [auth.userId]);

    if (cargando) {
        return <p>Cargando portfolio...</p>;
    }



    return (
        <main className="portfolio-container">
            <h2> Mi portfolio</h2>
            {mensaje && <p className="portfolio-error"> {mensaje} </p>}
            <p> 
                Dinero disponible: ${Number(dineroDisponible).toFixed(2)}
            </p>
            <Link to="/panel" className="portfolio-link">
                ver panel
            </Link>
        </main>
    );
};

export default PortFolioPage;