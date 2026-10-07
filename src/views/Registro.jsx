import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link, CircularProgress } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Registro = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(''); 
  const [cargando, setCargando] = useState(false);

  // --- VALIDACIONES EN TIEMPO REAL ---
  // Usuario: entre 1 y 15 caracteres (permite letras y números)
  const reqUsuario = usuario.length > 0 && usuario.length <= 15;
  
  // Correo: Formato válido
  const reqEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Contraseña: Las 3 reglas obligatorias + mínimo de 6 caracteres por seguridad
  const reqPassMayus = /[A-Z]/.test(contrasena);
  const reqPassNum = /\d/.test(contrasena);
  const reqPassEsp = /[!@#$%^&*(),.?":{}|<>]/.test(contrasena);
  const reqPassLen = contrasena.length >= 6;

  // Si todas las reglas son verdaderas, el formulario es válido
  const formularioValido = reqUsuario && reqEmail && reqPassMayus && reqPassNum && reqPassEsp && reqPassLen;

  const manejarRegistro = (e) => {
    e.preventDefault();
    setError(''); 
    
    // Evita el envío si falta algún requisito
    if (!formularioValido) {
      setError('Por favor, cumple con todos los requisitos marcados con la cruz roja.');
      return;
    }

    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      alert('¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta nueva.');
      navigate('/login'); 
    }, 1500);
  };

  // --- COMPONENTE VISUAL PARA LOS REQUISITOS ---
  const Requisito = ({ cumple, texto }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 1 }}>
      <i 
        className={`fa-solid ${cumple ? 'fa-check' : 'fa-xmark'}`} 
        style={{ color: cumple ? '#4caf50' : '#d32f2f', fontSize: '0.9rem' }}
      ></i>
      <Typography variant="caption" sx={{ color: cumple ? '#4caf50' : '#d32f2f', fontSize: '0.85rem' }}>
        {texto}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Crear una cuenta
        </Typography>
        
        <Box component="form" onSubmit={manejarRegistro} sx={{ mt: 1, width: '100%' }}>
          
          {/* CAMPO USUARIO */}
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
          <Box sx={{ mb: 2 }}>
            <Requisito cumple={reqUsuario} texto="Máximo 15 caracteres" />
          </Box>

          {/* CAMPO CORREO */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cargando}
          />
          <Box sx={{ mb: 2 }}>
            <Requisito cumple={reqEmail} texto="Formato de correo válido" />
          </Box>
          
          {/* CAMPO CONTRASEÑA */}
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
          <Box sx={{ mb: 2 }}>
            <Requisito cumple={reqPassMayus} texto="Mínimo 1 letra mayúscula" />
            <Requisito cumple={reqPassNum} texto="Mínimo 1 número" />
            <Requisito cumple={reqPassEsp} texto="Mínimo 1 carácter especial" />
            <Requisito cumple={reqPassLen} texto="Mínimo 6 caracteres en total" />
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </Typography>
          )}

          {/* BOTÓN DE REGISTRO */}
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2, height: '48px' }}
            disabled={cargando || !formularioValido} // Se bloquea automáticamente si faltan requisitos
          >
            {cargando ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Ya tiene cuenta?{' '}
              <Link component={RouterLink} to="/login" variant="body2" underline="hover">
                Ingresar
              </Link>
            </Typography>
          </Box>
          
        </Box>
      </Box>
    </Container>
  );
};

export default Registro;