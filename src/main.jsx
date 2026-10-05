import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import { routes } from './router/routes.jsx'; 
import { ProveedorAdmin } from './context/AdminContext.jsx';

import './css/app.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
    <ProveedorAdmin>
      <RouterProvider router={routes} />
    </ProveedorAdmin>
  </StrictMode>,
); 