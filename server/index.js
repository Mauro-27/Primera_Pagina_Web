import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailsPedido } from './email.js';

const PORT = process.env.PORT || 3001;

// MP_MODO_PRUEBA=true en el .env mientras uses las credenciales de PRUEBA de Mercado Pago.
// Cuando pases a producción, bórralo o ponlo en false.
const MODO_PRUEBA = process.env.MP_MODO_PRUEBA === 'true';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

if (!process.env.MP_ACCESS_TOKEN) {
  console.error('Falta MP_ACCESS_TOKEN en el archivo .env');
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env');
  process.exit(1);
}

// Clave SECRETA de Supabase (service_role). Solo vive en el servidor: nunca en el frontend ni en GitHub.
if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('Falta SUPABASE_SERVICE_KEY en el archivo .env (clave service_role de Supabase)');
  process.exit(1);
}

const app = express();
app.use(express.json());

// El servidor lee los precios directo de Supabase: nunca confía en los precios que manda el navegador
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Cliente con permisos totales, SOLO para guardar y actualizar pedidos.
// La tabla "pedidos" no tiene permisos públicos: con la clave anon de tu página nadie puede leerla ni escribirla.
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

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
const paymentApi = new Payment(client);

// Estado de Mercado Pago -> estado de tu pedido
const ESTADOS = {
  approved: 'pagado',
  authorized: 'pendiente',
  in_process: 'pendiente',
  pending: 'pendiente',
  in_mediation: 'pendiente',
  rejected: 'rechazado',
  cancelled: 'rechazado',
  refunded: 'devuelto',
  charged_back: 'devuelto',
};

// Manda los e-mails del pedido UNA sola vez, aunque llegue más de un aviso de pago.
// "Reclama" el envío con una actualización atómica: solo una llamada recibe la fila.
const avisarPedido = async (pedidoId) => {
  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .update({ aviso_enviado_at: new Date().toISOString() })
    .eq('id', pedidoId)
    .is('aviso_enviado_at', null)
    .in('estado', ['pagado', 'sin_stock'])
    .select()
    .maybeSingle();

  if (!pedido) return; // ya se avisó antes (o el pedido no está pagado)

  try {
    const enviado = await enviarEmailsPedido(pedido);
    if (!enviado) throw new Error('e-mail sin configurar');
  } catch (error) {
    console.error(`No se pudo enviar el aviso del pedido ${pedidoId}:`, error.message);
    // Se libera para que se reintente la próxima vez que se confirme este pago
    await supabaseAdmin.from('pedidos').update({ aviso_enviado_at: null }).eq('id', pedidoId);
  }
};

// Consulta el pago DIRECTAMENTE a Mercado Pago (con tu clave secreta) y actualiza el pedido.
// Así nadie puede "fingir" un pago: lo que cuenta es lo que Mercado Pago responde.
const verificarPago = async (paymentId) => {
  const pago = await paymentApi.get({ id: paymentId });

  const pedidoId = pago.external_reference;
  if (!pedidoId) return { estado: 'desconocido' };

  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .select('id, total, estado')
    .eq('id', pedidoId)
    .maybeSingle();

  if (error || !pedido) return { estado: 'desconocido' };

  const estadoMP = ESTADOS[pago.status] || 'pendiente';

  // --- Pago aprobado: se confirma el pedido y se descuenta el stock (una sola vez) ---
  if (estadoMP === 'pagado') {
    // Si el monto pagado es menor al total del pedido, no se da por pagado: queda marcado para revisar
    if (Number(pago.transaction_amount) < Number(pedido.total)) {
      if (!['pagado', 'sin_stock'].includes(pedido.estado)) {
        await supabaseAdmin
          .from('pedidos')
          .update({ estado: 'revisar', mp_payment_id: String(pago.id), mp_estado: pago.status })
          .eq('id', pedidoId);
      }
      return { estado: 'revisar' };
    }

    // La función de la base de datos hace todo junto y es segura si llegan dos avisos a la vez:
    // devuelve 'pagado' (había stock y se descontó) o 'sin_stock' (la pieza se vendió justo antes)
    const { data: resultado, error: errorRpc } = await supabaseAdmin.rpc('confirmar_pedido_pagado', {
      p_pedido: pedidoId,
      p_payment_id: String(pago.id),
      p_mp_estado: pago.status,
    });
    if (errorRpc) throw errorRpc;

    if (resultado === 'sin_stock') {
      console.warn(`ATENCIÓN: el pedido ${pedidoId} se pagó pero ya no había stock. Hay que devolver el dinero.`);
    }
    // Aviso por e-mail (en segundo plano: si falla, no afecta la confirmación del pago)
    if (resultado === 'pagado' || resultado === 'sin_stock') {
      avisarPedido(pedidoId).catch((e) => console.error('Error en el aviso por e-mail:', e));
    }

    return { estado: resultado };
  }

  // --- Cualquier otro estado ---
  // Una devolución siempre se registra
  if (estadoMP === 'devuelto') {
    await supabaseAdmin
      .from('pedidos')
      .update({ estado: 'devuelto', mp_payment_id: String(pago.id), mp_estado: pago.status })
      .eq('id', pedidoId);
    return { estado: 'devuelto' };
  }

  // Un pedido ya pagado (o sin stock) no vuelve atrás por una notificación atrasada
  if (['pagado', 'sin_stock'].includes(pedido.estado)) return { estado: pedido.estado };

  await supabaseAdmin
    .from('pedidos')
    .update({ estado: estadoMP, mp_payment_id: String(pago.id), mp_estado: pago.status })
    .eq('id', pedidoId);

  return { estado: estadoMP };
};

// Lo que se le muestra al cliente (no se expone nada más)
const estadoPublico = (estado) => {
  if (estado === 'pagado' || estado === 'sin_stock') return estado;
  if (estado === 'rechazado' || estado === 'devuelto') return 'rechazado';
  return 'pendiente';
};

app.post('/api/crear-preferencia', async (req, res) => {
  try {
    const { items, codigo, envio, cuenta } = req.body;

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

    // Busca en Supabase solo las obras que están en el carrito
    const ids = [...new Set(items.map((i) => Number(i.id)))];
    if (ids.some((n) => !Number.isFinite(n))) {
      return res.status(400).json({ error: 'El carrito tiene un producto no válido' });
    }

    const { data: obras, error: errorObras } = await supabase
      .from('pinturas') // <-- nombre de tu tabla
      .select('id, titulo, precio, stock')
      .in('id', ids);

    if (errorObras) {
      console.error('Error al leer las obras en Supabase:', errorObras);
      return res.status(500).json({ error: 'No se pudieron verificar los productos' });
    }

    const mpItems = [];
    for (const { id, cantidad } of items) {
      const obra = obras.find((p) => Number(p.id) === Number(id));
      if (!obra) {
        return res.status(400).json({ error: `La obra ${id} no existe` });
      }

      const precio = parsePrice(obra.precio);
      if (precio <= 0) {
        return res.status(400).json({ error: `La obra "${obra.titulo}" no tiene un precio válido` });
      }

      const cantidadPedida = Math.min(Math.max(parseInt(cantidad, 10) || 1, 1), 20);

      // Stock vacío (null) = esa obra no controla stock. Con número, no se puede pedir más de lo que hay
      if (typeof obra.stock === 'number') {
        if (obra.stock <= 0) {
          return res.status(409).json({ error: `"${obra.titulo}" ya no está disponible` });
        }
        if (cantidadPedida > obra.stock) {
          return res.status(409).json({
            error: `Solo quedan ${obra.stock} unidad(es) de "${obra.titulo}". Ajusta la cantidad en el carrito.`,
          });
        }
      }

      mpItems.push({
        id: String(obra.id),
        title: obra.titulo,
        quantity: cantidadPedida,
        unit_price: precio - Math.round((precio * porcentaje) / 100),
        currency_id: 'ARS', // Cambia si tu cuenta es de otro país (CLP, MXN, COP, UYU...)
      });
    }

    const pedidoId = crypto.randomUUID();
    const total = mpItems.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

    // 1) Se guarda el pedido ANTES de mandar a la persona a pagar
    const { error: errorPedido } = await supabaseAdmin.from('pedidos').insert({
      id: pedidoId,
      estado: 'pendiente',
      total,
      items: mpItems.map((i) => ({
        id: i.id,
        titulo: i.title,
        cantidad: i.quantity,
        precio_unitario: i.unit_price,
      })),
      codigo_descuento: porcentaje ? String(codigo).trim().toUpperCase() : null,
      cuenta: cuenta ? String(cuenta).slice(0, 100) : null, // usuario informado por el navegador (solo orientativo)
      nombre: datosEnvio.nombre,
      apellido: datosEnvio.apellido,
      email: datosEnvio.email,
      telefono: datosEnvio.telefono,
      provincia: datosEnvio.provincia,
      localidad: datosEnvio.localidad,
      direccion: datosEnvio.direccion,
      codigo_postal: datosEnvio.codigoPostal,
      notas: datosEnvio.notas || null,
    });

    if (errorPedido) {
      console.error('No se pudo guardar el pedido:', errorPedido);
      return res.status(500).json({ error: 'No se pudo registrar el pedido' });
    }

    // 2) Se crea el pago en Mercado Pago
    let result;
    try {
      result = await preferenceApi.create({
        body: {
          items: mpItems,
          external_reference: pedidoId, // Número de pedido para relacionar cada pago con su envío
          // En modo prueba NO se manda el comprador: si el e-mail es de una cuenta real de Mercado Pago,
          // mezcla una parte real con credenciales de prueba y Mercado Pago bloquea el pago.
          ...(MODO_PRUEBA
            ? {}
            : {
                payer: {
                  name: datosEnvio.nombre,
                  surname: datosEnvio.apellido,
                  email: datosEnvio.email,
                  phone: { number: datosEnvio.telefono },
                  address: { street_name: datosEnvio.direccion, zip_code: datosEnvio.codigoPostal },
                },
              }),
          metadata: { pedido_id: pedidoId, envio: datosEnvio },
          back_urls: {
            success: `${FRONTEND_URL}/pago/exito`,
            failure: `${FRONTEND_URL}/pago/fallo`,
            pending: `${FRONTEND_URL}/pago/pendiente`,
          },
          // Aviso automático de Mercado Pago a tu servidor. Solo funciona con una dirección pública (https),
          // por eso se activa únicamente si defines BACKEND_URL en el .env (cuando publiques el servidor).
          ...(process.env.BACKEND_URL
            ? { notification_url: `${process.env.BACKEND_URL}/api/webhook` }
            : {}),
          // auto_return: 'approved',
          // Descomenta auto_return cuando tu sitio esté publicado con https.
          // Con localhost suele dar error.
        },
      });
    } catch (errorMP) {
      // Si Mercado Pago falla, el pedido queda marcado para no confundirlo con uno real
      await supabaseAdmin.from('pedidos').update({ estado: 'error' }).eq('id', pedidoId);
      throw errorMP;
    }

    console.log('Nuevo pedido registrado:', pedidoId);

    res.json({ id: result.id, url: result.init_point, pedidoId });
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
});

// El frontend llama acá al volver de Mercado Pago para confirmar el pago de verdad
app.get('/api/confirmar-pago', async (req, res) => {
  const paymentId = String(req.query.payment_id || '');
  if (!/^\d+$/.test(paymentId)) {
    return res.status(400).json({ error: 'Pago no válido' });
  }

  try {
    const { estado } = await verificarPago(paymentId);
    res.json({ estado: estadoPublico(estado) });
  } catch (error) {
    console.error('Error al confirmar el pago:', error);
    res.status(502).json({ error: 'No se pudo confirmar el pago' });
  }
});

// Mercado Pago avisa acá cuando cambia un pago (funciona cuando el servidor esté publicado)
app.post('/api/webhook', async (req, res) => {
  res.sendStatus(200); // Mercado Pago necesita una respuesta rápida

  try {
    const tipo = req.body?.type || req.query.type || req.query.topic;
    const id = String(req.body?.data?.id || req.query['data.id'] || req.query.id || '');

    if (tipo === 'payment' && /^\d+$/.test(id)) {
      await verificarPago(id);
    }
  } catch (error) {
    console.error('Error en el webhook:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de pagos escuchando en http://localhost:${PORT}`);
});