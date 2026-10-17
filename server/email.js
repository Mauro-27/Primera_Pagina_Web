// Avisos por e-mail de los pedidos.
//   - Te llega a TI un aviso por cada pedido pagado (y una alerta si se pagó sin stock).
//   - Opcionalmente, el comprador recibe una confirmación (EMAIL_COMPRADOR=true).
//
// Usa SMTP, así que sirve con Gmail, Brevo, Resend, etc. solo cambiando las variables del .env.

const COLOR = '#4f1550'; // color de tu marca

/* ===== Utilidades ===== */

// Todo lo que escribe el cliente se "escapa" antes de ponerlo en el HTML del e-mail
const escapar = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const plata = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

const numeroCorto = (id) => String(id).slice(0, 8).toUpperCase();

const fechaLegible = (iso) =>
  new Date(iso).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

const direccionCompleta = (p) =>
  `${p.direccion}, ${p.localidad}, ${p.provincia} (CP ${p.codigo_postal})`;

/* ===== Plantillas (no envían nada: solo arman el texto) ===== */

const filasProductos = (items) =>
  items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapar(i.cantidad)} × ${escapar(i.titulo)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${plata(
          i.precio_unitario * i.cantidad
        )}</td>
      </tr>`
    )
    .join('');

const marco = (titulo, contenido) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f4f0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e6e1d8;">
    <div style="background:${COLOR};color:#ffffff;padding:18px 24px;font-size:20px;font-style:italic;font-weight:bold;">Disfrut-Arte</div>
    <div style="padding:24px;color:#1f1b16;font-size:15px;line-height:1.5;">
      <h2 style="margin:0 0 16px;font-size:18px;color:#1f1b16;">${titulo}</h2>
      ${contenido}
    </div>
  </div>
</div>`;

export const construirEmailVendedor = (pedido) => {
  const sinStock = pedido.estado === 'sin_stock';
  const numero = numeroCorto(pedido.id);

  const asunto = sinStock
    ? `ATENCIÓN: pedido ${numero} pagado SIN STOCK (devolver dinero)`
    : `Nuevo pedido pagado ${numero} - ${pedido.nombre} ${pedido.apellido} (${plata(pedido.total)})`;

  const alerta = sinStock
    ? `<div style="background:#fdecea;border:1px solid #f5c2bd;color:#8a1c12;padding:12px 14px;border-radius:8px;margin-bottom:16px;">
         <strong>Este cliente pagó, pero la pieza ya no tenía stock.</strong><br>
         Devuelve el dinero desde tu cuenta de Mercado Pago o contacta al cliente para ofrecerle una alternativa.
       </div>`
    : '';

  const html = marco(
    sinStock ? 'Pedido pagado sin stock' : '¡Tienes un nuevo pedido pagado!',
    `
    ${alerta}
    <p style="margin:0 0 16px;color:#6b6b6b;">Pedido <strong>#${numero}</strong> · ${escapar(fechaLegible(pedido.created_at))}</p>

    <h3 style="margin:16px 0 4px;font-size:15px;">Productos</h3>
    <table style="width:100%;border-collapse:collapse;">${filasProductos(pedido.items)}
      <tr>
        <td style="padding:10px 0;font-weight:bold;">Total pagado${
          pedido.codigo_descuento ? ` (código ${escapar(pedido.codigo_descuento)})` : ''
        }</td>
        <td style="padding:10px 0;text-align:right;font-weight:bold;">${plata(pedido.total)}</td>
      </tr>
    </table>

    <h3 style="margin:20px 0 4px;font-size:15px;">Datos para el envío</h3>
    <p style="margin:0;">
      <strong>${escapar(pedido.nombre)} ${escapar(pedido.apellido)}</strong><br>
      ${escapar(direccionCompleta(pedido))}<br>
      Teléfono: ${escapar(pedido.telefono)}<br>
      E-mail: ${escapar(pedido.email)}
      ${pedido.notas ? `<br>Indicaciones: ${escapar(pedido.notas)}` : ''}
    </p>

    <p style="margin:20px 0 0;color:#6b6b6b;font-size:13px;">
      Mercado Pago: pago n.º ${escapar(pedido.mp_payment_id || '-')}.
      Cuando despaches el paquete, marca <em>enviado</em> en la tabla <em>pedidos</em> de Supabase.
    </p>`
  );

  const texto = [
    sinStock ? 'ATENCIÓN: el cliente pagó pero la pieza ya no tenía stock. Hay que devolver el dinero.' : 'Nuevo pedido pagado',
    `Pedido #${numero} - ${fechaLegible(pedido.created_at)}`,
    '',
    ...pedido.items.map((i) => `- ${i.cantidad} x ${i.titulo}: ${plata(i.precio_unitario * i.cantidad)}`),
    `Total: ${plata(pedido.total)}`,
    '',
    'Datos para el envío:',
    `${pedido.nombre} ${pedido.apellido}`,
    direccionCompleta(pedido),
    `Teléfono: ${pedido.telefono}`,
    `E-mail: ${pedido.email}`,
    pedido.notas ? `Indicaciones: ${pedido.notas}` : '',
    '',
    `Mercado Pago: pago n.º ${pedido.mp_payment_id || '-'}`,
  ]
    .filter((linea) => linea !== '')
    .join('\n');

  return { asunto, html, texto };
};

export const construirEmailComprador = (pedido) => {
  const numero = numeroCorto(pedido.id);

  const asunto = `Recibimos tu pedido #${numero} - Disfrut-Arte`;

  const html = marco(
    `¡Gracias por tu compra, ${escapar(pedido.nombre)}!`,
    `
    <p style="margin:0 0 16px;">Ya recibimos tu pago y registramos tu pedido <strong>#${numero}</strong>. Nos pondremos en contacto contigo para coordinar la entrega.</p>

    <table style="width:100%;border-collapse:collapse;">${filasProductos(pedido.items)}
      <tr>
        <td style="padding:10px 0;font-weight:bold;">Total</td>
        <td style="padding:10px 0;text-align:right;font-weight:bold;">${plata(pedido.total)}</td>
      </tr>
    </table>

    <h3 style="margin:20px 0 4px;font-size:15px;">Enviaremos tu pedido a</h3>
    <p style="margin:0;">${escapar(direccionCompleta(pedido))}</p>`
  );

  const texto = [
    `¡Gracias por tu compra, ${pedido.nombre}!`,
    `Ya recibimos tu pago y registramos tu pedido #${numero}. Nos pondremos en contacto contigo para coordinar la entrega.`,
    '',
    ...pedido.items.map((i) => `- ${i.cantidad} x ${i.titulo}: ${plata(i.precio_unitario * i.cantidad)}`),
    `Total: ${plata(pedido.total)}`,
    '',
    `Enviaremos tu pedido a: ${direccionCompleta(pedido)}`,
  ].join('\n');

  return { asunto, html, texto };
};

/* ===== Envío ===== */

let transporte = null;

const obtenerTransporte = async () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  if (!transporte) {
    const { default: nodemailer } = await import('nodemailer');
    const puerto = Number(SMTP_PORT) || 465;
    transporte = nodemailer.createTransport({
      host: SMTP_HOST,
      port: puerto,
      secure: puerto === 465, // 465 = conexión segura directa; 587 = STARTTLS
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporte;
};

// Envía el aviso a la vendedora y, si lo activas, la confirmación al comprador.
// Devuelve true si el aviso a la vendedora salió bien; false si el e-mail no está configurado.
export const enviarEmailsPedido = async (pedido) => {
  const t = await obtenerTransporte();
  if (!t) {
    console.warn(`E-mail sin configurar (faltan SMTP_* en el .env): no se envió el aviso del pedido ${pedido.id}`);
    return false;
  }

  const remitente = process.env.EMAIL_REMITENTE || process.env.SMTP_USER;
  const vendedor = process.env.EMAIL_VENDEDOR || process.env.SMTP_USER;

  // 1) Aviso para ti
  const aviso = construirEmailVendedor(pedido);
  await t.sendMail({
    from: remitente,
    to: vendedor,
    replyTo: pedido.email, // al responder el aviso, le escribes directo al cliente
    subject: aviso.asunto,
    text: aviso.texto,
    html: aviso.html,
  });

  // 2) Confirmación para el comprador (solo si activas EMAIL_COMPRADOR=true y el pago está confirmado)
  if (process.env.EMAIL_COMPRADOR === 'true' && pedido.estado === 'pagado' && pedido.email) {
    try {
      const confirmacion = construirEmailComprador(pedido);
      await t.sendMail({
        from: remitente,
        to: pedido.email,
        replyTo: vendedor,
        subject: confirmacion.asunto,
        text: confirmacion.texto,
        html: confirmacion.html,
      });
    } catch (error) {
      // Si falla el e-mail del comprador, no se repite el aviso que ya te llegó a ti
      console.error('No se pudo enviar la confirmación al comprador:', error.message);
    }
  }

  return true;
};