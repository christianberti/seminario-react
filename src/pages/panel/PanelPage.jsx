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

  return (
    <main className="panel-container">
    <h2>Panel</h2>

    {mensaje && <p className="panel-error">{mensaje}</p>}
    <p>Dinero disponible: ${Number(dineroDisponible).toFixed(2)}</p>
      <section className="panel-list">
        {assets.map((asset) => (
          <article className="panel-card" key={asset.id}>
            <h3>{asset.name}</h3>
            <p>Precio actual: ${Number(asset.current_price).toFixed(2)}</p>
          </article>
        ))}
      </section>
    </main>
  );
};

export default PanelPage;