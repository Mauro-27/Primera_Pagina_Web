import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Paper, IconButton, Snackbar } from '@mui/material';
import { useState, useContext } from 'react';
import pinturasData from '../data/pinturas.json';
import { CarritoContext } from '../context/CarritoContext.jsx';

const DetallePintura = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cantidad, setCantidad] = useState(1);
    const [notificacion, setNotificacion] = useState(false); // Estado para el aviso
    const { agregarAlCarrito } = useContext(CarritoContext);

    const obra = pinturasData.find(p => p.id === parseInt(id));

    if (!obra) return <Container sx={{ mt: 5 }}><Typography>Obra no encontrada</Typography></Container>;

    const manejarCantidad = (operacion) => {
        if (operacion === 'restar' && cantidad > 1) setCantidad(cantidad - 1);
        if (operacion === 'sumar') setCantidad(cantidad + 1);
    };

    const manejarAgregar = () => {
        agregarAlCarrito(obra, cantidad);
        setNotificacion(true); // Dispara el aviso oscuro
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '12px', border: '1px solid #eaeaea' }}>
                <Grid container spacing={6}>
                    
                    {/* ... (Todo tu código del lado izquierdo de la imagen queda igual) ... */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <img src={obra.imagen} alt={obra.titulo} style={{ width: '100%', maxWidth: '500px', objectFit: 'contain' }}/>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>{obra.titulo}</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>{obra.precio}</Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, pb: 4, borderBottom: '1px solid #eaeaea' }}>
                            <Typography sx={{ color: 'var(--text-muted)' }}>Cantidad</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <IconButton onClick={() => manejarCantidad('restar')} size="small"><i className="fa-solid fa-minus"></i></IconButton>
                                <Typography sx={{ px: 2, fontWeight: 'bold' }}>{cantidad}</Typography>
                                <IconButton onClick={() => manejarCantidad('sumar')} size="small"><i className="fa-solid fa-plus"></i></IconButton>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button variant="contained" size="large" sx={{ bgcolor: 'var(--primary-color)', flex: 1, py: 1.5 }}>
                                Comprar ahora
                            </Button>
                            
                            {/* Botón de añadir al carrito conectado */}
                            <Button variant="outlined" size="large" onClick={manejarAgregar} sx={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)', flex: 1, py: 1.5 }}>
                                Añadir al carrito
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* NOTIFICACIÓN ESTILO OSCURO (TIPO TOAST) */}
            <Snackbar
                open={notificacion}
                autoHideDuration={3000}
                onClose={() => setNotificacion(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Box sx={{ 
                    bgcolor: '#2f3136', 
                    color: '#ffffff', 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: '4px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#6cc14a', fontSize: '1.2rem' }}></i>
                    <Typography sx={{ fontSize: '0.95rem' }}>Agregado al carrito</Typography>
                </Box>
            </Snackbar>

        </Container>
    );
};

export default DetallePintura;