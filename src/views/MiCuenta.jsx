import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import { Box, Typography, Container, Paper, List, ListItem, ListItemButton, ListItemText, Avatar, Divider } from '@mui/material';
import MisDatos from './MisDatos.jsx';
import '../css/micuenta.css';

// Fondo suave para la opción del menú que está abierta
const estiloSeleccionado = { '&.Mui-selected': { bgcolor: '#f4f8f1' } };

const MiCuenta = () => {
    const { adminActivo, cerrarSesion } = useAdmin();

    // La sección abierta vive en la dirección: /mi-cuenta?seccion=datos
    // Así se mantiene al recargar y se puede enlazar directo.
    const [searchParams, setSearchParams] = useSearchParams();
    const seccion = searchParams.get('seccion') === 'datos' ? 'datos' : 'compras';

    const manejarCierreSesion = () => {
        cerrarSesion();
        window.location.href = '/'; // Recarga la página y vuelve al inicio
    };

    // Medida de seguridad: Si alguien entra a la ruta sin loguearse, le pedimos que ingrese
    if (!adminActivo) {
        return (
            <Container sx={{ mt: 10, textAlign: 'center', minHeight: '50vh' }}>
                <Typography variant="h5">Debes iniciar sesión para ver tu cuenta.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 8, minHeight: '60vh' }}>
            {/* Grilla CSS (en micuenta.css): contenido a la izquierda, menú a la derecha */}
            <div className="micuenta-layout">

                {/* Panel Izquierdo: Contenido Principal */}
                <div className="micuenta-contenido">
                    {seccion === 'compras' && (
                        <>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--text-main)' }}>
                                Mis Compras
                            </Typography>
                            {/* Contenedor vacío preparado para las futuras compras */}
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #eaeaea', bgcolor: '#fdfdfd', minHeight: '300px' }}>
                                <Typography sx={{ color: 'var(--text-muted)' }}>
                                    Aún no has realizado ninguna compra.
                                </Typography>
                            </Paper>
                        </>
                    )}

                    {seccion === 'datos' && <MisDatos />}
                </div>

                {/* Panel Derecho: Menú Lateral de la Cuenta */}
                <div className="micuenta-menu">
                    <Paper elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>

                        {/* Línea verde superior */}
                        <Box sx={{ height: '5px', bgcolor: '#8bc34a' }} />

                        {/* Encabezado con foto, nombre y correo */}
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Mi cuenta
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'var(--primary-color)', width: 56, height: 56 }}>
                                    <i className="fa-solid fa-user"></i>
                                </Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1.2 }}>
                                        {adminActivo.nombre || adminActivo.usuario}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {adminActivo.email || 'correo@ejemplo.com'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Divider />

                        {/* Lista de enlaces */}
                        <List disablePadding>
                            <ListItem disablePadding>
                                <ListItemButton
                                    selected={seccion === 'compras'}
                                    onClick={() => setSearchParams({})}
                                    sx={estiloSeleccionado}
                                >
                                    <ListItemText
                                        primary="Mis compras"
                                        primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: seccion === 'compras' ? 600 : 400 }}
                                    />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton
                                    selected={seccion === 'datos'}
                                    onClick={() => setSearchParams({ seccion: 'datos' })}
                                    sx={estiloSeleccionado}
                                >
                                    <ListItemText
                                        primary="Mis datos"
                                        primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: seccion === 'datos' ? 600 : 400 }}
                                    />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemText primary="Ayuda" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                                </ListItemButton>
                            </ListItem>

                            <ListItem disablePadding>
                                <ListItemButton onClick={manejarCierreSesion}>
                                    <ListItemText primary="Salir" primaryTypographyProps={{ fontSize: '0.95rem' }} />
                                </ListItemButton>
                            </ListItem>
                        </List>

                    </Paper>
                </div>

            </div>
        </Container>
    );
};

export default MiCuenta;