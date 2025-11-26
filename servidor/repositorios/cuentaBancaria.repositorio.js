import { CuentaBancaria } from '../configuracion/sequelize.js';

export const cuentaBancariaRepositorio = {

    upsert: async (idEmpresa, datosBancarios) => {
        const [cuenta, created] = await CuentaBancaria.findOrCreate({
            where: { id_empresa: idEmpresa },
            defaults: { ...datosBancarios, id_empresa: idEmpresa }
        });
        if (!created) {
            await cuenta.update(datosBancarios);
        }
        
        return cuenta;
    },
    findByEmpresaId: async (idEmpresa, t = null) => {
        return CuentaBancaria.findOne({ where: { id_empresa: idEmpresa }, transaction: t });
    }
};