// Guarda y lee los datos personales y de envío de cada usuario.
//
// POR AHORA los datos se guardan en este navegador (localStorage), separados por usuario.
// Las dos funciones son async a propósito: el día que quieras guardarlos en Supabase
// solo cambias el contenido de este archivo y el resto de la página sigue igual.

const clave = (usuario) => `disfrutarte:datos:${usuario || 'invitado'}`;

// Devuelve los datos guardados, o null si todavía no hay nada
export const obtenerDatos = async (usuario) => {
  try {
    const crudo = localStorage.getItem(clave(usuario));
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
};

// Guarda los datos. Si el navegador no lo permite, lanza un error para avisarle a la persona
export const guardarDatos = async (usuario, datos) => {
  localStorage.setItem(clave(usuario), JSON.stringify(datos));
};

// ¿Hay una dirección completa guardada? (la usa el formulario de envío del pago)
export const tieneDireccionCompleta = (d) =>
  Boolean(
    d &&
      d.nombreCompleto &&
      d.email &&
      d.calle &&
      d.altura &&
      d.provincia &&
      d.localidad &&
      d.codigoPostal
  );

// Convierte lo guardado en "Mis datos" al formato del formulario de envío del pago
export const aFormularioEnvio = (d) => {
  const palabras = String(d.nombreCompleto).trim().split(/\s+/);
  const apellido = palabras.length > 1 ? palabras[palabras.length - 1] : '';
  const nombre = palabras.length > 1 ? palabras.slice(0, -1).join(' ') : palabras[0];

  const direccion = [
    `${d.calle} ${d.altura}`.trim(),
    d.piso ? `Piso ${d.piso}` : '',
    d.puerta ? `Puerta ${d.puerta}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    nombre,
    apellido,
    email: d.email,
    telefono: d.telefono || '',
    provincia: d.provincia,
    localidad: d.localidad,
    direccion,
    codigoPostal: d.codigoPostal,
  };
};