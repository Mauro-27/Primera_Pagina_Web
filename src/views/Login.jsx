import { useState } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hook/useAdmin.js';
import adminService from '../service/adminService.js';

const Login = () => {
  const { guardarSesion } = useAdmin();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(''); 

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
      try {
        const data = await adminService.login(usuario, contrasena);
        
        guardarSesion(data);
        navigate('/app');
      } catch (err) {
        setError(err.message);
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
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Ingresar
          </Button>
          
        </Box>
      </Box>
    </Container>
  );
};

export default Login;