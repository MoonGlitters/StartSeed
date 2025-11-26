import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from "mercadopago";
import "dotenv/config";

// Validaciones basicas del entorno
if (!process.env.MP_ACCESS_TOKEN) {
  console.error("ERROR: Falta MP_ACCESS_TOKEN en el archivo .env");
}
if (!process.env.FRONTEND_URL || !process.env.BACKEND_URL) {
  console.error("ERROR: FRONTEND_URL o BACKEND_URL no están definidas en .env");
}

// Inicializacion del cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
});

const preferenceClient = new Preference(client);
const paymentClient = new Payment(client);
const merchantOrderClient = new MerchantOrder(client);

// Obtiene los detalles de un pago o una orden, webhook
export const getPaymentDetailsFromMP = async (topic, id) => {
  console.log(`[MP API] onsultando datos para topic="${topic}", ID=${id}`);

  try {
    let paymentDetails = null;

    // --- 🔹 Caso 1: Notificación directa de pago ---
    if (topic === "payment") {
      const payment = await paymentClient.get({ id });
      paymentDetails = payment;
      console.log(`[MP API] Pago ID ${id} consultado. Estado: ${payment?.status}`);

    // --- 🔹 Caso 2: Notificación de merchant_order ---
    } else if (topic === "merchant_order") {
      const order = await merchantOrderClient.get({ id });

      if (!order?.payments?.length) {
        console.warn(`[MP API] Merchant Order ${id} sin pagos asociados.`);
        return null;
      }

      // Toma el primer pago relevante (approved o pending)
      const firstPayment = order.payments.find(
        (p) => p.status === "approved" || p.status === "pending"
      );

      if (!firstPayment) {
        console.warn(`[MP API] ⚠️ No hay pagos 'approved' o 'pending' en Order ${id}.`);
        return null;
      }

      const payment = await paymentClient.get({ id: firstPayment.id });
      paymentDetails = payment;
      console.log(`[MP API] Pago asociado encontrado. ID=${firstPayment.id}, Estado=${payment?.status}`);
    }

    if (paymentDetails?.external_reference) {
      console.log(`[MP API] external_reference = ${paymentDetails.external_reference}`);
    } else {
      console.warn(`[MP API] No se encontró external_reference en los datos del pago.`);
    }

    return paymentDetails;

  } catch (error) {
    // --- 🚨 Manejo robusto de errores ---
    console.error(`[MP API ERROR] Falla consultando ID ${id}:`, error.message);

    if (error.status) {
      console.error(`[MP API ERROR] Código HTTP: ${error.status}`);
    }

    if (error.message?.includes("401")) {
      console.error(`[MP API ERROR] Error 401 — Token inválido o mal configurado.`);
    }

    if (error.response?.data) {
      console.error(`[MP API ERROR] Respuesta API MP:`, error.response.data);
    }

    return null;
  }
};

// Crea una preferencia de pago

export const crearPreferenciaMP = async (items, id_venta) => {
  try {
    const frontendURL = process.env.FRONTEND_URL?.replace(/\/$/, "");
    const backendURL = process.env.BACKEND_URL?.replace(/\/$/, "");

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La lista de ítems está vacía o no es válida");
    }

    if (!id_venta) {
      throw new Error("Falta el ID de la venta (external_reference)");
    }

    const preferenceData = {
      items: items.map((item) => ({
        title: item.title || item.nombre || "Producto",
        unit_price: Math.round(item.unit_price || item.precio || 0),
        quantity: Number(item.quantity || item.cantidad || 1),
        currency_id: "CLP",
      })),
      back_urls: {
        success: `${frontendURL}/pago/exitoso`,
        failure: `${frontendURL}/pago/fallido`,
        pending: `${frontendURL}/pago/pendiente`,
      },
      auto_return: "approved",
      external_reference: String(id_venta),
      notification_url: `${backendURL}/api/pago/mp/pago`,
      binary_mode: true,
    };

    console.log("✅ Creando preferencia con:", {
      frontend: frontendURL,
      backend: backendURL,
      venta: id_venta,
      items: preferenceData.items.length,
    });

    const response = await preferenceClient.create({ body: preferenceData });
    const preferenceId = response?.id || response?.body?.id;

    if (!preferenceId) throw new Error("No se recibió un ID de preferencia válido de MP.");

    return preferenceId;

  } catch (error) {
    console.error("Error al crear preferencia en Mercado Pago:", error);
    throw new Error("Error creando preferencia en Mercado Pago: " + error.message);
  }
};
