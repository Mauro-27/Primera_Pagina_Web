import { useContext } from 'react';
import { AdminContext } from '../context/AdminContext.jsx';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  
  // Ajustamos para que detecte el null inicial
  if (context === null) {
    throw new Error('useAdmin debe ser usado dentro de un ProveedorAdmin');
  }
  
  return context;
};