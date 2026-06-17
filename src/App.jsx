
import { Routes, Route, Link } from 'react-router-dom';
import './assets/styles/App.css';

//Paginas
import Registro from './pages/Registro';
import Login from './pages/Login';
import Portfolio from './pages/Portfolio';
import Panel from './pages/Panel';
import Operaciones from './pages/Operaciones';
import EditarPage from './pages/EditarPage';
import AdminPage from './pages/AdminPage';

//Componentes
import HeaderComponent from './components/HeaderComponent';
import FooterComponent from './components/FooterComponent';
import NavbarComponent from './components/NavbarComponent';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import StatPage from './pages/StatPage';

const App = () => {
  return (
    <div className='app-container'>
      <div className='header-navbar'>
        <HeaderComponent />
        <NavbarComponent />
      </div>
      <Routes>
        <Route path="/" element={<StatPage />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas (requieren login) */}
        <Route path="/portfolio" element={
          <PrivateRoute>
            <Portfolio />
          </PrivateRoute>
        } />
        <Route path="/panel" element={
          <PrivateRoute>
            <Panel />
          </PrivateRoute>
        } />
        <Route path="/operaciones" element={
          <PrivateRoute>
            <Operaciones />
          </PrivateRoute>
        } />
        <Route path="/editarpage" element={
          <PrivateRoute>
            <EditarPage />
          </PrivateRoute>
        } />

        <Route path="/editarpage/:userId" element={
        <PrivateRoute>
          <AdminRoute>
            <EditarPage />
          </AdminRoute>
        </PrivateRoute>
        } />

        {/* Ruta Admin */}
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          </PrivateRoute>

        } />
      </Routes>
      <FooterComponent />
    </div>
  )
}

export default App