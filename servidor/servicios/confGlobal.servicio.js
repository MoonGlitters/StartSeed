import { sequelize } from "../configuracion/sequelize.js";
import { configuracionRepositorio } from "../repositorios/confGlobal.repositorio.js";


export const obtenerConfiguracion = async () => {
    return await sequelize.transaction(async (t) => {
        const config = await configuracionRepositorio.getGlobalConfig(t);
        if (!config) throw new Error("No se encontró la configuración global.");
        return config;
    });
}

export const actualizarConfiguracion = async (data) => {
    return await sequelize.transaction(async (t) => {
        const permitidos = [
            "iva_porcentaje",
            "comision_porcentaje",
            "sitio_en_mantenimiento",
            "mensaje_mantenimiento",
            "costo_envio_base",
            "monto_minimo_envio_gratis",
            "monto_minimo_desembolso",
            "dias_max_devolucion"
        ];

        const valores = {};
        for (const campo of permitidos) {
            if (data[campo] !== undefined) valores[campo] = data[campo];
        }

        return await configuracionRepositorio.updateConfig(valores, t);
    });
}