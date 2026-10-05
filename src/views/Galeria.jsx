import Pintura from './Pintura.jsx';
import pinturasData from '../data/pinturas.json';
import { Box } from '@mui/material';

const Galeria = () => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 4, 
            justifyContent: 'center',
            padding: 2
        }}>
            {pinturasData.map((obra) => (
                <Pintura 
                    key={obra.id} 
                    titulo={obra.titulo}
                    precio={obra.precio}
                    imagen={obra.imagen}
                    textoImagen={obra.textoImagen || "Sin imagen"}
                />
            ))}
        </Box>
    );
};

export default Galeria;