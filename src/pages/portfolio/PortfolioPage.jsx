import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { REFRESH_INTERVAL } from '../../utils/constants';
import '../../assets/styles/Portfolio.css';

const PortfolioPage = () => {
  const { auth } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState([]);
  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [cantidadesCompra, setCantidadesCompra] = useState({});
  const [cantidadesVenta, setCantidadesVenta] = useState({});
  const [erroresOperacion, setErroresOperacion] = useState({});

  const cargarDatos = useCallback(async () => {
    try {
      const portfolioResponse = await api.get('/portfolio');
      const transactionsResponse = await api.get('/transactions');
      const userResponse = await api.get(`/users/${auth.userId}`);

      const operaciones = transactionsResponse.data.data;

      const portfolioConPrecioCompra = portfolioResponse.data.data.map((asset) => {
        const compras = operaciones
          .filter((op) =>
            Number(op.asset_id) === Number(asset.asset_id) &&
            op.transaction_type === 'buy'
          )
          .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        const primeraCompra = compras[0];

        return {
          ...asset,
          purchase_price: primeraCompra ? primeraCompra.price_per_unit : asset.current_price,
        };
      });

      setPortfolio(portfolioConPrecioCompra);
      setDineroDisponible(userResponse.data.data.balance);
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al cargar los datos del portfolio');
    } finally {
      setCargando(false);
    }
  }, [auth.userId]);

  useEffect(() => {
    const primeraCarga = setTimeout(cargarDatos, 0);

    const interval = setInterval(cargarDatos, REFRESH_INTERVAL);

    return () => {
      clearTimeout(primeraCarga);
      clearInterval(interval);
    };
  }, [cargarDatos]);

  const cambiarCantidadCompra = (assetId, value) => {
    setCantidadesCompra({
      ...cantidadesCompra,
      [assetId]: value,
    });
  };

  const cambiarCantidadVenta = (assetId, value) => {
    setCantidadesVenta({
      ...cantidadesVenta,
      [assetId]: value,
    });
  };

  const guardarErrorOperacion = (assetId, error) => {
    setErroresOperacion({
      ...erroresOperacion,
      [assetId]: error,
    });
  };

  const validarCompra = (asset) => {
    const assetId = asset.asset_id;
    const precioActual = Number(asset.current_price);
    const cantidad = Number(cantidadesCompra[assetId]);
    const costo = cantidad * precioActual;

    if (!cantidad || cantidad <= 0) {
      guardarErrorOperacion(assetId, 'Ingrese una cantidad para comprar');
      return false;
    }

    if (cantidad > 20) {
      guardarErrorOperacion(assetId, 'No puede comprar mas de 20 unidades');
      return false;
    }

    if (costo > Number(dineroDisponible)) {
      guardarErrorOperacion(assetId, 'Saldo insuficiente para esta operación');
      return false;
    }

    guardarErrorOperacion(assetId, '');
    return true;
  };

  const validarVenta = (asset) => {
    const assetId = asset.asset_id;
    const cantidadAVender = Number(cantidadesVenta[assetId]);
    const cantidadDisponible = Number(asset.quantity);

    if (!cantidadAVender || cantidadAVender <= 0) {
      guardarErrorOperacion(assetId, 'Ingrese una cantidad para vender');
      return false;
    }

    if (cantidadAVender > cantidadDisponible) {
      guardarErrorOperacion(assetId, 'No puede vender mas de lo que posee');
      return false;
    }

    guardarErrorOperacion(assetId, '');
    return true;
  };

  const comprarAsset = async (asset) => {
    if (!validarCompra(asset)) {
      return;
    }

    try {
      const cantidad = Number(cantidadesCompra[asset.asset_id]);

      await api.post('/trade/buy', {
        asset_id: asset.asset_id,
        quantity: cantidad,
      });

      setMensaje('Compra realizada con exito');
      setCantidadesCompra({
        ...cantidadesCompra,
        [asset.asset_id]: '',
      });

      await cargarDatos();
      window.dispatchEvent(new Event('portfolio-updated'));
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al realizar la compra');
    }
  };

  const venderAsset = async (asset) => {
    if (!validarVenta(asset)) {
      return;
    }

    try {
      const cantidad = Number(cantidadesVenta[asset.asset_id]);

      await api.post('/trade/sell', {
        asset_id: asset.asset_id,
        quantity: cantidad,
      });

      setMensaje('Venta realizada con exito');
      setCantidadesVenta({
        ...cantidadesVenta,
        [asset.asset_id]: '',
      });

      await cargarDatos();
      window.dispatchEvent(new Event('portfolio-updated')); // ← agregar acá
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al realizar la venta');
    }
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

  if (cargando) {
    return <p className="portfolio-loading">Cargando portfolio...</p>;
  }

  return (
    <main className="portfolio-container">
      <h2>Mi portfolio</h2>

      {mensaje && <p className="portfolio-message">{mensaje}</p>}

      <p>Dinero disponible: ${Number(dineroDisponible).toFixed(2)}</p>

      <Link to="/panel" className="portfolio-link">
        Ver Panel
      </Link>

      <section className="portfolio-list">
        {portfolio.length === 0 ? (
          <p>No tenes activos en el portfolio.</p>
        ) : (
          portfolio.map((asset) => {
            const precioActual = Number(asset.current_price);
            const precioCompra = Number(asset.purchase_price);
            const cantidad = Number(asset.quantity);
            const valorActual = Number(asset.total_value);
            const cantidadCompra = Number(cantidadesCompra[asset.asset_id]) || 0;
            const cantidadVenta = Number(cantidadesVenta[asset.asset_id]) || 0;
            const maxCompra = precioActual > 0
              ? Math.min(20, Math.floor(Number(dineroDisponible) / precioActual))
              : 0;
            const subio = precioActual >= precioCompra;

            return (
              <article className="portfolio-card" key={asset.asset_id}>
                <h3>{asset.asset_name}</h3>

                <p>Precio de compra: ${precioCompra.toFixed(2)}</p>
                <p>Cantidad: {cantidad}</p>
                <p>Precio actual: ${precioActual.toFixed(2)}</p>
                <p>Valor actual: ${valorActual.toFixed(2)}</p>

                <p className={subio ? 'portfolio-up' : 'portfolio-down'}>
                  {subio ? 'Subio' : 'Bajo'}
                </p>

                <div className="portfolio-actions">
                  <div>
                    <h4>Comprar</h4>
                    <input
                      type="number"
                      min="1"
                      max={maxCompra}
                      value={cantidadesCompra[asset.asset_id] || ''}
                      onChange={(e) => cambiarCantidadCompra(asset.asset_id, e.target.value)}
                      disabled={Number(dineroDisponible) === 0}
                    />

                    <p>Costo estimado: ${(cantidadCompra * precioActual).toFixed(2)}</p>

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
                      disabled={cantidad === 0}
                    />

                    <p>Ganancia estimada: ${(cantidadVenta * precioActual).toFixed(2)}</p>

                    <button
                      onClick={() => venderAsset(asset)}
                      disabled={cantidad === 0}
                    >
                      Vender
                    </button>
                  </div>

                  {cantidad === 0 && (
                    <button onClick={() => eliminarAsset(asset)}>
                      Eliminar
                    </button>
                  )}
                </div>

                {Number(dineroDisponible) === 0 && (
                  <p className="portfolio-error">No tenes saldo disponible</p>
                )}

                {erroresOperacion[asset.asset_id] && (
                  <p className="portfolio-error">{erroresOperacion[asset.asset_id]}</p>
                )}
              </article>
            );
          })
        )}
      </section>
    </main>
  );
};

export default PortfolioPage;
