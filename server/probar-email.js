// Prueba rápida del e-mail SIN hacer una compra.
// Uso (en la carpeta principal del proyecto):  node server/probar-email.js
import 'dotenv/config';
import { enviarEmailsPedido } from './email.js';

const pedidoDePrueba = {
  id: '00000000-aaaa-bbbb-cccc-000000000000',
  created_at: new Date().toISOString(),
  estado: 'pagado',
  total: 15000,
  codigo_descuento: null,
  items: [{ id: '1', titulo: 'Pedido de prueba', cantidad: 2, precio_unitario: 7500 }],
  nombre: 'Cliente',
  apellido: 'De Prueba',
  email: process.env.EMAIL_VENDEDOR || process.env.SMTP_USER || 'prueba@example.com',
  telefono: '388 1234567',
  provincia: 'Jujuy',
  localidad: 'San Salvador de Jujuy',
  direccion: 'Calle de Prueba 123',
  codigo_postal: '4600',
  notas: 'Esto es solo una prueba',
  mp_payment_id: '0000000000',
};

try {
  const enviado = await enviarEmailsPedido(pedidoDePrueba);
  console.log(
    enviado
      ? `Listo: revisa la bandeja de entrada de ${process.env.EMAIL_VENDEDOR || process.env.SMTP_USER} (y la carpeta de spam).`
      : 'No se envió: faltan SMTP_HOST, SMTP_USER o SMTP_PASS en el archivo .env.'
  );
} catch (error) {
  console.error('Error al enviar el e-mail:', error.message);
}