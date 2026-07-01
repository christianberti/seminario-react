import { useState, useEffect, useRef, useContext } from 'react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { REFRESH_INTERVAL } from '../utils/constants';
import '../assets/styles/StatPage.css';


const StatPage = () => {
  const { auth } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  //const [prevPrices, setPrevPrices] = useState({});
  const prevPrices = useRef({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      const newAssets = response.data.data;

      const assetsWithTrend = newAssets.map(asset => ({
        ...asset,
        trend: prevPrices.current[asset.id] != null
          ? asset.current_price > prevPrices.current[asset.id] ? 'up'
            : asset.current_price < prevPrices.current[asset.id] ? 'down'
              : 'neutral'
          : 'neutral',
      }));

      const newPrevPrices = {};
      newAssets.forEach(a => newPrevPrices[a.id] = a.current_price);
      prevPrices.current = newPrevPrices;   // ya no hace falta setPrevPrices

      setAssets(assetsWithTrend);
      setError(null);
    } catch (err) {
      setError('Error al cargar los assets. Intente nuevamente.',err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const actualizarPrecios = async () => {
    try {
      setActualizando(true);
      await api.put('/assets');
      await fetchAssets();
    } catch (err) {
      setError('Error al actualizar los precios. Intente nuevamente.', err);
    } finally {
      setActualizando(false);
    }
  };

  const getFilteredAndSorted = () => {
    const filtered = assets
      .filter(a => filterName.trim() === '' || a.name.toLowerCase().includes(filterName.toLowerCase()))
      .filter(a => filterPrice === '' || parseFloat(a.current_price) <= parseFloat(filterPrice))
      .sort((a, b) => {
        const valA = sortBy === 'name' ? a.name.toLowerCase() : parseFloat(a.current_price);
        const valB = sortBy === 'name' ? b.name.toLowerCase() : parseFloat(b.current_price);
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

    return filtered;
  };

  const toggleSortOrder = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) return <p className="stat-loading">Cargando assets...</p>;
  if (error) return (
    <div className="stat-error">
      <p>{error}</p>
      <button onClick={fetchAssets}>Reintentar</button>
    </div>
  );
  if (assets.length === 0) return <p className="stat-empty">No hay assets disponibles.</p>;

  const displayedAssets = getFilteredAndSorted();

  return (
    <div className="stat-container">
      <h2 className="stat-title">Assets</h2>
      {auth.isAdmin && (
        <button
          className="stat-update-btn"
          onClick={actualizarPrecios}
          disabled={actualizando}
        >
          {actualizando ? 'Actualizando...' : 'Actualizar precios'}
        </button>
      )}
      <div className="stat-filters">
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filterName}
          onChange={e => setFilterName(e.target.value)}
          className="stat-input"
        />
        <input
          type="number"
          placeholder="Precio máximo..."
          value={filterPrice}
          onChange={e => setFilterPrice(e.target.value)}
          className="stat-input"
        />
      </div>
      {displayedAssets.length === 0 ? (
        <p className="stat-empty">No hay assets que coincidan con los filtros.</p>
      ) : (
        <table className="stat-table">
          <thead>
            <tr>
              <th onClick={() => toggleSortOrder('name')} className="stat-th-sortable">
                Nombre {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
              </th>
              <th onClick={() => toggleSortOrder('price')} className="stat-th-sortable">
                Precio {sortBy === 'price' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
              </th>
              <th>Evolución</th>
            </tr>
          </thead>
          <tbody>
            {displayedAssets.map(asset => (
              <tr key={asset.id}>
                <td>{asset.name}</td>
                <td>${asset.current_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                <td className={`trend trend-${asset.trend}`}>
                  {asset.trend === 'up' ? '▲' : asset.trend === 'down' ? '▼' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StatPage;