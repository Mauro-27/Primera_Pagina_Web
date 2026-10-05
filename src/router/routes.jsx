import { createBrowserRouter } from 'react-router-dom';
import Login from '../views/Login.jsx';
import App from '../App.jsx';
import RutasProtegidas from '../components/RutasProtegidas.jsx';
import ErrorPage from '../views/ErrorPage.jsx';
import Galeria from '../views/Galeria.jsx';
import Favoritos from '../views/Favoritos.jsx';

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
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    element: <RutasProtegidas />, 
    children: [
      // Este bloque queda limpio. A futuro podés poner acá rutas que 
      // requieran estar logueado obligatoriamente.
    ]
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);