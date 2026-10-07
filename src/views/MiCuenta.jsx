import { useAdmin } from '../hook/useAdmin.js';
import { Box, Typography, Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Avatar, Divider } from '@mui/material';

const MiCuenta = () => {
    const { adminActivo, cerrarSesion } = useAdmin();

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
            <Grid container spacing={4}>
                
                {/* Panel Izquierdo: Contenido Principal (Mis Compras) */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'var(--text-main)' }}>
                        Mis Compras
                    </Typography>
                    {/* Contenedor vacío preparado para las futuras compras */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: '8px', border: '1px solid #eaeaea', bgcolor: '#fdfdfd', minHeight: '300px' }}>
                        <Typography sx={{ color: 'var(--text-muted)' }}>
                            Aún no has realizado ninguna compra.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Panel Derecho: Menú Lateral de la Cuenta */}
                <Grid item xs={12} md={4}>
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
                                {/* Marcamos "Mis compras" como la pestaña activa con un fondo sutil */}
                                <ListItemButton selected sx={{ '&.Mui-selected': { bgcolor: '#f4f8f1' } }}>
                                    <ListItemText primary="Mis compras" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }} />
                                </ListItemButton>
                            </ListItem>
                            
                            <ListItem disablePadding>
                                <ListItemButton>
                                    <ListItemText primary="Mis datos" primaryTypographyProps={{ fontSize: '0.95rem' }} />
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
                </Grid>

            </Grid>
        </Container>
    );
};

export default MiCuenta;