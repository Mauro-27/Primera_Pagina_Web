import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import '../css/nav.css';

const Nav = () => {
    const { adminActivo, cerrarSesion } = useAdmin(); // Traemos los datos de la sesión
    const navigate = useNavigate();
    const [menuAbierto, setMenuAbierto] = useState(false); // Controla si el menú está visible

const manejarCierreSesion = () => {
        cerrarSesion(); // Esto borra la sesión del Context y localStorage
        
        // window.location.href fuerza al navegador a recargar la página por completo 
        // y llevarte a la ruta raíz ('/').
        window.location.href = '/'; 
    };

    return (
        <nav className="main-nav">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/">
                        <h2>Disfrut-Arte</h2>
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><Link to="/">Inicio</Link></li>
                    <li><Link to="/">Pinturas</Link></li>
                </ul>

                <div className="nav-icons">
                    {/* Ícono de Favoritos */}
                    <Link to="/favoritos" className="fav-link">
                        <i className="fa-solid fa-heart"></i>
                    </Link>

                    {/* Lógica Condicional: Si hay admin, muestra el dropdown. Si no, muestra "Ingresar" */}
                    {adminActivo ? (
                        <div className="user-dropdown-container" onClick={() => setMenuAbierto(!menuAbierto)}>
                            <div className="user-menu-trigger">
                                <i className="fa-solid fa-user"></i>
                                <span>{adminActivo.nombre}</span>
                                <i className="fa-solid fa-caret-down"></i> {/* Flechita hacia abajo */}
                            </div>
                            
                            {/* Opciones del menú desplegable */}
                            {menuAbierto && (
                                <div className="user-dropdown-menu">
                                    <Link to="/mi-cuenta">Mi cuenta</Link>
                                    <button onClick={manejarCierreSesion}>Salir</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="user-link">
                            <i className="fa-solid fa-user"></i> <span>Ingresar</span>
                        </Link>
                    )}

                    {/* Ícono de Carrito */}
                    <Link to="#" className="fav-link">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Nav;