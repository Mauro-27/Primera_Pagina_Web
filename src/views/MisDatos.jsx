import { useEffect, useState } from 'react';
import { InputAdornment, MenuItem, Snackbar, TextField } from '@mui/material';
import { useAdmin } from '../hook/useAdmin.js';
import { obtenerDatos, guardarDatos } from '../service/datosUsuario';
import '../css/misdatos.css';

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

const FORM_VACIO = {
  // Datos personales
  nombreCompleto: '',
  email: '',
  telefono: '',
  dni: '',
  // Dirección de envío
  calle: '',
  altura: '',
  piso: '',
  puerta: '',
  ciudad: '',
  provincia: '',
  localidad: '',
  codigoPostal: '',
};

// Campos que se pueden dejar vacíos
const OPCIONALES = ['telefono', 'piso', 'puerta'];

// Solo letras (con tildes, ñ), separadas por espacios, apóstrofes o guiones
const REGEX_NOMBRE = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;
// Ciudad / localidad: letras y algunos signos comunes ("San Salvador de Jujuy", "V. Carlos Paz")
const REGEX_LUGAR = /^\p{L}[\p{L} .'’-]*$/u;

// Valida y devuelve un objeto { campo: 'mensaje de error' }
const validar = (f) => {
  const e = {};
  const t = (v) => String(v).trim();

  // --- Datos personales ---
  const nombre = t(f.nombreCompleto);
  if (!nombre) e.nombreCompleto = 'Ingresa tu nombre completo';
  else if (!REGEX_NOMBRE.test(nombre)) e.nombreCompleto = 'Solo letras: sin números ni símbolos';
  else if (nombre.split(/\s+/).length < 2) e.nombreCompleto = 'Ingresa nombre y apellido';

  if (!t(f.email)) e.email = 'Ingresa tu e-mail';
  else if (!/^\S+@\S+\.\S+$/.test(t(f.email))) e.email = 'Ingresa un e-mail válido';

  // Teléfono: opcional, pero si lo completas tiene que ser válido
  const telefono = t(f.telefono);
  if (telefono) {
    if (!/^[\d\s()+-]+$/.test(telefono)) e.telefono = 'Solo números (puedes usar + - y espacios)';
    else if (telefono.replace(/\D/g, '').length < 8) e.telefono = 'Faltan dígitos (con código de área)';
  }

  const dni = t(f.dni).replace(/[.\s]/g, '');
  if (!dni) e.dni = 'Ingresa tu DNI';
  else if (!/^\d{7,8}$/.test(dni)) e.dni = 'El DNI debe tener 7 u 8 números';

  // --- Dirección de envío ---
  const calle = t(f.calle);
  if (!calle) e.calle = 'Ingresa tu calle';
  else if (!/^[\p{L}\d\s.'’°º-]{2,}$/u.test(calle)) e.calle = 'Ingresa una calle válida';

  const altura = t(f.altura);
  if (!altura) e.altura = 'Ingresa la altura';
  else if (!/^\d{1,6}$/.test(altura)) e.altura = 'Solo números';

  // Piso y puerta: opcionales
  for (const campo of ['piso', 'puerta']) {
    const valor = t(f[campo]);
    if (valor && !/^[\p{L}\d\s°º.-]{1,10}$/u.test(valor)) e[campo] = 'Máx. 10 caracteres';
  }

  if (!t(f.ciudad)) e.ciudad = 'Ingresa tu ciudad';
  else if (!REGEX_LUGAR.test(t(f.ciudad)) || t(f.ciudad).length < 2) e.ciudad = 'Ingresa una ciudad válida';

  if (!t(f.provincia)) e.provincia = 'Elige tu provincia';

  if (!t(f.localidad)) e.localidad = 'Ingresa tu localidad';
  else if (!REGEX_LUGAR.test(t(f.localidad)) || t(f.localidad).length < 2)
    e.localidad = 'Ingresa una localidad válida';

  if (!t(f.codigoPostal)) e.codigoPostal = 'Ingresa tu código postal';
  else if (!/^[A-Za-z]?\d{4}([A-Za-z]{3})?$/.test(t(f.codigoPostal)))
    e.codigoPostal = 'Código postal no válido (ej.: 4600)';

  return e;
};

// Limpia los datos antes de guardarlos
const limpiar = (f) => {
  const limpio = {};
  for (const [campo, valor] of Object.entries(f)) limpio[campo] = String(valor).trim();
  limpio.dni = limpio.dni.replace(/[.\s]/g, ''); // el DNI se guarda solo con números
  return limpio;
};

const MisDatos = () => {
  const { adminActivo } = useAdmin();
  const usuario = adminActivo?.usuario;

  const [form, setForm] = useState(FORM_VACIO);
  const [guardado, setGuardado] = useState(FORM_VACIO); // lo último que se guardó
  const [tocados, setTocados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [aviso, setAviso] = useState(false);

  // Carga los datos guardados (o rellena con lo que ya se sabe de la cuenta)
  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      const datos = await obtenerDatos(usuario);
      if (!activo) return;

      const inicial = datos
        ? { ...FORM_VACIO, ...datos }
        : {
            ...FORM_VACIO,
            email: adminActivo?.email || '',
            nombreCompleto: adminActivo?.nombre || '',
          };

      setForm(inicial);
      setGuardado(datos ? inicial : FORM_VACIO);
      setCargando(false);
    };

    cargar();

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  if (cargando) {
    return <p className="misdatos-cargando">Cargando tus datos...</p>;
  }

  // Se recalcula en cada render: por eso el check / la X cambian mientras escribes
  const errores = validar(form);
  const hayCambios = JSON.stringify(form) !== JSON.stringify(guardado);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTocados((prev) => ({ ...prev, [name]: true }));
    setErrorGuardar('');
  };

  const manejarBlur = (e) => {
    const { name } = e.target;
    setTocados((prev) => ({ ...prev, [name]: true }));
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setErrorGuardar('');

    const campos = Object.keys(FORM_VACIO);
    setTocados(Object.fromEntries(campos.map((c) => [c, true])));

    const primerError = campos.find((c) => errores[c]);
    if (primerError) {
      document.getElementsByName(primerError)[0]?.focus();
      return;
    }

    setGuardando(true);
    try {
      const datos = limpiar(form);
      await guardarDatos(usuario, datos);
      setForm(datos);
      setGuardado(datos);
      setAviso(true);
    } catch (error) {
      console.error('No se pudieron guardar los datos:', error);
      setErrorGuardar('No se pudieron guardar tus datos. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const descartar = () => {
    setForm(guardado);
    setTocados({});
    setErrorGuardar('');
  };

  // Props comunes de cada campo, con el check verde / la X roja
  const campo = (name, label, extra = {}) => {
    const valor = String(form[name]).trim();
    const visible = Boolean(tocados[name]) && !(OPCIONALES.includes(name) && !valor);
    const hayError = visible && Boolean(errores[name]);
    const esValido = visible && !errores[name];
    const clases = [esValido ? 'misdatos-valido' : '', extra.className || ''].filter(Boolean).join(' ');

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
                  <i className="fa-solid fa-circle-check misdatos-icono-ok" title="Correcto"></i>
                ) : (
                  <i className="fa-solid fa-circle-xmark misdatos-icono-error" title="Revisa este dato"></i>
                )}
              </InputAdornment>
            ),
          }
        : undefined,
      ...extra,
      className: clases || undefined,
    };
  };

  return (
    <div className="misdatos">
      <h1 className="misdatos-titulo">Mis datos</h1>

      <form onSubmit={manejarEnvio} noValidate>
        {/* ===== Datos personales ===== */}
        <div className="misdatos-caja" role="group" aria-labelledby="titulo-personales">
          <h2 id="titulo-personales" className="misdatos-caja-titulo">
            Datos personales
          </h2>

          <div className="misdatos-grid">
            <div className="col-6">
              <TextField {...campo('nombreCompleto', 'Nombre completo', { autoComplete: 'name' })} />
            </div>
            <div className="col-6">
              <TextField {...campo('dni', 'DNI', { inputMode: 'numeric', autoComplete: 'off' })} />
            </div>

            <div className="col-6">
              <TextField {...campo('email', 'E-mail', { type: 'email', autoComplete: 'email' })} />
            </div>
            <div className="col-6">
              <TextField
                {...campo('telefono', 'Teléfono (opcional)', { type: 'tel', autoComplete: 'tel' })}
              />
            </div>
          </div>
        </div>

        {/* ===== Dirección de envío ===== */}
        <div className="misdatos-caja" role="group" aria-labelledby="titulo-envio">
          <h2 id="titulo-envio" className="misdatos-caja-titulo">
            Dirección de envío
          </h2>

          <div className="misdatos-grid">
            <div className="col-8">
              <TextField {...campo('calle', 'Calle', { autoComplete: 'address-line1' })} />
            </div>
            <div className="col-4">
              <TextField {...campo('altura', 'Altura', { inputMode: 'numeric', autoComplete: 'off' })} />
            </div>

            <div className="col-3 col-m-6">
              <TextField {...campo('piso', 'Piso (opcional)', { autoComplete: 'off' })} />
            </div>
            <div className="col-3 col-m-6">
              <TextField {...campo('puerta', 'Puerta (opcional)', { autoComplete: 'off' })} />
            </div>
            <div className="col-6">
              <TextField {...campo('codigoPostal', 'Código postal', { autoComplete: 'postal-code' })} />
            </div>

            <div className="col-4">
              <TextField {...campo('ciudad', 'Ciudad', { autoComplete: 'address-level2' })} />
            </div>
            <div className="col-4">
              <TextField {...campo('provincia', 'Provincia', { select: true, className: 'misdatos-select' })}>
                {PROVINCIAS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </div>
            <div className="col-4">
              <TextField {...campo('localidad', 'Localidad', { autoComplete: 'address-level3' })} />
            </div>
          </div>
        </div>

        {/* ===== Botones ===== */}
        <div className="misdatos-acciones">
          <button type="submit" className="misdatos-btn misdatos-btn--principal" disabled={guardando || !hayCambios}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="misdatos-btn misdatos-btn--secundario"
            onClick={descartar}
            disabled={guardando || !hayCambios}
          >
            Descartar cambios
          </button>
        </div>

        {errorGuardar && (
          <p className="misdatos-error" role="alert">
            {errorGuardar}
          </p>
        )}
      </form>

      <Snackbar
        open={aviso}
        autoHideDuration={3000}
        onClose={() => setAviso(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <div className="misdatos-toast" role="status">
          <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
          <span>Datos guardados</span>
        </div>
      </Snackbar>
    </div>
  );
};

export default MisDatos;