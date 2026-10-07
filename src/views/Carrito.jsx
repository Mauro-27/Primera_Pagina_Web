import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext.jsx';
import { Box, Typography, Container, IconButton, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Carrito = () => {
    const { carrito, eliminarDelCarrito } = useContext(CarritoContext);

    return (
        <Container maxWidth="lg" sx={{ mt: 5, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            
            <Typography variant="h4" sx={{ color: 'var(--primary-color)', mb: 4, fontWeight: 'bold', fontStyle: 'italic' }}>
                Mi Carrito
            </Typography>

            <Box sx={{ width: '100%', maxWidth: '850px' }}>
                {carrito.length === 0 ? (
                    <Box>
                        <Typography sx={{ color: 'var(--text-muted)', fontSize: '1.2rem', mb: 3 }}>
                            Tu carrito está vacío.
                        </Typography>
                        <Button component={Link} to="/" variant="contained" sx={{ bgcolor: 'var(--primary-color)' }}>
                            Volver a la galería
                        </Button>
                    </Box>
                ) : (
                    carrito.map((item) => (
                        <Paper 
                            elevation={2}
                            key={item.id} 
                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, mb: 3, borderRadius: '12px', bgcolor: 'var(--bg-card)' }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <img src={item.imagen} alt={item.titulo} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                <Box>
                                    <Typography variant="h6" sx={{ color: 'var(--text-main)', fontWeight: 600 }}>
                                        {item.titulo}
                                    </Typography>
                                    <Typography sx={{ color: 'var(--secondary-color)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        {item.precio} x {item.cantidad} unidad(es)
                                    </Typography>
                                </Box>
                            </Box>

                            <IconButton onClick={() => eliminarDelCarrito(item.id)} title="Eliminar" sx={{ color: 'var(--text-muted)', '&:hover': { color: 'var(--secondary-color)' } }}>
                                <i className="fa-solid fa-trash-can"></i>
                            </IconButton>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default Carrito;