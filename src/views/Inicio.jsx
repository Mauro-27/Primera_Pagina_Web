import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, urlImagen } from '../service/supabase';
import { normalizarTexto } from '../utils/texto';
import '../css/inicio.css';

/* ============================================================
   CONTENIDO EDITABLE
   Cambia los textos, íconos y categorías a gusto.
   ============================================================ */

// Franja de beneficios (íconos de Font Awesome)
const BENEFICIOS = [
  {
    icono: 'fa-wand-magic-sparkles',
    titulo: 'Piezas únicas',
    texto: 'Cada obra es irrepetible, hecha a mano.',
  },
  {
    icono: 'fa-hand-holding-heart',
    titulo: 'Hecho con dedicación',
    texto: 'Trabajos creados con tiempo y cariño.',
  },
  {
    icono: 'fa-lock',
    titulo: 'Pago seguro',
    texto: 'Paga con Mercado Pago, de forma simple.',
  },
  {
    icono: 'fa-box-open',
    titulo: 'Embalaje cuidado',
    texto: 'Protegemos cada pieza para que llegue perfecta.',
  },
];

// Categorías. "nombre" debe ser IGUAL al valor de la columna "categoria" en tu tabla de Supabase.
// "imagen": ruta dentro de public/ (ej. /images/categorias/ceramica.jpg) o nombre de archivo en tu bucket de Storage.
const CATEGORIAS = [
  {
    nombre: 'Cerámica',
    etiqueta: 'Arcilla & yeso',
    imagen: '/images/categorias/Ceramica.jpg',
  },
  {
    nombre: 'Textil',
    etiqueta: 'Crochet & tejidos',
    imagen: '/images/categorias/Textil.jpg',
  },
  {
    nombre: 'Madera',
    etiqueta: 'Talla & carpintería',
    imagen: '/images/categorias/Madera.jpg',
  },
  {
    nombre: 'Pintura',
    etiqueta: 'Óleo & acrílico',
    imagen: '/images/categorias/Pintura.jpg',
  },
  {
    nombre: 'Joyería',
    etiqueta: 'Piezas para llevar',
    imagen: '/images/categorias/Joyeria.jpg',
  },
  {
    nombre: 'Decoración',
    etiqueta: 'Para tu hogar',
    imagen: '/images/categorias/Decoracion.jpg',
  },
];

/* ============================================================ */

const textoDisponibles = (cantidad) => {
  if (cantidad === null) return 'Ver piezas'; // todavía no se pudo contar
  if (cantidad === 0) return 'Próximamente';
  return cantidad === 1 ? '1 pieza disponible' : `${cantidad} piezas disponibles`;
};

const CategoriaCard = ({ categoria, cantidad }) => {
  const [imagenFalla, setImagenFalla] = useState(false);
  const src = urlImagen(categoria.imagen);

  return (
    <Link
      to={`/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
      className="categoria-card"
      aria-label={`Ver ${categoria.nombre}`}
    >
      {src && !imagenFalla ? (
        <img
          src={src}
          alt=""
          className="categoria-imagen"
          loading="lazy"
          onError={() => setImagenFalla(true)}
        />
      ) : (
        // Si la imagen no existe todavía, se muestra un fondo de color para que el diseño no se rompa
        <div className="categoria-fondo" />
      )}

      <div className="categoria-velo" />

      <div className="categoria-texto">
        <span className="categoria-etiqueta">{categoria.etiqueta}</span>
        <h3 className="categoria-titulo">{categoria.nombre}</h3>
        <span className="categoria-cantidad">{textoDisponibles(cantidad)}</span>
      </div>

      <span className="categoria-flecha" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17L17 7M8 7h9v9" />
        </svg>
      </span>
    </Link>
  );
};

const Inicio = () => {
  // { ceramica: 3, textil: 1, ... } o null mientras carga / si no se pudo contar
  const [conteos, setConteos] = useState(null);

  useEffect(() => {
    let activo = true;

    const contarPorCategoria = async () => {
      const { data, error } = await supabase.from('pinturas').select('categoria, stock');

      if (!activo) return;

      if (error) {
        // Por ejemplo, si todavía no creaste la columna "categoria"
        console.warn('No se pudieron contar las piezas por categoría:', error.message);
        return;
      }

      const cuenta = {};
      for (const fila of data) {
        if (!fila.categoria) continue;
        if (fila.stock !== null && fila.stock <= 0) continue; // agotadas no cuentan como disponibles
        const clave = normalizarTexto(fila.categoria);
        cuenta[clave] = (cuenta[clave] || 0) + 1;
      }
      setConteos(cuenta);
    };

    contarPorCategoria();

    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="inicio">
      {/* ===== Franja de beneficios ===== */}
      <section className="beneficios" aria-label="Por qué elegirnos">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="beneficio">
            <span className="beneficio-icono" aria-hidden="true">
              <i className={`fa-solid ${b.icono}`}></i>
            </span>
            <div>
              <p className="beneficio-titulo">{b.titulo}</p>
              <p className="beneficio-texto">{b.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ===== Categorías ===== */}
      <section className="categorias" aria-labelledby="titulo-categorias">
        <div className="categorias-encabezado">
          <div>
            <span className="inicio-eyebrow">Hecho a mano</span>
            <h2 id="titulo-categorias" className="inicio-titulo">
              Explora nuestras categorías
            </h2>
          </div>
          <p className="categorias-descripcion">
            Obras y artesanías únicas, creadas con paciencia por manos que conocen su oficio.
          </p>
        </div>

        <div className="categorias-grid">
          {CATEGORIAS.map((categoria) => (
            <CategoriaCard
              key={categoria.nombre}
              categoria={categoria}
              cantidad={
                conteos ? conteos[normalizarTexto(categoria.nombre)] || 0 : null
              }
            />
          ))}
        </div>

        <div className="categorias-pie">
          <Link to="/productos" className="categorias-ver-todas">
            Ver todas las obras
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Inicio;