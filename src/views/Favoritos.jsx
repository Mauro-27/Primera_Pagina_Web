import { useContext } from 'react';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import { Box, Typography, Container, IconButton, Paper } from '@mui/material';

const Favoritos = () => {
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);

    return (
        
        <Container maxWidth="lg" sx={{ mt: 5, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
         {/* Cambiamos a maxWidth="lg" y alineamos todo al inicio (izquierda) */}    
            <Typography variant="h4" sx={{ 
                color: 'var(--primary-color)', 
                mb: 4, 
                fontWeight: 'bold', 
                fontStyle: 'italic' 
            }}>
                Mis Favoritos
            </Typography>

            {/* Contenedor de la lista anclado a la izquierda con un ancho máximo */}
            <Box sx={{ width: '100%', maxWidth: '850px' }}>
                {favoritos.length === 0 ? (
                    <Typography sx={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                        Aún no tienes pinturas guardadas en favoritos.
                    </Typography>
                ) : (
                    favoritos.map((obra) => (
                        <Paper 
                            elevation={2}
                            key={obra.id} 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 2.5,
                                mb: 3,
                                borderRadius: '12px',
                                bgcolor: 'var(--bg-card)', /* Usa el fondo blanco de tus tarjetas */
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateX(5px)' /* Pequeña animación al pasar el mouse */
                                }
                            }}
                        >
                            {/* Lado izquierdo: Imagen + Información */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <img 
                                    src={obra.imagen || 'https://via.placeholder.com/100'} 
                                    alt={obra.titulo} 
                                    style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Box>
                                    <Typography variant="h6" sx={{ color: 'var(--text-main)', fontWeight: 600 }}>
                                        {obra.titulo}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--secondary-color)', fontSize: '1.2rem', fontWeight: 'bold', mt: 1 }}>
                                        {obra.precio}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Lado derecho: Botón para eliminar */}
                            <IconButton 
                                onClick={() => toggleFavorito(obra)} 
                                title="Eliminar de favoritos"
                                sx={{ 
                                    color: 'var(--text-muted)', 
                                    '&:hover': { color: 'var(--secondary-color)', bgcolor: 'rgba(201, 75, 75, 0.08)' } 
                                }}
                            >
                                <i className="fa-solid fa-trash-can"></i>
                            </IconButton>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default Favoritos;