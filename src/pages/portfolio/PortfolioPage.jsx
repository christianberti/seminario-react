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

    const [erroresOperacion, setErroresOperacion] = useState({});



    const cargarDatos = async () => {
        try {

            const portfolioResponse = await api.get(`/portfolio`);
            setPortfolio(portfolioResponse.data.data);

            const response = await api.get(`users/${auth.userId}`);
            const userData = response.data.data;

            setDineroDisponible(userData.balance);
        } catch (error) {

            setMensaje(error.response?.data?.message || 'Error al cargar los datos del usuario');
        } finally {
            setCargando(false);
        }
    }; 
    
    const comprarAsset = async (asset) => {
        const esValido = validarCompra(asset);

        if (!esValido) {
            return;
        }

        try {
            const cantidad = Number(cantidadesCompra[asset.asset_id]);

            await api.post('/trade/buy', {
            asset_id: asset.asset_id,
            quantity: cantidad
            });

            setMensaje('Compra realizada con exito');

            setCantidadesCompra({
            ...cantidadesCompra,
            [asset.asset_id]: ''
            });

            await cargarDatos();
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al realizar la compra');
        }
    };


    const venderAsset = async (asset) => {
        const esValido = validarVenta(asset);

        if (!esValido) {
            return;
        }

        try {
            const cantidad = Number(cantidadesVenta[asset.asset_id]);

            await api.post('/trade/sell', {
            asset_id: asset.asset_id,
            quantity: cantidad
            });

            setMensaje('Venta realizada con exito');

            setCantidadesVenta({
            ...cantidadesVenta,
            [asset.asset_id]: ''
            });

            await cargarDatos();
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al realizar la venta');
        }
    };
    useEffect(() => {


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

const validarCompra = (asset) => {
  const assetId = asset.asset_id;
  const precioActual = Number(asset.current_price);
  const cantidad = Number(cantidadesCompra[assetId]);
  const costo = cantidad * precioActual;

  if (!cantidad || cantidad <= 0) {
    setErroresOperacion({
      ...erroresOperacion,
      [assetId]: 'Ingrese una cantidad para comprar'
    });
    return false;
  }

  if (cantidad > 20) {
    setErroresOperacion({
      ...erroresOperacion,
      [assetId]: 'No puede comprar mas de 20 unidades'
    });
    return false;
  }

  if (costo > Number(dineroDisponible)) {
    setErroresOperacion({
      ...erroresOperacion,
      [assetId]: 'Saldo insuficiente para esta operación'
    });
    return false;
  }

  setErroresOperacion({
    ...erroresOperacion,
    [assetId]: ''
  });

  return true;
};

const validarVenta = (asset) => {
    const assetId = asset.asset_id;
    const cantidadAVender = Number(cantidadesVenta[assetId]);
    const cantidadDisponible = Number(asset.quantity);

    if (!cantidadAVender || cantidadAVender <= 0) {
        setErroresOperacion({
        ...erroresOperacion,
        [assetId]: 'Ingrese una cantidad para vender'
        });
        return false;
    }

    if (cantidadAVender > cantidadDisponible) {
        setErroresOperacion({
        ...erroresOperacion,
        [assetId]: 'No puede vender mas de lo que posee'
        });
        return false;
    }

    setErroresOperacion({
        ...erroresOperacion,
        [assetId]: ''
    });

    return true;
};

    const eliminarAsset = async (asset) => {
    try {
        await api.delete(`/portfolio/${asset.asset_id}`);

        setMensaje('Activo eliminado correctamente');

        await cargarDatos();
    } catch (error) {
        setMensaje(error.response?.data?.message || 'Error al eliminar el activo');
    }
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

                                    <button 
                                        disabled={Number(dineroDisponible) === 0}
                                        onClick={() => comprarAsset(asset)}
                                    >
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

                                    <button 
                                        onClick={() => venderAsset(asset)}
                                    >
                                    Vender
                                    </button>
                                    {erroresOperacion[asset.asset_id] && (
                                    <p className="portfolio-error">{erroresOperacion[asset.asset_id]}</p>
                                    )}
                                </div>
                                {cantidad === 0 && (
                                    <button onClick={() => eliminarAsset(asset)}>
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </article>                    
                        );
                })}
                </section>

        </main>
    );
};

export default PortFolioPage;