import { useEffect, useState } from 'react';
import api from '../../utils/axiosConfig';
import '../../assets/styles/Panel.css';

const PanelPage = () => {
  const [assets, setAssets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarAssets = async () => {
      try {
        const response = await api.get('/assets');
        setAssets(response.data.data);
      } catch (error) {
        setMensaje(error.response?.data?.message || 'Error al cargar los assets');
      } finally {
        setCargando(false);
      }
    };

    cargarAssets();
  }, []);

  if (cargando) {
    return <p className="panel-loading">Cargando assets...</p>;
  }

  return (
    <main className="panel-container">
      <h2>Panel</h2>

      {mensaje && <p className="panel-error">{mensaje}</p>}

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