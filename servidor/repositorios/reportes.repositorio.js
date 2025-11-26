import { Venta, Desembolso, sequelize } from '../configuracion/sequelize.js';

export const reportesRepositorio = {

    getDatosFinancierosGlobales: async () => {
        const [totalesVentas] = await Venta.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalVentasBruto'],
                [sequelize.fn('SUM', sequelize.col('monto_comision')), 'totalComisionRetenida']
            ],
            raw: true
        });
    
        const [totalesDesembolsos] = await Desembolso.findAll({
            where: { status: 'Completado' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('monto_solicitado')), 'totalDesembolsado']
            ],
            raw: true
        });
    
        return {
            totalVentasBruto: parseFloat(totalesVentas.totalVentasBruto || 0).toFixed(2),
            totalComisionRetenida: parseFloat(totalesVentas.totalComisionRetenida || 0).toFixed(2),
            totalDesembolsado: parseFloat(totalesDesembolsos.totalDesembolsado || 0).toFixed(2),
        };
    },

    getVentasHistoricasByEmpresa: async (empresaId) => {
    return Venta.findAll({
        where: { id_usuario: empresaId },
        attributes: [
            'id', 
            'subtotal', 
            'monto_comision', 
            'estado_pago_empresa',
            'createdAt'
        ],
        order: [['createdAt', 'DESC']]
    })}
}