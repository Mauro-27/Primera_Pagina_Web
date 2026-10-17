import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button, Container, InputAdornment, MenuItem, TextField } from '@mui/material';
import { CarritoContext } from '../context/CarritoContext';
import { useAdmin } from '../hook/useAdmin.js';
import { obtenerDatos, aFormularioEnvio, tieneDireccionCompleta } from '../service/datosUsuario';
import {
  CODIGOS,
  formatear,
  precioDeItem,
  subtotalCarrito,
  descuentoCarrito,
} from '../utils/carritoUtils';
import '../css/carrito.css';
import '../css/checkout.css';

const PROVINCIAS = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const FORM_INICIAL = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  provincia: '',
  localidad: '',
  direccion: '',
  codigoPostal: '',
  notas: '',
};

// Campos que muestran el check verde / la X roja (las indicaciones son opcionales)
const CAMPOS_VALIDABLES = [
  'nombre',
  'apellido',
  'email',
  'telefono',
  'provincia',
  'localidad',
  'direccion',
  'codigoPostal',
];

// Solo letras (con tildes, ñ, ü), separadas por espacios, apóstrofes o guiones: "María José", "O'Brien", "Pérez-Gómez"
const REGEX_NOMBRE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

// Localidad: letras y algunos signos comunes ("San Salvador de Jujuy", "V. Carlos Paz")
const REGEX_LOCALIDAD = /^\p{L}[\p{L} .'’-]*$/u;

// Valida los datos y devuelve un objeto { campo: 'mensaje de error' }
const validar = (f) => {
  const e = {};
  const vacio = (v) => !String(v).trim();

  const nombre = f.nombre.trim();
  if (!nombre) e.nombre = 'Ingresa tu nombre';
  else if (!REGEX_NOMBRE.test(nombre)) e.nombre = 'Solo letras: sin números ni símbolos';
  else if (nombre.length < 2) e.nombre = 'Es demasiado corto';

  const apellido = f.apellido.trim();
  if (!apellido) e.apellido = 'Ingresa tu apellido';
  else if (!REGEX_NOMBRE.test(apellido)) e.apellido = 'Solo letras: sin números ni símbolos';
  else if (apellido.length < 2) e.apellido = 'Es demasiado corto';

  if (vacio(f.email)) e.email = 'Ingresa tu e-mail';
  else if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Ingresa un e-mail válido';

  const telefono = f.telefono.trim();
  if (!telefono) e.telefono = 'Ingresa tu teléfono';
  else if (!/^[\d\s()+-]+$/.test(telefono)) e.telefono = 'Solo números (puedes usar + - y espacios)';
  else if (telefono.replace(/\D/g, '').length < 8) e.telefono = 'Faltan dígitos (con código de área)';

  if (vacio(f.provincia)) e.provincia = 'Elige tu provincia';

  const localidad = f.localidad.trim();
  if (!localidad) e.localidad = 'Ingresa tu localidad';
  else if (!REGEX_LOCALIDAD.test(localidad) || localidad.length < 2)
    e.localidad = 'Ingresa una localidad válida';

  const direccion = f.direccion.trim();
  if (!direccion) e.direccion = 'Ingresa tu calle y número';
  else if (direccion.length < 4) e.direccion = 'Ingresa la calle y el número';

  if (vacio(f.codigoPostal)) e.codigoPostal = 'Ingresa tu código postal';
  else if (!/^[A-Za-z]?\d{4}([A-Za-z]{3})?$/.test(f.codigoPostal.trim()))
    e.codigoPostal = 'Código postal no válido (ej.: 4600)';

  return e;
};

const Checkout = () => {
  const { carrito } = useContext(CarritoContext);
  const location = useLocation();

  const [form, setForm] = useState(FORM_INICIAL);
  const [tocados, setTocados] = useState({}); // campos que ya se escribieron o se abandonaron
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  // Dirección guardada en "Mis datos" (solo si la persona inició sesión y la completó)
  const { adminActivo } = useAdmin();
  const usuario = adminActivo?.usuario;
  const [guardados, setGuardados] = useState(null); // datos ya en formato del formulario de envío
  const [modo, setModo] = useState('otra'); // 'guardada' | 'otra'

  useEffect(() => {
    let activo = true;

    const cargarGuardados = async () => {
      if (!usuario) return;
      const datos = await obtenerDatos(usuario);
      if (!activo || !tieneDireccionCompleta(datos)) return;

      const mapeado = aFormularioEnvio(datos);
      setGuardados(mapeado);
      setForm((prev) => ({ ...prev, ...mapeado, notas: prev.notas }));
      setModo('guardada'); // viene elegida por defecto, para no tener que completar nada
    };

    cargarGuardados();

    return () => {
      activo = false;
    };
  }, [usuario]);

  // Si no hay nada en el carrito, no tiene sentido pedir datos de envío
  if (carrito.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  // El código de descuento viene del carrito
  const codigo = location.state?.codigo || null;
  const porcentaje = codigo ? CODIGOS[codigo] || 0 : 0;

  const totalUnidades = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const subtotal = subtotalCarrito(carrito);
  const montoDescuento = descuentoCarrito(carrito, porcentaje);
  const total = subtotal - montoDescuento;

  // Se recalcula en cada render: por eso el check / la X cambian mientras escribes
  const errores = validar(form);

  // Cambia entre "mi dirección guardada" y "otra dirección"
  const elegirModo = (nuevo) => {
    if (nuevo === modo) return;
    setModo(nuevo);
    setTocados({});
    setErrorPago('');
    setForm(
      nuevo === 'guardada'
        ? { ...FORM_INICIAL, ...guardados, notas: form.notas }
        : { ...FORM_INICIAL, notas: form.notas }
    );
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTocados((prev) => ({ ...prev, [name]: true }));
  };

  const manejarBlur = (e) => {
    const { name } = e.target;
    setTocados((prev) => ({ ...prev, [name]: true }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorPago('');

    // Al enviar, se muestran los resultados de todos los campos
    setTocados(Object.fromEntries(CAMPOS_VALIDABLES.map((c) => [c, true])));

    const primerError = CAMPOS_VALIDABLES.find((c) => errores[c]);
    if (primerError) {
      // Si con la dirección guardada falta algo, se muestra el formulario completo para corregirlo
      if (modo === 'guardada' && primerError !== 'telefono') setModo('otra');
      document.getElementsByName(primerError)[0]?.focus();
      return;
    }

    setProcesando(true);

    // Abrimos la pestaña ahora, dentro del clic, para que el navegador no la bloquee
    const ventanaPago = window.open('', '_blank');

    try {
      const respuesta = await fetch('/api/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Solo mandamos id y cantidad: el servidor calcula los precios
          items: carrito.map((item) => ({ id: item.id, cantidad: item.cantidad || 1 })),
          codigo,
          envio: form,
          cuenta: usuario || null, // para saber con qué cuenta se hizo el pedido
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok || !datos.url) {
        throw new Error(datos.error || 'No se pudo iniciar el pago');
      }

      if (ventanaPago) {
        ventanaPago.location.href = datos.url;
        setProcesando(false);
      } else {
        // Si el navegador bloqueó la pestaña nueva, usamos la misma
        window.location.href = datos.url;
      }
    } catch (error) {
      if (ventanaPago) ventanaPago.close();
      setErrorPago(error.message || 'No se pudo iniciar el pago');
      setProcesando(false);
    }
  };

  // Props comunes de cada campo, con el check verde / la X roja
  const campo = (name, label, extra = {}) => {
    const visible = Boolean(tocados[name]);
    const hayError = visible && Boolean(errores[name]);
    const esValido = visible && !errores[name];

    const clases = [esValido ? 'checkout-valido' : '', extra.className || '']
      .filter(Boolean)
      .join(' ');

    return {
      name,
      label,
      value: form[name],
      onChange: manejarCambio,
      onBlur: manejarBlur,
      error: hayError,
      helperText: hayError ? errores[name] : ' ',
      fullWidth: true,
      InputProps: visible
        ? {
            endAdornment: (
              <InputAdornment position="end">
                {esValido ? (
                  <i
                    className="fa-solid fa-circle-check checkout-icono-ok"
                    title="Correcto"
                  ></i>
                ) : (
                  <i
                    className="fa-solid fa-circle-xmark checkout-icono-error"
                    title="Revisa este dato"
                  ></i>
                )}
              </InputAdornment>
            ),
          }
        : undefined,
      ...extra,
      className: clases || undefined,
    };
  };

  const bloqueNotas = (
    <div className="checkout-completo">
      <TextField
        name="notas"
        label="Indicaciones para la entrega (opcional)"
        value={form.notas}
        onChange={manejarCambio}
        fullWidth
        multiline
        minRows={2}
      />
    </div>
  );

  return (
    <Container maxWidth="lg" className="carrito-container">
      <h1 className="carrito-titulo">Datos de envío</h1>

      <form className="carrito-layout" onSubmit={manejarEnvio} noValidate>
        {/* ===== Izquierda: formulario ===== */}
        <section className="carrito-caja" aria-label="Datos de envío">
          <h2 className="carrito-caja-titulo">¿A dónde enviamos tu pedido?</h2>

          {guardados && (
            <div className="checkout-opciones" role="radiogroup" aria-label="Dirección de envío">
              <label className={`checkout-opcion ${modo === 'guardada' ? 'activa' : ''}`}>
                <input
                  type="radio"
                  name="modo-envio"
                  checked={modo === 'guardada'}
                  onChange={() => elegirModo('guardada')}
                />
                <span className="checkout-opcion-cuerpo">
                  <strong>Usar mi dirección guardada</strong>
                  <span className="checkout-opcion-detalle">
                    {guardados.nombre} {guardados.apellido}
                  </span>
                  <span className="checkout-opcion-detalle">{guardados.direccion}</span>
                  <span className="checkout-opcion-detalle">
                    {guardados.localidad}, {guardados.provincia} ({guardados.codigoPostal})
                  </span>
                </span>
              </label>

              <label className={`checkout-opcion ${modo === 'otra' ? 'activa' : ''}`}>
                <input
                  type="radio"
                  name="modo-envio"
                  checked={modo === 'otra'}
                  onChange={() => elegirModo('otra')}
                />
                <span className="checkout-opcion-cuerpo">
                  <strong>Enviar a otra dirección</strong>
                </span>
              </label>
            </div>
          )}

          {modo === 'guardada' ? (
            // Con la dirección guardada solo se pide lo que falte (teléfono) y las indicaciones
            <div className="checkout-grid">
              {!guardados?.telefono && (
                <div className="checkout-completo">
                  <TextField
                    {...campo('telefono', 'Teléfono de contacto (con código de área)', {
                      type: 'tel',
                      autoComplete: 'tel',
                    })}
                  />
                </div>
              )}
              {bloqueNotas}
            </div>
          ) : (
          <div className="checkout-grid">
            <TextField {...campo('nombre', 'Nombre', { autoComplete: 'given-name' })} />
            <TextField {...campo('apellido', 'Apellido', { autoComplete: 'family-name' })} />

            <div className="checkout-completo">
              <TextField
                {...campo('email', 'E-mail', { type: 'email', autoComplete: 'email' })}
              />
            </div>

            <div className="checkout-completo">
              <TextField
                {...campo('telefono', 'Teléfono (con código de área)', {
                  type: 'tel',
                  autoComplete: 'tel',
                })}
              />
            </div>

            <TextField
              {...campo('provincia', 'Provincia', { select: true, className: 'checkout-select' })}
            >
              {PROVINCIAS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...campo('localidad', 'Localidad', { autoComplete: 'address-level2' })}
            />

            <TextField
              {...campo('direccion', 'Calle y número (piso / depto si corresponde)', {
                autoComplete: 'street-address',
              })}
            />
            <TextField
              {...campo('codigoPostal', 'Código postal', { autoComplete: 'postal-code' })}
            />

            {bloqueNotas}
          </div>
          )}

          <Button
            component={Link}
            to="/carrito"
            className="carrito-btn-seguir"
            startIcon={<i className="fa-solid fa-arrow-left"></i>}
          >
            Volver al carrito
          </Button>
        </section>

        {/* ===== Derecha: resumen ===== */}
        <aside className="carrito-lateral">
          <div className="carrito-caja">
            <h2 className="carrito-caja-titulo">Tu pedido</h2>

            <ul className="checkout-items">
              {carrito.map((item) => {
                const nombre = item.nombre || item.titulo || item.name || 'Producto';
                const cantidad = item.cantidad || 1;
                return (
                  <li key={item.id} className="checkout-item">
                    <span className="checkout-item-nombre">
                      {nombre}
                      {cantidad > 1 && <span className="checkout-item-cant"> × {cantidad}</span>}
                    </span>
                    <span>{formatear(precioDeItem(item) * cantidad)}</span>
                  </li>
                );
              })}
            </ul>

            <div className="carrito-resumen-fila">
              <span>Productos ({totalUnidades})</span>
              <span>{formatear(subtotal)}</span>
            </div>

            {porcentaje > 0 && (
              <div className="carrito-resumen-fila carrito-resumen-descuento">
                <span>Descuento ({porcentaje}%)</span>
                <span>-{formatear(montoDescuento)}</span>
              </div>
            )}

            <div className="carrito-resumen-fila">
              <span>Envío</span>
              <span className="carrito-envio-gratis">Gratis</span>
            </div>

            <div className="carrito-resumen-fila carrito-resumen-total">
              <span>Total</span>
              <span>{formatear(total)}</span>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              className="carrito-btn-principal"
              disabled={procesando}
            >
              {procesando ? 'Abriendo Mercado Pago...' : 'Ir a pagar'}
            </Button>

            {errorPago && (
              <p className="carrito-error-pago" role="alert">
                {errorPago}
              </p>
            )}
          </div>
        </aside>
      </form>
    </Container>
  );
};

export default Checkout;