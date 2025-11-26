import { sequelize } from '../configuracion/sequelize.js';
import { getPaymentDetailsFromMP } from '../servicios/MercadoPago.servicio.js';
import { ventaRepositorio } from '../repositorios/venta.repositorio.js';
import { transaccionMPRepositorio } from '../repositorios/transaccionMP.repositorio.js';
import { enviarConfirmacionCompra } from '../servicios/notificacion.servicio.js';
import { inventarioRepositorio } from '../repositorios/inventario.repositorio.js';
import { carritoRepositorio } from '../repositorios/carrito.repositorio.js';

export const webhookMPController = async (req, res) => {
  const topic = req.body.type;
  const id = req.body.data?.id;

  console.log("Webhook recibido:", { topic, id });

  if (!topic || !id) {
    return res.status(400).json({
      success: false,
      message: "Parámetros incompletos en la notificación de Mercado Pago."
    });
  }

  if (topic !== "payment") {
    console.log(`Webhook ignorado: tipo no relevante (${topic}).`);
    return res.status(200).json({ success: true, message: "Tipo no procesado." });
  }

  try {
    // Obtener detalles del pago desde Mercado Pago
    const paymentDetails = await getPaymentDetailsFromMP(topic, id);
    if (!paymentDetails || !paymentDetails.external_reference) {
      console.error(`No se pudo obtener detalles del pago con ID: ${id}`);
      return res.status(400).json({
        success: false,
        message: "Datos incompletos en la respuesta de Mercado Pago."
      });
    }

    const idVenta = String(paymentDetails.external_reference).trim();
    const status = paymentDetails.status;

    // Evitar duplicación de transacciones
    const transaccionExistente = await transaccionMPRepositorio.findByPaymentId(paymentDetails.id);
    if (transaccionExistente) {
      console.warn(`Transacción ${paymentDetails.id} ya registrada. Webhook ignorado.`);
      return res.status(200).json({ success: true });
    }

    // Función para reintentar la búsqueda de la venta (por posibles retrasos de commit)
    const buscarVentaConReintento = async (id, t, intentos = 5, delayMs = 2000) => {
      for (let i = 0; i < intentos; i++) {
        const venta = await ventaRepositorio.findVentaById(id, t);
        console.log(venta)
        if (venta) return venta;
        console.warn(`Venta ${id} no encontrada. Reintentando (${i + 1}/${intentos})...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return null;
    };

    await sequelize.transaction(async (t) => {
      const venta = await buscarVentaConReintento(idVenta, t);
      console.log(venta)
      if (!venta) {
        console.error(`Venta ${idVenta} no encontrada después de múltiples intentos.`);
        return;
      }

      // Registrar transacción en base de datos
      await transaccionMPRepositorio.createTransaccionMP({
        id_venta: idVenta,
        payment_id: paymentDetails.id,
        status,
        status_detail: paymentDetails.status_detail,
        date_approved: paymentDetails.date_approved,
        payer_email: paymentDetails.payer?.email || null,
        mp_raw: paymentDetails,
        unique_key: `${idVenta}-${paymentDetails.id}`,
      }, t);

      // Determinar el nuevo estado de la venta
      const estadosValidos = ["Pendiente", "Pagado", "Completado"];
      if (!estadosValidos.includes(venta.estado)) {
        console.warn(`La venta ${idVenta} tiene un estado no modificable: ${venta.estado}`);
        return;
      }

      let nuevoEstado = venta.estado;
      if (status === "approved") nuevoEstado = "Pagado";
      else if (status === "rejected") nuevoEstado = "Cancelado";

      // Aplicar cambios solo si hay una transición real de estado
      if (nuevoEstado !== venta.estado) {
        const ventaActualizada = await ventaRepositorio.updateVentaStatus(
          venta,
          nuevoEstado,
          status,
          paymentDetails.date_approved || new Date(),
          t
        );
        console.log(ventaActualizada)

        if (nuevoEstado === "Pagado" && venta.estado !== "Completado") {
          console.log(`Venta ${idVenta} marcada como PAGADA.`);
          await enviarConfirmacionCompra(venta.id_usuario, idVenta);
          await carritoRepositorio.vaciarCarrito(venta.id_usuario, t);
        }

        if (nuevoEstado === "Cancelado") {
          console.log(`Venta ${idVenta} cancelada. Restaurando stock...`);
          await restaurarStock(idVenta, t);
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Webhook procesado correctamente."
    });

  } catch (error) {
    console.error("Error al procesar webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno al procesar el webhook.",
      error: error.message,
    });
  }
};

// Restaura stock si el pago es cancelado
const restaurarStock = async (id_venta, t) => {
  const detalles = await ventaRepositorio.findDetallesByVentaId(id_venta, t);
  for (const d of detalles) {
    const inventario = await inventarioRepositorio.findByProductoId(d.id_producto, t);
    if (inventario) {
      inventario.stock_actual += d.cantidad_comprada;
      await inventarioRepositorio.saveInventory(inventario, t);
      console.log(`Stock devuelto para producto ${d.id_producto}: +${d.cantidad_comprada}`);
    }
  }
};
