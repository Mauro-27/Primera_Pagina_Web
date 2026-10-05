import { useState } from 'react';
import '../css/pintura.css'; 

const Pintura = ({ imagen, titulo, textoImagen, precio }) => {
    const [vendido, setVendido] = useState(false);

    return (
        <div className="art-card">
            <div className="art-image">
                {/* Cambiamos 'images' por 'imagen' */}
                {imagen ? (
                    <img src={imagen} alt={titulo} />
                ) : (
                    <span>{textoImagen}</span>
                )}
            </div>
        
            <div className="art-info">
                <h3>{titulo}</h3>
                <p className="price">{precio}</p>
                <p><b>Estado: </b>{ vendido ? "Vendido" : "A la Venta" }</p>
                {
                    !vendido && <button className="btn-buy">Comprar</button>
                }
            </div>
        </div>
    );
};

export default Pintura;