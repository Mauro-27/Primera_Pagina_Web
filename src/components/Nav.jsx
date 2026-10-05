import { Link } from 'react-router-dom';
import '../css/nav.css';

const Nav = () => {
    return (
        <nav className="main-nav">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/app">
                        <h2>Disfrut-Arte</h2>
                    </Link>
                </div>

                <ul className="nav-links">
                    <li><Link to="/app">Inicio</Link></li>
                </ul>

                <div className="nav-icons">
                    <Link to="/" className="user-link">
                        <i className="fa-solid fa-user"></i> <span>Ingresar</span>
                    </Link>
                    <Link to="#" className="fav-link">
                        <i className="fa-solid fa-heart"></i> <span>Favoritos</span>
                    </Link>
                    <Link to="#" className="fav-link">
                        <i className="fa-solid fa-cart-arrow-down"></i> <span>Carrito</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Nav;