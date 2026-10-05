import { createBrowserRouter } from 'react-router-dom';
import Login from '../views/Login.jsx';
import App from '../App.jsx';
import RutasProtegidas from '../components/RutasProtegidas.jsx';
import ErrorPage from '../views/ErrorPage.jsx';
import Galeria from '../views/Galeria.jsx';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Login />
  },
  
  {
    element: <RutasProtegidas />, 
    children: [
      {
        path: '/app',
        element: <App />, 
        children: [
          {
            path: '',
            element: <Galeria />
          },
        ]
      }
    ]
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);