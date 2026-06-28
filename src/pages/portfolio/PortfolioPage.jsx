import {useContext, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';


import '../../assets/styles/Portfolio.css';

import { REFRESH_INTERVAL } from '../../utils/constants';

const PortFolioPage = () => {
    const [portfolio, setPortfolio] = useState([]);

    const {auth} = useContext(AuthContext);
    const [dineroDisponible, setDineroDisponible] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');


    const [cantidadesCompra, setCantidadesCompra] = useState({});
    const [cantidadesVenta, setCantidadesVenta] = useState({});

    useEffect(() => {
        const cargarDatos = async () => {
            try {

                const portfolioResponse = await api.get(`/portfolio`);
                setPortfolio(portfolioResponse.data.data);

                const response = await api.get(`users/${auth.userId}`);
                const userData = response.data.data;

                console.log('USER DATA:', userData);
                setDineroDisponible(userData.balance);
            } catch (error) {

                setMensaje(error.response?.data?.message || 'Error al cargar los datos del usuario');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
        const interval = setInterval(cargarDatos, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [auth.userId]);

    if (cargando) {
        return <p>Cargando portfolio...</p>;
    }


    const cambiarCantidadCompra = (assetId, value) => {
        setCantidadesCompra({
            ...cantidadesCompra,
            [assetId]: value
        });
    };

    const cambiarCantidadVenta = (assetId, value) => {
        setCantidadesVenta({
            ...cantidadesVenta,
            [assetId]: value
        });
    };
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

            <section className="portfolio-list">
                {portfolio.map((asset) => {
                    const precioActual = Number(asset.current_price);
                    const cantidad = Number(asset.quantity);
                    const valorActual = Number(asset.total_value);
                    const subio = asset.current_price > asset.purchase_price;

                    return (
                        <article className="portfolio-card" key={asset.asset_id}>
                            <h3>{asset.asset_name}</h3>

                            <p> Precio de compra: ${precioActual.toFixed(2)}</p>
                            <p> Cantidad: {cantidad}</p>
                            <p> Valor actual: ${valorActual.toFixed(2)}</p>
                            <p className={subio ? "portfolio-up" : "portfolio-down"}>
                                {subio ? "Subió" : "Bajó"}
                            </p>

                            <div className="portfolio-actions">


                            <div>
                                <h4>Comprar</h4>
                                <input
                                type="number"
                                min="1"
                                max="20"
                                value={cantidadesCompra[asset.asset_id] || ''}
                                onChange={(e) => cambiarCantidadCompra(asset.asset_id, e.target.value)}
                                disabled={Number(dineroDisponible) === 0}
                                />

                                <p>
                                Costo estimado: $
                                {((Number(cantidadesCompra[asset.asset_id]) || 0) * precioActual).toFixed(2)}
                                </p>

                                {Number(dineroDisponible) === 0 && (
                                <p className="portfolio-error">No tenes saldo disponible</p>
                                )}

                                <button disabled={Number(dineroDisponible) === 0}>
                                Comprar
                                </button>
                            </div>

                            <div>
                                <h4>Vender</h4>
                                <input
                                type="number"
                                min="1"
                                max={cantidad}
                                value={cantidadesVenta[asset.asset_id] || ''}
                                onChange={(e) => cambiarCantidadVenta(asset.asset_id, e.target.value)}
                                />

                                <p>
                                Ganancia estimada: $
                                {((Number(cantidadesVenta[asset.asset_id]) || 0) * precioActual).toFixed(2)}
                                </p>

                                <button>
                                Vender
                                </button>
                            </div>
                            </div>
                        </article>                    
                        );
                })}
                </section>

        </main>
    );
};

export default PortFolioPage;