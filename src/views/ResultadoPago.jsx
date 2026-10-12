import { useContext, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Container, Typography } from '@mui/material';
import { CarritoContext } from '../context/CarritoContext';
import '../css/carrito.css';

const MENSAJES = {
  exito: {
    icono: 'fa-circle-check',
    color: '#2e9e4f',
    titulo: '¡Pago aprobado!',
    texto: 'Gracias por tu compra. Te contactaremos para coordinar la entrega de tu obra.',
  },
  pendiente: {
    icono: 'fa-clock',
    color: '#d99a00',
    titulo: 'Tu pago está pendiente',
    texto: 'Apenas Mercado Pago lo confirme, tu compra quedará registrada.',
  },
  fallo: {
    icono: 'fa-circle-xmark',
    color: '#c94b4b',
    titulo: 'No se pudo completar el pago',
    texto: 'No se realizó ningún cobro. Puedes volver al carrito e intentarlo de nuevo.',
  },
};

const ResultadoPago = () => {
  const { estado } = useParams(); // exito | pendiente | fallo
  const { vaciarCarrito } = useContext(CarritoContext) || {};
  const info = MENSAJES[estado] || MENSAJES.fallo;

  // Vacía el carrito solo si el pago fue aprobado (y si tu contexto tiene esa función)
  useEffect(() => {
    if (estado === 'exito' && typeof vaciarCarrito === 'function') {
      vaciarCarrito();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <Container className="carrito-vacio">
      <i
        className={`fa-solid ${info.icono}`}
        style={{ fontSize: '64px', color: info.color }}
      ></i>
      <Typography variant="h5" fontWeight="bold">
        {info.titulo}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {info.texto}
      </Typography>
      <Button
        component={Link}
        to={estado === 'fallo' ? '/carrito' : '/'}
        variant="contained"
        className="carrito-btn-principal"
      >
        {estado === 'fallo' ? 'Volver al carrito' : 'Seguir viendo pinturas'}
      </Button>
    </Container>
  );
};

export default ResultadoPago;