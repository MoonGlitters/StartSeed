import { ventaRepositorio } from "../repositorios/venta.repositorio.js";
import { checkoutServicio } from "../servicios/checkout.servicio.js";
import { crearPreferenciaMP } from "../servicios/MercadoPago.servicio.js";

export const checkoutController = async (req, res) => {
    const id_usuario = req.userid;

    try {
        const { id_venta, total_compra, mpItems } = await checkoutServicio(id_usuario);
        const preferenceId = await crearPreferenciaMP(mpItems, id_venta);

        await ventaRepositorio.updateVentaReferencia(id_venta, preferenceId);

        return res.status(200).json({
            success: true,
            id_venta,
            total: total_compra,
            preferenceId,
        });
    } catch (error) {
        let status = 400;
        if (error.message.includes("insuficiente") || error.message.includes("vacío")) status = status;
        if (error.message.includes("MP")) status = 503;

        console.error("Error en el Checkout:", error.message);
        return res.status(status).json({
            success: false,
            message: error.message,
        });
    }
    };


