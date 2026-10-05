import '../css/footer.css';

const Footer = () =>{
    return(
        <footer>
        <div className="footer-container">

            <div className="footer-logo-section">
                <h3>Disfrut-Arte</h3>
                <div className="social-icons">
                    <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                    <a href="#"><i className="fa-brands fa-tiktok"></i></a>
                </div>
            </div>

   
            <div className="footer-contacto">
                <h2>CONTACTO</h2>
                
                <div className="contacto-item">
                    <div className="contacto-icon"><i className="fa-brands fa-whatsapp"></i></div>
                    <div className="contacto-info">
                        <span>WHATSAPP</span>
                        <p>+54 388 4556115</p>
                    </div>
                </div>

                <div className="contacto-item">
                    <div className="contacto-icon"><i className="fa-regular fa-envelope"></i></div>
                    <div className="contacto-info">
                        <span>EMAIL</span>
                        <p>contacto@disfrutarte.com</p>
                    </div>
                </div>

                <div className="contacto-item">
                    <div className="contacto-icon"><i className="fa-solid fa-house"></i></div>
                    <div className="contacto-info">
                        <span className="horario">LUN – VIE  09:00 – 18:00</span>
                    </div>
                </div>
            </div>

     
            <div className="footer-soporte">
                <h2>SOPORTE</h2>
                <ul>
                    <li><a href="#">Garantía</a></li>
                    <li><a href="#">Preguntas frecuentes</a></li>
                </ul>
            </div>
        </div>
        
        <div className="footer-bottom">
            <p>&copy; 2024 Disfrut-Arte. Todos los derechos reservados.</p>
        </div>
    </footer>
    )
}

export default Footer;