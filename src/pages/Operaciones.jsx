import React from 'react'
import api from '../utils/axiosConfig';
import { useState, useEffect, useContext } from 'react';


const Operaciones = () => {
  const [operaciones, setOperaciones] = useState([]);
  const [tipo, setTipo] = useState('');
  const [assetId, setAssetId] = useState('');

  useEffect(() => {
    const fetchOperaciones = async () => {
      try {
        const parametros = {};
        if (tipo) parametros.type = tipo;
        if (assetId) parametros.asset_id = assetId;
        const response = await api.get('/transactions', { params: parametros });
        setOperaciones(response.data.data);
      } catch (err) {
        console.error('Error al cargar operaciones:', err);
      }
    };
    
    fetchOperaciones();
  }, [tipo, assetId]);

  return (
    <div>
      <h2>Operaciones</h2>
      <p>Aquí se mostrarán las operaciones realizadas por el usuario.</p>
        <div>
          <label>Tipo de operación:</label>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="buy">Compra</option>
            <option value="sell">Venta</option>
          </select>
        </div>
        
         {operaciones.length === 0 ? (
        <p>No hay operaciones registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Activo</th>
              <th>Cantidad</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {operaciones.map((op, index) => (
              <tr key={index}>
                <td>{new Date(op.transaction_date).toLocaleDateString()}</td>
                <td>{op.transaction_type}</td>
                <td>{op.asset_name}</td>
                <td>{op.quantity}</td>
                <td>${Number(op.total_amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  )
}

export default Operaciones