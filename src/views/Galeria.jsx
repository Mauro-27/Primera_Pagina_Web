import Pintura from './Pintura.jsx';
import pinturasData from '../data/pinturas.json';
import { Box } from '@mui/material';

const Galeria = () => {
    return (
        <Box
            component="section"
            sx={{
                display: 'grid',
                // 2 columnas en celular, y se agregan más solas según el ancho disponible
                gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(auto-fill, minmax(220px, 1fr))'
                },
                gap: { xs: 2, md: 3 },
                maxWidth: '1200px',
                mx: 'auto',
                px: { xs: 2, md: 3 },
                py: 4
            }}
        >
            {pinturasData.map((obra) => (
                <Pintura
                    key={obra.id}
                    id={obra.id}
                    titulo={obra.titulo}
                    precio={obra.precio}
                    imagen={obra.imagen}
                    textoImagen={obra.textoImagen || 'Sin imagen'}
                />
            ))}
        </Box>
    );
};

export default Galeria;