import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { Container, Typography, IconButton, Button, TextField } from '@mui/material';
import {
  CODIGOS,
  formatear,
  precioDeItem,
  subtotalCarrito,
  descuentoCarrito,
} from '../utils/carritoUtils';
import '../css/carrito.css';

const Carrito = () => {
  const { carrito, eliminarDelCarrito, actualizarCantidad } = useContext(CarritoContext);
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [descuento, setDescuento] = useState(null); // { codigo, porcentaje }
  const [errorCodigo, setErrorCodigo] = useState('');

  const totalUnidades = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const subtotal = subtotalCarrito(carrito);
  const montoDescuento = descuentoCarrito(carrito, descuento ? descuento.porcentaje : 0);
  const total = subtotal - montoDescuento;

  const aplicarCodigo = (e) => {
    e.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (!limpio) return;

    if (CODIGOS[limpio]) {
      setDescuento({ codigo: limpio, porcentaje: CODIGOS[limpio] });
      setErrorCodigo('');
    } else {
      setDescuento(null);
      setErrorCodigo('El código no es válido');
    }
  };

  // Pasa a la pantalla de datos de envío (el pago se inicia ahí)
  const continuarCompra = () => {
    navigate('/checkout', { state: { codigo: descuento ? descuento.codigo : null } });
  };

  /* ===== Carrito vacío ===== */
  if (carrito.length === 0) {
    return (
      <Container className="carrito-vacio">
        <i className="fa-solid fa-cart-shopping carrito-vacio-icono"></i>
        <Typography variant="h5" fontWeight="bold">
          Tu carrito está vacío
        </Typography>
        <Typography color="text.secondary">Cuando agregues una obra, la verás aquí.</Typography>
        <Button component={Link} to="/" variant="contained" className="carrito-btn-principal">
          Ver pinturas
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="carrito-container">
      <h1 className="carrito-titulo">Carrito de compras</h1>

      <div className="carrito-layout">
        {/* ===== Izquierda: productos ===== */}
        <section className="carrito-lista" aria-label="Productos en el carrito">
          {carrito.map((item) => {
            const imagen = item.img || item.imagen || item.url || '/images/default.png';
            const nombre = item.nombre || item.titulo || item.name || 'Producto sin nombre';
            const cantidad = item.cantidad || 1;
            const precioUnitario = precioDeItem(item);

            return (
              <article key={item.id} className="carrito-item">
                <div className="carrito-item-img-container">
                  <img
                    src={imagen}
                    alt={nombre}
                    className="carrito-item-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/default.png';
                    }}
                  />
                </div>

                <div className="carrito-item-info">
                  <h2 className="carrito-item-nombre">{nombre}</h2>
                  <p className="carrito-item-unitario">{formatear(precioUnitario)} c/u</p>
                  <Button
                    size="small"
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="carrito-btn-eliminar"
                    startIcon={<i className="fa-regular fa-trash-can"></i>}
                    aria-label={`Eliminar ${nombre} del carrito`}
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="carrito-cantidad-selector">
                  <IconButton
                    onClick={() => actualizarCantidad(item.id, cantidad - 1)}
                    disabled={cantidad <= 1}
                    className="carrito-btn-cantidad"
                    aria-label="Restar una unidad"
                  >
                    <i className="fa-solid fa-minus" style={{ fontSize: '0.8rem' }}></i>
                  </IconButton>
                  <span className="carrito-cantidad-numero">{cantidad}</span>
                  <IconButton
                    onClick={() => actualizarCantidad(item.id, cantidad + 1)}
                    className="carrito-btn-cantidad"
                    aria-label="Sumar una unidad"
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: '0.8rem' }}></i>
                  </IconButton>
                </div>

                <p className="carrito-item-precio">{formatear(precioUnitario * cantidad)}</p>
              </article>
            );
          })}
        </section>

        {/* ===== Derecha: resumen + código ===== */}
        <aside className="carrito-lateral">
          <div className="carrito-caja">
            <h2 className="carrito-caja-titulo">Resumen de compra</h2>

            <div className="carrito-resumen-fila">
              <span>Productos ({totalUnidades})</span>
              <span>{formatear(subtotal)}</span>
            </div>

            {descuento && (
              <div className="carrito-resumen-fila carrito-resumen-descuento">
                <span>Descuento ({descuento.porcentaje}%)</span>
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
              variant="contained"
              fullWidth
              size="large"
              className="carrito-btn-principal"
              onClick={continuarCompra}
            >
              Continuar compra
            </Button>

            <p className="carrito-seguir">
              o{' '}
              <Link to="/" className="carrito-seguir-link">
                Seguir comprando
              </Link>
            </p>
          </div>

          <form className="carrito-caja" onSubmit={aplicarCodigo}>
            <label htmlFor="codigo-descuento" className="carrito-codigo-label">
              ¿Tienes un código de descuento?
            </label>
            <TextField
              id="codigo-descuento"
              size="small"
              fullWidth
              placeholder="Ingresa tu código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              error={Boolean(errorCodigo)}
              helperText={errorCodigo || (descuento ? `Código ${descuento.codigo} aplicado` : ' ')}
              className="carrito-codigo-input"
            />
            <Button type="submit" variant="outlined" fullWidth className="carrito-btn-secundario">
              Aplicar descuento
            </Button>
          </form>
        </aside>
      </div>
    </Container>
  );
};

export default Carrito;