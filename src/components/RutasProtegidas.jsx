import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js'; 

const RutasProtegidas = () => {
  const { adminActivo } = useAdmin();

  // Si no hay sesión, patea al usuario al login
  if (!adminActivo) {
    return <Navigate to="/" replace />;
  }

  // Si hay sesión, renderiza las rutas hijas (como App.jsx y Pintura.jsx)
  return <Outlet />;
};

export default RutasProtegidas;

