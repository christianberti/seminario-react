import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../utils/axiosConfig';
import { AuthContext } from '../../context/AuthContext';
import { REFRESH_INTERVAL } from '../../utils/constants';
import '../../assets/styles/Panel.css';

const PanelPage = () => {
  const { auth } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const preciosAnteriores = useRef({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [cantidadesCompra, setCantidadesCompra] = useState({});
  const [erroresCompra, setErroresCompra] = useState({});
  const [historialAsset, setHistorialAsset] = useState(null);
  const [historialPrecios, setHistorialPrecios] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const cargarAssets = useCallback(async (limpiarMensaje = true) => {
    try {
      const assetsResponse = await api.get('/assets');
      const userResponse = await api.get(`/users/${auth.userId}`);
      const nuevosAssets = assetsResponse.data.data;

      const assetsConEvolucion = nuevosAssets.map((asset) => {
        const precioAnterior = preciosAnteriores.current[asset.id];
        let evolucion = 'igual';

        if (precioAnterior != null && Number(asset.current_price) > Number(precioAnterior)) {
          evolucion = 'subio';
        }

        if (precioAnterior != null && Number(asset.current_price) < Number(precioAnterior)) {
          evolucion = 'bajo';
        }

        return {
          ...asset,
          evolucion,
        };
      });

      const nuevosPreciosAnteriores = {};
      nuevosAssets.forEach((asset) => {
        nuevosPreciosAnteriores[asset.id] = asset.current_price;
      });

      setAssets(assetsConEvolucion);
      preciosAnteriores.current = nuevosPreciosAnteriores;
      setDineroDisponible(userResponse.data.data.balance);
      if (limpiarMensaje) {
        setMensaje('');
      }
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al cargar los assets');
    } finally {
      setCargando(false);
    }
  }, [auth.userId]);

  useEffect(() => {
    const primeraCarga = setTimeout(cargarAssets, 0);
    const interval = setInterval(cargarAssets, REFRESH_INTERVAL);

    return () => {
      clearTimeout(primeraCarga);
      clearInterval(interval);
    };
  }, [cargarAssets]);

  const cambiarCantidadCompra = (assetId, value) => {
    setCantidadesCompra({
      ...cantidadesCompra,
      [assetId]: value,
    });
  };

  const guardarErrorCompra = (assetId, error) => {
    setErroresCompra({
      ...erroresCompra,
      [assetId]: error,
    });
  };

  const validarCompra = (asset) => {
    const assetId = asset.id;
    const precioActual = Number(asset.current_price);
    const cantidad = Number(cantidadesCompra[assetId]);
    const costo = cantidad * precioActual;

    if (!cantidad || cantidad <= 0) {
      guardarErrorCompra(assetId, 'Ingrese una cantidad para comprar');
      return false;
    }

    if (cantidad > 20) {
      guardarErrorCompra(assetId, 'No puede comprar mas de 20 unidades');
      return false;
    }

    if (costo > Number(dineroDisponible)) {
      guardarErrorCompra(assetId, 'Saldo insuficiente para esta operación');
      return false;
    }

    guardarErrorCompra(assetId, '');
    return true;
  };

  const comprarAsset = async (asset) => {
    if (!validarCompra(asset)) {
      return;
    }

    try {
      const cantidad = Number(cantidadesCompra[asset.id]);

      await api.post('/trade/buy', {
        asset_id: asset.id,
        quantity: cantidad,
      });

      setMensaje('Compra realizada con exito');
      setCantidadesCompra({
        ...cantidadesCompra,
        [asset.id]: '',
      });

      await cargarAssets(false);
      window.dispatchEvent(new Event('portfolio-updated'));
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al realizar la compra');
    }
  };

  const cerrarHistorial = () => {
    setHistorialAsset(null);
    setHistorialPrecios([]);
  };

  const verHistorial = async (asset) => {
    if (historialAsset?.id === asset.id) {
      cerrarHistorial();
      return;
    }

    try {
      setCargandoHistorial(true);
      setHistorialAsset(asset);
      setHistorialPrecios([]);

      const response = await api.get(`/assets/${asset.id}/history/5`);
      setHistorialPrecios(response.data.data);
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al cargar el historial de precios');
    } finally {
      setCargandoHistorial(false);
    }
  };

  const obtenerPrecioHistorial = (item) => Number(item.price_per_unit);
  
  if (cargando) {
    return <p className="panel-loading">Cargando assets...</p>;
  }

  return (
    <main className="panel-container">
      <h2>Panel</h2>

      {mensaje && <p className="panel-message">{mensaje}</p>}

      <p>Dinero disponible: ${Number(dineroDisponible).toFixed(2)}</p>

      <section className="panel-list">
        {assets.map((asset) => {
          const precioActual = Number(asset.current_price);
          const cantidadCompra = Number(cantidadesCompra[asset.id]) || 0;
          const costoEstimado = cantidadCompra * precioActual;
          const cantidadMaxima = precioActual > 0
            ? Math.min(20, Math.floor(Number(dineroDisponible) / precioActual))
            : 0;

          return (
            <article className="panel-card" key={asset.id}>
              <h3>{asset.name}</h3>
              <p>Precio actual: ${precioActual.toFixed(2)}</p>
              <p className={`panel-trend panel-trend-${asset.evolucion}`}>
                {asset.evolucion === 'subio' ? 'Subio' : asset.evolucion === 'bajo' ? 'Bajo' : 'Igual'}
              </p>

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

                <button onClick={() => verHistorial(asset)}>
                  Ver historial
                </button>

                {erroresCompra[asset.id] && (
                  <p className="panel-error">{erroresCompra[asset.id]}</p>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {historialAsset && (
        <section className="panel-history">
          <button onClick={cerrarHistorial}>
            Cerrar
          </button>

          <h3>Historial de {historialAsset.name}</h3>

          {cargandoHistorial ? (
            <p>Cargando historial...</p>
          ) : (
            <LineChart
              width={500}
              height={250}
              data={historialPrecios.map((item, index) => ({
                nombre: `Valor ${index + 1}`,
                precio: obtenerPrecioHistorial(item),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="precio" stroke="#00ff66" />
            </LineChart>
          )}
        </section>
      )}
    </main>
  );
};

export default PanelPage;
