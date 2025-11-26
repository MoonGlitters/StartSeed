import { MercadoPagoConfig, Payment } from "mercadopago";
import { transaccionMPRepositorio } from "../repositorios/transaccionMP.repositorio.js";

export const processPaymentController = async (req, res) => {
  try {
    let { formData, id_venta } = req.body;

    if (!formData) {
      console.error("Falta formData en la solicitud:", req.body);
      return res.status(400).json({ error: "Falta formData en la solicitud" });
    }

    // Detecta si el Brick envió formData.anidado
    if (formData.formData) {
      console.log("Corrigiendo estructura de formData anidado...");
      formData = formData.formData;
    }

    // Añade el external_reference con el id de la venta
    formData.external_reference = id_venta;

    console.log("Payload limpio enviado a MP:", JSON.stringify(formData, null, 2));

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const payment = new Payment(client);

    // Mercado Pago recibe el body correcto
    const response = await payment.create({ body: formData });
    const existente = await transaccionMPRepositorio.findByPaymentId(response.id);
    if (existente) {
      console.log(`Pago duplicado (${response.id}) ignorado`);
      return res.status(200).json({
        message: "Pago ya registrado",
        status: existente.status,
      });
    }

    console.log("Pago procesado correctamente:", {
      id: response.id,
      status: response.status,
      external_reference: response.external_reference,
    });

    return res.status(200).json({
      id: response.id,
      status: response.status,
      external_reference: response.external_reference,
    });
  } catch (error) {
      console.error("Error en processPaymentController:", error);
      return res.status(500).json({
        error: "Error al procesar el pago en Mercado Pago",
        details: error.message,
      });
  }
};
