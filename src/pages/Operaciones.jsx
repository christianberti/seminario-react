import React from 'react'
import api from '../utils/axiosConfig';
import { useState, useEffect} from 'react';
import '../assets/styles/Operaciones.css';

const Operaciones = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [tipo, setTipo] = useState('');
  const [assetId, setAssetId] = useState('');
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const cargarAssets = async () => {
      try {
        const response = await api.get('/transactions');
        const datos = response.data.data;
        const activos = datos.map(op => ({
          id: op.asset_id,
          name: op.asset_name
        }));
        const activosUnicos = Array.from(
          new Map(
            activos.map(asset => [
              asset.id,
              asset
            ])
          ).values()
        );
        setAssets(activosUnicos);
      } catch(error){
        console.error("Error cargando activos:", error);
      }
    };
    cargarAssets();
  }, []);

  useEffect(() => {
    const cargarOperaciones = async () => {
      try {
        const parametros = {};
        if(tipo) parametros.type = tipo;
        if(assetId) parametros.asset_id = assetId;
        const response = await api.get('/transactions', {
          params: parametros
        });
        setOperaciones(response.data.data);
      } catch(error){
        console.error("Error cargando operaciones:", error);
      }
    };
    cargarOperaciones();
  }, [tipo, assetId]);

  return (
    <div className='operaciones-container'>
      <h2 className='operaciones-title'>Operaciones</h2>
      <p className="operaciones-description">
        Consulta el historial de tus compras y ventas.
      </p>   
      
      <div className='operaciones-filtros-bar'>
        <div className='operaciones-filtros-group'>
          <div className='operaciones-field'>
            <label>Tipo de operación:</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todas las operaciones</option>
              <option value="buy">Compra</option>
              <option value="sell">Venta</option>
            </select>
          </div>
        
          <div className='operaciones-field'>
            <label>Activo:</label>
            <select value={assetId} onChange={(e)=>setAssetId(e.target.value)}>
              <option value="">Todos los activos</option>
              {assets.map(asset=>(
                <option key={asset.id} value={asset.id}> {asset.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button className='btn-limpiar' onClick={() => { setTipo(''); setAssetId(''); }}>
          Limpiar filtros
        </button>
      </div>

      {operaciones.length === 0 ? (
        <p className="operaciones-vacio">No hay operaciones registradas.</p>
      ) : (
        <table className='operaciones-table'>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Activo</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Monto Total</th>
            </tr>
          </thead>
          <tbody>
            {operaciones.map((op) => {
            const claseColor = op.transaction_type === "buy" ? "tipo-compra" : "tipo-venta";
            
            return (
              <tr key={`${op.asset_id}-${op.transaction_date}`}>
                <td>{new Date(op.transaction_date).toLocaleString()}</td>
                <td className={claseColor}>{op.transaction_type === "buy" ? "Compra" : "Venta"}</td>
                <td>{op.asset_name}</td>
                <td>{op.quantity}</td>
                <td className={claseColor}>${Number(op.price_per_unit).toFixed(2)}</td>
                <td className={claseColor}>${Number(op.total_amount).toFixed(2)}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Operaciones