import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          ¡Ups! Página Inexistente
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          La ruta a la que intentas acceder no existe. Por favor, verifica la dirección URL o regresa al inicio.
        </Typography>

        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/')}
        >
          Volver al Inicio
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;