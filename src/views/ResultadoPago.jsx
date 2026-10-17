import { useContext, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Button, CircularProgress, Container, Typography } from '@mui/material';
import { CarritoContext } from '../context/CarritoContext';
import '../css/carrito.css';

const MENSAJES = {
  exito: {
    icono: 'fa-circle-check',
    color: '#2e9e4f',
    titulo: '¡Pago aprobado!',
    texto: 'Gracias por tu compra. Ya registramos tu pedido y nos pondremos en contacto para coordinar la entrega.',
    boton: 'Seguir viendo pinturas',
    destino: '/productos',
  },
  pendiente: {
    icono: 'fa-clock',
    color: '#d99a00',
    titulo: 'Tu pago está pendiente',
    texto: 'Apenas Mercado Pago lo confirme, tu pedido quedará registrado como pagado.',
    boton: 'Seguir viendo pinturas',
    destino: '/productos',
  },
  fallo: {
    icono: 'fa-circle-xmark',
    color: '#c94b4b',
    titulo: 'No se pudo completar el pago',
    texto: 'No se realizó ningún cobro. Puedes volver al carrito e intentarlo de nuevo.',
    boton: 'Volver al carrito',
    destino: '/carrito',
  },
  sinstock: {
    icono: 'fa-circle-exclamation',
    color: '#d99a00',
    titulo: 'Esta pieza se vendió justo antes',
    texto:
      'Tu pago se acreditó, pero otra persona compró la pieza unos segundos antes. Nos pondremos en contacto contigo para devolverte el dinero o proponerte una alternativa.',
    boton: 'Ver otras pinturas',
    destino: '/productos',
  },
  sinconfirmar: {
    icono: 'fa-circle-question',
    color: '#6b6b6b',
    titulo: 'No pudimos confirmar tu pago',
    texto:
      'Si ya pagaste, guarda el comprobante de Mercado Pago y escríbenos para que lo verifiquemos. Si no, puedes volver al carrito para intentarlo de nuevo.',
    boton: 'Volver al carrito',
    destino: '/carrito',
  },
};

const ResultadoPago = () => {
  const { estado } = useParams(); // exito | pendiente | fallo (solo es una pista: la verdad la dice el servidor)
  const [searchParams] = useSearchParams();
  const { vaciarCarrito } = useContext(CarritoContext) || {};

  // Mercado Pago agrega el número de pago a la dirección al volver al sitio
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');

  const [vista, setVista] = useState('cargando'); // cargando | exito | pendiente | fallo | sinstock | sinconfirmar

  // Confirma el pago con el servidor (que lo consulta directo a Mercado Pago)
  useEffect(() => {
    let activo = true;

    const verificar = async () => {
      // Sin número de pago no hay nada que confirmar: nunca se muestra "aprobado" solo por la dirección
      if (!paymentId || paymentId === 'null') {
        setVista(estado === 'pendiente' ? 'pendiente' : estado === 'fallo' ? 'fallo' : 'sinconfirmar');
        return;
      }

      try {
        const respuesta = await fetch(`/api/confirmar-pago?payment_id=${encodeURIComponent(paymentId)}`);
        const datos = await respuesta.json();
        if (!respuesta.ok) throw new Error(datos.error || 'No se pudo confirmar');
        if (!activo) return;

        setVista(
          datos.estado === 'pagado'
            ? 'exito'
            : datos.estado === 'sin_stock'
              ? 'sinstock'
              : datos.estado === 'rechazado'
                ? 'fallo'
                : 'pendiente'
        );
      } catch (error) {
        console.error('Error al confirmar el pago:', error);
        if (activo) setVista('sinconfirmar');
      }
    };

    verificar();

    return () => {
      activo = false;
    };
  }, [paymentId, estado]);

  // Vacía el carrito solo cuando el pago está realmente confirmado (y si tu contexto tiene esa función)
  useEffect(() => {
    if (vista === 'exito' && typeof vaciarCarrito === 'function') {
      vaciarCarrito();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista]);

  if (vista === 'cargando') {
    return (
      <Container className="carrito-vacio">
        <CircularProgress sx={{ color: 'var(--primary-color)' }} aria-label="Confirmando el pago" />
        <Typography color="text.secondary">Confirmando tu pago...</Typography>
      </Container>
    );
  }

  const info = MENSAJES[vista];

  return (
    <Container className="carrito-vacio">
      <i className={`fa-solid ${info.icono}`} style={{ fontSize: '64px', color: info.color }}></i>
      <Typography variant="h5" fontWeight="bold">
        {info.titulo}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {info.texto}
      </Typography>
      <Button component={Link} to={info.destino} variant="contained" className="carrito-btn-principal">
        {info.boton}
      </Button>
    </Container>
  );
};

export default ResultadoPago;