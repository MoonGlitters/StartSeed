import { sequelize } from "../configuracion/sequelize.js";
import { inventarioRepositorio } from '../repositorios/inventario.repositorio.js';
import { carritoRepositorio } from '../repositorios/carrito.repositorio.js'; 
import { ventaRepositorio } from "../repositorios/venta.repositorio.js";
import { configuracionRepositorio } from "../repositorios/confGlobal.repositorio.js";
import { usuarioRepositorio } from "../repositorios/usuario.repositorio.js";

export const checkoutServicio = async (id_usuario) => {
  return await sequelize.transaction(async (t) => {

    // NUEVO SI FALLA SE BORRA
    const usuario = await usuarioRepositorio.findById(id_usuario, t);
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }
    if (!usuario.calle || !usuario.comuna || !usuario.region) {
      throw new Error(
        "Debe registrar una dirección completa (calle, comuna y región) antes de finalizar la compra."
      );
    }
    // Hasta AQUI

    const carrito = await carritoRepositorio.obtenerCarritoConProductos(id_usuario, t);
    validarCarrito(carrito);

    const config = await configuracionRepositorio.getGlobalConfig(t);
    if (!config) {
      throw new Error('Error crítico: La configuración de la plataforma no está disponible.');
    }

   const ventaPendiente = await ventaRepositorio.findVentaPendientePorUsuario(id_usuario);
    if (ventaPendiente) {
      console.log(`Eliminando venta pendiente anterior: ${ventaPendiente.id}`);
      await ventaPendiente.destroy({ transaction: t });
    }

    //  Continuar normalmente creando una nueva venta
    const calculos = await procesarStockYCalcularTotales(carrito.productos, config, t);
    const venta = await crearVenta(id_usuario, calculos, t);

    // NUEVO SI FALLA SE BORRA
    await ventaRepositorio.asociarDireccionVenta(venta.id, usuario, t);
    // HASTA AQUI

    await crearDetalleVenta(venta.id, carrito.productos, t);

    const iva_pct = parseFloat(config.iva_porcentaje) / 100;

    const mpItems = carrito.productos.map(p => {
      const precioFinalUnitario = parseFloat(p.precio) * (1 + iva_pct);
      return {
        title: p.nombre,
        quantity: p.CarritoProducto.cantidad,
        currency_id: "CLP",
        unit_price: Math.round(precioFinalUnitario * 100) / 100
      };
    });

    return {
      id_venta: venta.id,
      total_compra: venta.total_compra,
      mpItems: mpItems
    };
  });
};

const validarCarrito = (carrito) => {
  if (!carrito || !carrito.productos || carrito.productos.length === 0) {
    throw new Error("Carrito vacío o no encontrado.");
  }
};

const procesarStockYCalcularTotales = async (productosEnCarrito, config, t) => {
  let subtotalAcumulado = 0;

  for (const p of productosEnCarrito) {
    const cantidadEnCarrito = p.CarritoProducto.cantidad;
    const inventario = p.inventario;

    if (p.estado !== 'activo' || !inventario) {
      throw new Error(`El producto "${p.nombre}" no está disponible o activo.`);
    }
    if (inventario.stock_actual < cantidadEnCarrito) {
      throw new Error(`Stock insuficiente para el producto "${p.nombre}". Disponible: ${inventario.stock_actual}`);
    }

    inventario.stock_actual -= cantidadEnCarrito;
    await inventarioRepositorio.saveInventory(inventario, t);

    subtotalAcumulado += parseFloat(p.precio) * cantidadEnCarrito;
  }

  const iva_pct = parseFloat(config.iva_porcentaje) / 100;
  const comision_pct = parseFloat(config.comision_porcentaje) / 100;

  const monto_iva = subtotalAcumulado * iva_pct;
  const monto_comision = subtotalAcumulado * comision_pct;
  const total_compra = subtotalAcumulado + monto_iva;

  return {
    subtotal: Math.round(subtotalAcumulado * 100) / 100,
    monto_iva: Math.round(monto_iva * 100) / 100,
    monto_comision: Math.round(monto_comision * 100) / 100,
    total_compra: Math.round(total_compra * 100) / 100
  };
};

const crearVenta = (id_usuario, calculos, t) => {
  const ventaData = {
    id_usuario,
    subtotal: calculos.subtotal,
    monto_iva: calculos.monto_iva,
    monto_comision: calculos.monto_comision,
    total_compra: calculos.total_compra,
    estado: "Pendiente",
    status_pago: "Pendiente"
  };

  return ventaRepositorio.createVenta(ventaData, t);
};

const crearDetalleVenta = async (id_venta, productos, t) => {
  const detalles = productos.map(p => ({
    id_venta: id_venta,
    id_producto: p.id,
    id_empresa: p.id_empresa,
    nombre_producto: p.nombre,
    precio_unitario_compra: p.precio,
    cantidad_comprada: p.CarritoProducto.cantidad
  }));

  await ventaRepositorio.createDetallesVenta(detalles, t);
};
