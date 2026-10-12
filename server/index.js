import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import crypto from 'crypto';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!process.env.MP_ACCESS_TOKEN) {
  console.error('Falta MP_ACCESS_TOKEN en el archivo .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// El servidor lee los precios de tu propio JSON: nunca confía en los precios que manda el navegador
const pinturas = JSON.parse(
  fs.readFileSync(new URL('../src/data/pinturas.json', import.meta.url), 'utf-8')
);

// Códigos de descuento (porcentaje). Deben coincidir con los de Carrito.jsx
const CODIGOS = {
  DISFRUTA10: 10,
};

// "$50.000" -> 50000
const parsePrice = (precio) => {
  if (!precio) return 0;
  if (typeof precio === 'number') return precio;
  return Number(String(precio).replace(/[^0-9]/g, ''));
};


// Datos de envío que manda el formulario: se validan y se limpian acá, nunca se confía en el navegador
const CAMPOS_ENVIO = [
  'nombre',
  'apellido',
  'email',
  'telefono',
  'provincia',
  'localidad',
  'direccion',
  'codigoPostal',
];

const limpiarEnvio = (envio) => {
  if (!envio || typeof envio !== 'object') return { error: 'Faltan los datos de envío' };

  const datos = {};
  for (const campo of [...CAMPOS_ENVIO, 'notas']) {
    datos[campo] = String(envio[campo] ?? '').trim().slice(0, 300);
  }

  for (const campo of CAMPOS_ENVIO) {
    if (!datos[campo]) return { error: `Falta completar el campo "${campo}"` };
  }
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) return { error: 'El e-mail no es válido' };

  // Nombre y apellido: solo letras (con tildes), espacios, apóstrofes y guiones
  const REGEX_NOMBRE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
  if (
    !REGEX_NOMBRE.test(datos.nombre) ||
    !REGEX_NOMBRE.test(datos.apellido) ||
    datos.nombre.length < 2 ||
    datos.apellido.length < 2
  ) {
    return { error: 'El nombre y el apellido solo pueden tener letras' };
  }

  return { datos };
};

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN.trim() });
const preferenceApi = new Preference(client);

app.post('/api/crear-preferencia', async (req, res) => {
  try {
    const { items, codigo, envio } = req.body;

    const { datos: datosEnvio, error: errorEnvio } = limpiarEnvio(envio);
    if (errorEnvio) {
      return res.status(400).json({ error: errorEnvio });
    }


    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Si mandan un código, el servidor lo valida (no confía en lo que diga el navegador)
    const porcentaje = codigo ? CODIGOS[String(codigo).trim().toUpperCase()] : 0;
    if (codigo && !porcentaje) {
      return res.status(400).json({ error: 'El código de descuento no es válido' });
    }

    const mpItems = [];
    for (const { id, cantidad } of items) {
      const obra = pinturas.find((p) => p.id === Number(id));
      if (!obra) {
        return res.status(400).json({ error: `La obra ${id} no existe` });
      }

      const precio = parsePrice(obra.precio);
      if (precio <= 0) {
        return res.status(400).json({ error: `La obra "${obra.titulo}" no tiene un precio válido` });
      }

      mpItems.push({
        id: String(obra.id),
        title: obra.titulo,
        quantity: Math.min(Math.max(parseInt(cantidad, 10) || 1, 1), 20),
        unit_price: precio - Math.round((precio * porcentaje) / 100),
        currency_id: 'ARS', // Cambia si tu cuenta es de otro país (CLP, MXN, COP, UYU...)
      });
    }

    const pedidoId = crypto.randomUUID();

    const result = await preferenceApi.create({
      body: {
        items: mpItems,
        external_reference: pedidoId, // Número de pedido para relacionar cada pago con su envío
        payer: {
          name: datosEnvio.nombre,
          surname: datosEnvio.apellido,
          email: datosEnvio.email,
          phone: { number: datosEnvio.telefono },
          address: { street_name: datosEnvio.direccion, zip_code: datosEnvio.codigoPostal },
        },
        metadata: { pedido_id: pedidoId, envio: datosEnvio },
        back_urls: {
          success: `${FRONTEND_URL}/pago/exito`,
          failure: `${FRONTEND_URL}/pago/fallo`,
          pending: `${FRONTEND_URL}/pago/pendiente`,
        },
        // auto_return: 'approved',
        // Descomenta auto_return cuando tu sitio esté publicado con https.
        // Con localhost suele dar error.
      },
    });

    // Por ahora solo se muestra en la consola; el siguiente paso es guardar el pedido
    console.log('Nuevo pedido', pedidoId, {
      envio: datosEnvio,
      items: mpItems.map((i) => `${i.title} x${i.quantity}`),
    });

    res.json({ id: result.id, url: result.init_point, pedidoId });
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de pagos escuchando en http://localhost:${PORT}`);
});