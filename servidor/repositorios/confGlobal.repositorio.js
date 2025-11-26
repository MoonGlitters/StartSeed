import { ConfiguracionGlobal } from '../configuracion/sequelize.js';

const CONFIG_ID = 1;


export const configuracionRepositorio = {
    getGlobalConfig: (t) => {
        return ConfiguracionGlobal.findByPk(CONFIG_ID, { transaction: t });
    },
    getMinDesembolsoMonto: async () => {
        const config = await ConfiguracionGlobal.findByPk(CONFIG_ID, { 
            attributes: ['monto_minimo_desembolso'] 
        });
        return config ? parseFloat(config.monto_minimo_desembolso) : 1;
    },

    updateConfig: async (newValues, t) =>{
    const config = await ConfiguracionGlobal.findByPk(1, { transaction: t });
    if (!config) throw new Error("Configuración global no encontrada.");

    return await config.update(newValues, { transaction: t });
    }
};