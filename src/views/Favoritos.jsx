import { useContext } from 'react';
import { FavoritosContext } from '../context/FavoritosContext.jsx';
import { Box, Typography, Container, IconButton, Paper } from '@mui/material';

const Favoritos = () => {
    const { favoritos, toggleFavorito } = useContext(FavoritosContext);

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 10, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="h3" sx={{ 
                color: 'var(--primary-color)', 
                mb: 6, 
                fontWeight: 'bold', 
                fontStyle: 'italic' 
            }}>
                Mis Favoritos
            </Typography>

            {/* Contenedor ampliado para dar más espacio a las tarjetas grandes */}
            <Box sx={{ width: '100%', maxWidth: '950px' }}>
                {favoritos.length === 0 ? (
                    <Typography sx={{ color: 'var(--text-muted)', fontSize: '1.4rem', mt: 4 }}>
                        Aún no tienes pinturas guardadas en favoritos.
                    </Typography>
                ) : (
                    favoritos.map((obra) => (
                        <Paper 
                            elevation={3}
                            key={obra.id} 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 4, // Padding aumentado para hacer la tarjeta más voluminosa
                                mb: 4, // Mayor margen entre tarjetas
                                borderRadius: '16px',
                                bgcolor: 'var(--bg-card)', 
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateX(6px)',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)' // Sombra más notoria al pasar el mouse
                                }
                            }}
                        >
                            {/* Lado izquierdo: Imagen + Información */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}> {/* Gap incrementado a 4 */}
                                <img 
                                    src={obra.imagen || 'https://via.placeholder.com/160'} 
                                    alt={obra.titulo} 
                                    style={{ 
                                        width: '160px', // Imagen escalada de 100px a 160px
                                        height: '160px', 
                                        objectFit: 'cover', 
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                    }}
                                />
                                <Box>
                                    <Typography variant="h4" sx={{ color: 'var(--text-main)', fontWeight: 600, mb: 1.5 }}>
                                        {obra.titulo}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--secondary-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {obra.precio}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Lado derecho: Botón para eliminar */}
                            <IconButton 
                                onClick={() => toggleFavorito(obra)} 
                                title="Eliminar de favoritos"
                                size="large" // Botón escalado a tamaño grande
                                sx={{ 
                                    color: 'var(--text-muted)', 
                                    p: 2, // Padding interno extra para el botón
                                    '&:hover': { color: 'var(--secondary-color)', bgcolor: 'rgba(201, 75, 75, 0.08)' } 
                                }}
                            >
                                {/* Ícono más grande mediante fontSize */}
                                <i className="fa-solid fa-trash-can" style={{ fontSize: '1.6rem' }}></i>
                            </IconButton>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default Favoritos;