import { actualizarConfiguracion, obtenerConfiguracion } from "../servicios/confGlobal.servicio.js";


export const obtenerConfiguracionController = async (req, res) => {
    try {
        const config = await obtenerConfiguracion();
        return res.status(200).json({ success: true, config });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const actualizarConfiguracionController = async (req, res) => {
    try {
        const nuevaConfig = await actualizarConfiguracion(req.body);
        return res.status(200).json({ success: true, config: nuevaConfig });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};