import { createBrowserRouter } from 'react-router-dom';
import Login from '../views/Login.jsx';
import Registro from '../views/Registro.jsx';
import App from '../App.jsx';
import RutasProtegidas from '../components/RutasProtegidas.jsx';
import ErrorPage from '../views/ErrorPage.jsx';
import Galeria from '../views/Galeria.jsx';
import Favoritos from '../views/Favoritos.jsx';
import Carrito from '../views/Carrito.jsx';
import DetallePintura from '../views/DetallePintura.jsx'; // <-- IMPORTAMOS LA VISTA
import MiCuenta from '../views/MiCuenta.jsx';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      {
        path: '',
        element: <Galeria />
      },
      {
        path: '/favoritos',
        element: <Favoritos />
      },
      {
        path: '/carrito',
        element: <Carrito />
      },
      {
        path: '/pintura/:id', // <-- NUEVA RUTA DINÁMICA
        element: <DetallePintura />
      },
      {
        path: '/mi-cuenta', // <-- 2. AGREGA ESTA RUTA
        element: <MiCuenta />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/registro', // <-- 2. AGREGA LA RUTA DE REGISTRO
    element: <Registro />
  },
  {
    element: <RutasProtegidas />, 
    children: []
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);