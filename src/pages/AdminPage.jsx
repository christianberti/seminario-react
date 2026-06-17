import { useState, useEffect, useContext } from 'react';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import '../assets/styles/AdminPage.css';
import { useNavigate } from 'react-router-dom';
import { Navigate } from 'react-router-dom';


const AdminPage = () => {
  
  const { auth } = useContext(AuthContext);

if (!auth?.isAdmin) {
  return <Navigate to="/" />;
}

const navigate = useNavigate();
const [users, setUsers] = useState([]);
const [search, setSearch] = useState('');
const [orden, setOrden] = useState('desc'); 
const [paginaActual, setPaginaActual] = useState(1);
const usuariosPorPagina = 5;


useEffect(() => {
  const fetchUsers = async () => {
  try {
    const response = await api.get('/users');

    const filtrarAdmin = response.data.data.filter(
      user => !user.is_Admin
    );

    setUsers(filtrarAdmin);

  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  }
  };

  fetchUsers();
}, []);

const filteredUsers = users.filter(user =>
  user.name.toLowerCase().includes(search.toLowerCase())
).sort((a, b) => orden === 'desc' ? b.total_wealth - a.total_wealth : a.total_wealth - b.total_wealth);

const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
const usuariosPaginados = filteredUsers.slice(indiceInicio, indiceInicio + usuariosPorPagina);

return (
  <main className="admin-container">
    <h2>Panel de Administración</h2>
    <input
      type="text"
      placeholder="Buscar usuario..."
      value={search}
      onChange={(e) => {setSearch(e.target.value); setPaginaActual(1);}}
    />
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Valor Portfolio</th>
          <th>Editar</th>
          <th><button onClick={() => setOrden(orden === 'desc' ? 'asc' : 'desc')}>
            {orden === 'desc' ? '▲' : '▼'}
          </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {usuariosPaginados.map((user, index) => (
          <tr key={user.id} className={user.id === filteredUsers[0]?.id && search === '' ? 'Mejor-Portfolio' : ''}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>${user.total_wealth.toFixed(2)}</td>
            <td>
              <button onClick={() => navigate(`/editarpage/${user.id}`)}>Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {Math.ceil(filteredUsers.length / usuariosPorPagina) > 1 && (
  <>
    {paginaActual > 1 && (
  <button onClick={() => setPaginaActual(p => p - 1)}>Anterior</button>
  )}
  )
    <span>{paginaActual} de {Math.ceil(filteredUsers.length / usuariosPorPagina)}</span>
    {paginaActual < Math.ceil(filteredUsers.length / usuariosPorPagina) && (
      <button onClick={() => setPaginaActual(p => p + 1)}>Siguiente</button>
    )}
  </>
  )}
    <hr></hr>
    <p>Cantidad de usuarios: {filteredUsers.length}</p>
    
  </main>
);
};
export default AdminPage;