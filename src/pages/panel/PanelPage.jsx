import { useContext, useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';
import '../../assets/styles/Panel.css';
import { REFRESH_INTERVAL } from '../../utils/constants';
import { AuthContext } from '../../context/AuthContext';
const PanelPage = () => {
    const [assets, setAssets] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const { auth } = useContext(AuthContext);
    const [dineroDisponible, setDineroDisponible] = useState(0);
    const [cantidadesCompra, setCantidadesCompra] = useState({});
    const [erroresCompra, setErroresCompra] = useState({});
    const cargarAssets = async () => {
        try {
            const response = await api.get('/assets');
            const userResponse = await api.get(`/users/${auth.userId}`);
            setDineroDisponible(userResponse.data.data.balance);
            setAssets(response.data.data);
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al cargar los assets');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarAssets();

        const interval = setInterval(cargarAssets, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [auth.userId]);

    if (cargando) {
        return <p className="panel-loading">Cargando assets...</p>;
    }
    const cambiarCantidadCompra = (assetId, value) => {
        setCantidadesCompra({
            ...cantidadesCompra,
            [assetId]: value
        });
    };

    const validarCompra = (asset) => {
        const assetId = asset.id;
        const precioActual = Number(asset.current_price);
        const cantidad = Number(cantidadesCompra[assetId]);
        const costo = cantidad * precioActual;

        if (!cantidad || cantidad <= 0) {
            setErroresCompra({
                ...erroresCompra,
                [assetId]: 'Ingrese una cantidad para comprar'
            });
            return false;
        }

        if (cantidad > 20) {
            setErroresCompra({
                ...erroresCompra,
                [assetId]: 'No puede comprar mas de 20 unidades'
            });
            return false;
        }

        if (costo > Number(dineroDisponible)) {
            setErroresCompra({
                ...erroresCompra,
                [assetId]: 'Saldo insuficiente para esta operación'
            });
            return false;
        }

        setErroresCompra({
            ...erroresCompra,
            [assetId]: ''
        });

        return true;
    };
    const comprarAsset = async (asset) => {
        const esValido = validarCompra(asset);

        if (!esValido) {
            return;
        }

        try {
            const cantidad = Number(cantidadesCompra[asset.id]);

            await api.post('/trade/buy', {
                asset_id: asset.id,
                quantity: cantidad
            });

            setMensaje('Compra realizada con exito');

            setCantidadesCompra({
                ...cantidadesCompra,
                [asset.id]: ''
            });

            await cargarAssets();
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al realizar la compra');
        }
    };
    return (
        <main className="panel-container">
            <h2>Panel</h2>

            {mensaje && <p className="panel-error">{mensaje}</p>}
            <p>Dinero disponible: ${Number(dineroDisponible).toFixed(2)}</p>
            <section className="panel-list">
                {assets.map((asset) => {
                    const precioActual = Number(asset.current_price);
                    const cantidadCompra = Number(cantidadesCompra[asset.id]) || 0;
                    const costoEstimado = cantidadCompra * precioActual;
                    const cantidadMaxima = Math.min(20, Math.floor(Number(dineroDisponible) / precioActual));

                    return (
                        <article className="panel-card" key={asset.id}>
                            <h3>{asset.name}</h3>
                            <p>Precio actual: ${precioActual.toFixed(2)}</p>

                            <div className="panel-buy">
                                <label>Cantidad:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={cantidadMaxima}
                                    value={cantidadesCompra[asset.id] || ''}
                                    onChange={(e) => cambiarCantidadCompra(asset.id, e.target.value)}
                                    disabled={Number(dineroDisponible) === 0}
                                />

                                <p>Costo estimado: ${costoEstimado.toFixed(2)}</p>

                                <button
                                    disabled={Number(dineroDisponible) === 0}
                                    onClick={() => comprarAsset(asset)}
                                >
                                    Comprar
                                </button>
                                {erroresCompra[asset.id] && (
                                    <p className="panel-error">{erroresCompra[asset.id]}</p>
                                )}
                            </div>
                        </article>
                    );
                })}
            </section>
        </main>
    );
};

export default PanelPage;