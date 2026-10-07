import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme.js';
import { routes } from './router/routes.jsx'; 
import { ProveedorAdmin } from './context/AdminContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { FavoritosProvider } from './context/FavoritosContext.jsx'; // <-- IMPORTA ESTO
import './css/global.css'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <ProveedorAdmin>
        <FavoritosProvider> {/* <-- ENVUELVE LA APP AQUÍ */}
          <CarritoProvider>
            <RouterProvider router={routes} />
          </CarritoProvider>
        </FavoritosProvider>
      </ProveedorAdmin>
    </ThemeProvider>
  </StrictMode>,
);