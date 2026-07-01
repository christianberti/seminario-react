import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { REFRESH_INTERVAL } from '../utils/constants';
import api from '../utils/axiosConfig';
import '../assets/styles/NavbarComponent.css';

const NavBarComponent = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [portfolioValue, setPortfolioValue] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (auth.token && auth.userId) {
    const fetchPortfolio = () => {
      api.get(`/users/${auth.userId}`)
        .then((response) => {
          setPortfolioValue(response.data.data.portfolio_value || 0);
        })
        .catch(() => setPortfolioValue(null));
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, REFRESH_INTERVAL);
    window.addEventListener('portfolio-updated', fetchPortfolio);

    return () => {
      clearInterval(interval);
      window.removeEventListener('portfolio-updated', fetchPortfolio);
    };
  }
}, [auth.token, auth.userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      {!auth.token ? (
        <>
          <Link to="/registro">Registro</Link>
          <Link to="/login">Login</Link>
        </>
      ) : (
        <>
          <span className="nav-greeting">Hola {auth.name}</span>
          {loading && <span className="nav-loading">Cargando portfolio...</span>}
          {portfolioValue !== null && (
            <span className="nav-portfolio">
              Portfolio: ${portfolioValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          )}
          <Link to="/portfolio">Mi portfolio</Link>
          <Link to="/operaciones">Mis operaciones</Link>
          <Link to="/panel">Ver Panel</Link>
          <Link to="/editarPage">Editar usuario</Link>
          {auth.isAdmin && <Link to="/admin">Manejo usuarios</Link>}
          <button className="nav-logout-btn" onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default NavBarComponent;