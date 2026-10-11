import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, IconButton, Snackbar } from '@mui/material';
import { useState, useContext } from 'react';
import pinturasData from '../data/pinturas.json';
import { CarritoContext } from '../context/CarritoContext.jsx';

const DetallePintura = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cantidad, setCantidad] = useState(1);
    const [notificacion, setNotificacion] = useState(false);
    const [favorito, setFavorito] = useState(false);
    const { agregarAlCarrito } = useContext(CarritoContext);

    const obra = pinturasData.find(p => p.id === parseInt(id));

    if (!obra) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography>Obra no encontrada</Typography>
            </Container>
        );
    }

    // Campos opcionales: si tu JSON no los tiene, simplemente no se muestran
    // obra.categoria -> "Óleo", "Acuarela"...
    // obra.descripcion -> texto largo
    // obra.medidas -> ["Alto: 50 cm", "Ancho: 70 cm", "Técnica: óleo sobre lienzo"]
    const medidas = Array.isArray(obra.medidas) ? obra.medidas : [];

    const manejarCantidad = (operacion) => {
        if (operacion === 'restar' && cantidad > 1) setCantidad(cantidad - 1);
        if (operacion === 'sumar') setCantidad(cantidad + 1);
    };

    const manejarAgregar = () => {
        agregarAlCarrito(obra, cantidad);
        setNotificacion(true);
    };

    const manejarComprarAhora = () => {
        agregarAlCarrito(obra, cantidad);
        navigate('/carrito'); // Ajusta la ruta a la de tu carrito
    };

    return (
        <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 5 }, mb: 8 }}>
            {/* Volver */}
            <Button
                onClick={() => navigate(-1)}
                startIcon={<i className="fa-solid fa-arrow-left"></i>}
                sx={{ mb: 3, color: 'var(--text-muted)', textTransform: 'none', fontSize: '0.95rem' }}
            >
                Volver
            </Button>

            <Grid container spacing={{ xs: 4, md: 8 }}>
                {/* Imagen */}
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: '#ffffff',
                            border: '1px solid #eaeaea',
                            borderRadius: '16px',
                            p: { xs: 2, md: 4 },
                            boxSizing: 'border-box'
                        }}
                    >
                        <img
                            src={obra.imagen}
                            alt={obra.titulo}
                            style={{ width: '100%', maxHeight: '560px', objectFit: 'contain', display: 'block' }}
                        />
                    </Box>
                </Grid>

                {/* Información */}
                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {obra.categoria && (
                        <Typography
                            sx={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.95rem', mb: 1 }}
                        >
                            {obra.categoria}
                        </Typography>
                    )}

                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                        {obra.titulo}
                    </Typography>

                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                        {obra.precio}
                    </Typography>

                    {obra.descripcion && (
                        <Typography
                            sx={{ color: 'var(--text-muted)', lineHeight: 1.7, mb: 3, maxWidth: '60ch' }}
                        >
                            {obra.descripcion}
                        </Typography>
                    )}

                    {/* Medidas / detalles con check */}
                    {medidas.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 4 }}>
                            {medidas.map((medida) => (
                                <Box key={medida} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            bgcolor: 'var(--primary-color)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.65rem',
                                            flexShrink: 0
                                        }}
                                    >
                                        <i className="fa-solid fa-check"></i>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.95rem' }}>{medida}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Cantidad + Agregar al carrito */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #ccc',
                                borderRadius: '999px',
                                px: 0.5
                            }}
                        >
                            <IconButton
                                onClick={() => manejarCantidad('restar')}
                                size="small"
                                disabled={cantidad === 1}
                                aria-label="Restar una unidad"
                            >
                                <i className="fa-solid fa-minus" style={{ fontSize: '0.8rem' }}></i>
                            </IconButton>
                            <Typography sx={{ px: 2, fontWeight: 'bold', minWidth: 32, textAlign: 'center' }}>
                                {cantidad}
                            </Typography>
                            <IconButton
                                onClick={() => manejarCantidad('sumar')}
                                size="small"
                                aria-label="Sumar una unidad"
                            >
                                <i className="fa-solid fa-plus" style={{ fontSize: '0.8rem' }}></i>
                            </IconButton>
                        </Box>

                        <Button
                            variant="outlined"
                            size="large"
                            onClick={manejarAgregar}
                            startIcon={<i className="fa-solid fa-cart-shopping"></i>}
                            sx={{
                                flex: 1,
                                minWidth: 200,
                                py: 1.25,
                                borderRadius: '999px',
                                textTransform: 'none',
                                fontWeight: 600,
                                color: 'var(--primary-color)',
                                borderColor: 'var(--primary-color)',
                                '&:hover': { borderColor: 'var(--primary-color)', bgcolor: 'rgba(0,0,0,0.04)' }
                            }}
                        >
                            Agregar al carrito
                        </Button>
                    </Box>

                    {/* Comprar ahora + Favorito */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={() => setFavorito(!favorito)}
                            aria-label={favorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                            aria-pressed={favorito}
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: 'rgba(0,0,0,0.05)',
                                color: favorito ? '#d6336c' : 'var(--primary-color)'
                            }}
                        >
                            <i className={favorito ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                        </IconButton>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={manejarComprarAhora}
                            sx={{
                                flex: 1,
                                py: 1.5,
                                borderRadius: '999px',
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: 'var(--primary-color)',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: 'var(--primary-color)', filter: 'brightness(0.92)', boxShadow: 'none' }
                            }}
                        >
                            Comprar ahora
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Aviso tipo toast */}
            <Snackbar
                open={notificacion}
                autoHideDuration={3000}
                onClose={() => setNotificacion(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Box
                    sx={{
                        bgcolor: '#2f3136',
                        color: '#ffffff',
                        px: 4,
                        py: 1.5,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    <i className="fa-solid fa-circle-check" style={{ color: '#6cc14a', fontSize: '1.2rem' }}></i>
                    <Typography sx={{ fontSize: '0.95rem' }}>Agregado al carrito</Typography>
                </Box>
            </Snackbar>
        </Container>
    );
};

export default DetallePintura;