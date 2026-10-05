import { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext(null);

export const ProveedorAdmin = ({ children }) => {
    const [adminActivo, setAdminActivo] = useState(() => {
        const adminGuardado = localStorage.getItem('admin_sesion');
        return adminGuardado ? JSON.parse(adminGuardado) : null;
    });

    useEffect(() => {
        if (adminActivo) {
            localStorage.setItem('admin_sesion', JSON.stringify(adminActivo));
        } else {
            localStorage.removeItem('admin_sesion');
        }
    }, [adminActivo]); 

    const guardarSesion = (admin) => {
        setAdminActivo(admin); 
    };

    const cerrarSesion = () => {
        setAdminActivo(null); 
    };

    return (
        <AdminContext.Provider value={{ adminActivo, guardarSesion, cerrarSesion }}>
            {children}
        </AdminContext.Provider>
    );
};