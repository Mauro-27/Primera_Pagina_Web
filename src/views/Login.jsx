import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import adminData from '../data/admin.json'; // Importamos tu base de datos simulada directamente

const Login = () => {
  const { guardarSesion } = useAdmin();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(''); 
  const [cargando, setCargando] = useState(false);

  const manejarIngreso = (e) => {
    e.preventDefault();
    setError(''); 
    
    if (usuario && contrasena) {
      setCargando(true); 
      
      // Simulamos 1 segundo de carga para el efecto visual, pero garantizamos que termine
      setTimeout(() => {
        try {
          // Buscamos si existe exactamente esa combinación en tu admin.json
          const usuarioValido = adminData.usuarios.find(
            (u) => u.usuario === usuario && u.contrasena === contrasena
          );

          if (usuarioValido) {
            guardarSesion(usuarioValido);
            navigate('/'); // Redirige al inicio (Galería)
          } else {
            // Si no coincide, frenamos la carga y mostramos el error
            setError('El usuario o la contraseña no coinciden. Intente nuevamente.');
            setCargando(false);
          }
        } catch (err) {
          setError('Hubo un error interno al verificar los datos.');
          setCargando(false);
        }
      }, 1000);
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
            disabled={cargando}
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
            <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </Typography>
          )}

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2, height: '48px' }}
            disabled={cargando}
          >
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