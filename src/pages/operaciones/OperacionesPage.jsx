import { useCallback, useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';
import '../../assets/styles/Operaciones.css';

const OperacionesPage = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tipo, setTipo] = useState('');
  const [assetId, setAssetId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const cargarAssetsDelHistorial = useCallback(async () => {
    try {
      const response = await api.get('/transactions');
      const operacionesSinFiltro = response.data.data;
      const assetsUnicos = Array.from(
        new Map(
          operacionesSinFiltro.map((operacion) => [
            operacion.asset_id,
            {
              id: operacion.asset_id,
              name: operacion.asset_name,
            },
          ])
        ).values()
      );

      setAssets(assetsUnicos);
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al cargar los assets del historial');
    }
  }, []);

  const cargarOperaciones = useCallback(async () => {
    try {
      const params = {};

      if (tipo) {
        params.type = tipo;
      }

      if (assetId) {
        params.asset_id = assetId;
      }

      const response = await api.get('/transactions', { params });

      setOperaciones(response.data.data);
      setMensaje('');
    } catch (error) {
      setMensaje(error.response?.data?.message || 'Error al cargar las operaciones');
    } finally {
      setCargando(false);
    }
  }, [assetId, tipo]);

  useEffect(() => {
    const primeraCarga = setTimeout(() => {
      cargarAssetsDelHistorial();
    }, 0);

    return () => clearTimeout(primeraCarga);
  }, [cargarAssetsDelHistorial]);

  useEffect(() => {
    const primeraCarga = setTimeout(cargarOperaciones, 0);

    return () => clearTimeout(primeraCarga);
  }, [cargarOperaciones]);

  const limpiarFiltros = () => {
    setTipo('');
    setAssetId('');
  };

  if (cargando) {
    return <p className="operaciones-loading">Cargando operaciones...</p>;
  }

  return (
    <main className="operaciones-container">
      <h2 className="operaciones-title">Mis operaciones</h2>
      <p className="operaciones-description">
        Historial de compras y ventas.
      </p>

      {mensaje && <p className="operaciones-error">{mensaje}</p>}

      <div className="operaciones-filtros-bar">
        <div className="operaciones-filtros-group">
          <div className="operaciones-field">
            <label>Tipo de operacion:</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todas</option>
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </select>
          </div>

          <div className="operaciones-field">
            <label>Asset:</label>
            <select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">Todos</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-limpiar" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {operaciones.length === 0 ? (
        <p className="operaciones-vacio">No tenés operaciones registradas</p>
      ) : (
        <table className="operaciones-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Asset</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {operaciones.map((operacion) => {
              const claseTipo = operacion.transaction_type === 'buy'
                ? 'tipo-compra'
                : 'tipo-venta';

              return (
                <tr key={`${operacion.asset_id}-${operacion.transaction_date}-${operacion.quantity}`}>
                  <td>{new Date(operacion.transaction_date).toLocaleString()}</td>
                  <td>{operacion.asset_name}</td>
                  <td className={claseTipo}>
                    {operacion.transaction_type === 'buy' ? 'Compra' : 'Venta'}
                  </td>
                  <td>{operacion.quantity}</td>
                  <td>${Number(operacion.price_per_unit).toFixed(2)}</td>
                  <td>${Number(operacion.total_amount).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default OperacionesPage;
