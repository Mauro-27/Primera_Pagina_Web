import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import adminService from '../service/adminService.js';

const Login = () => {
  const { guardarSesion } = useAdmin();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(''); 
  const [cargando, setCargando] = useState(false); // Estado para controlar la animación

  const validarUsuario = (user) => {
    if (/\d/.test(user)) {
      return 'El nombre de usuario no puede contener números.';
    }
    if (!/[A-Z]/.test(user)) {
      return 'El nombre de usuario debe contener al menos una mayúscula.';
    }
    return null;
  };

  const manejarIngreso = async (e) => {
    e.preventDefault();
    setError(''); 
    
    const errorValidacion = validarUsuario(usuario);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }
    
    if (usuario && contrasena) {
      setCargando(true); // Bloqueamos el botón y mostramos el loader
      
      try {
        const data = await adminService.login(usuario, contrasena);
        guardarSesion(data);
        navigate('/'); // Redirige al inicio tras loguearse
      } catch (err) {
        setError(err.message);
        setCargando(false); // Si hay error, detenemos el loader para que pueda volver a intentar
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Acceso de Administrador
        </Typography>
        
        <Box component="form" onSubmit={manejarIngreso} sx={{ mt: 1, width: '100%' }}>
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={cargando} // Deshabilita el input mientras carga
            autoFocus
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contraseña"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={cargando}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2, height: '48px' }}
            disabled={cargando} // Deshabilita el botón mientras carga
          >
            {/* Si está cargando muestra el círculo, si no, dice "Ingresar" */}
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tiene cuenta?{' '}
              <Link component={RouterLink} to="/registro" variant="body2" underline="hover">
                Regístrese
              </Link>
            </Typography>
          </Box>
          
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 