import { Desembolso, Empresa } from '../configuracion/sequelize.js';

export const desembolsoRepositorio = {
    
    createDesembolsoRequest: (data, t) => {
        return Desembolso.create(data, { transaction: t });
    },

    findDesembolsoById: (id, t) => {
        return Desembolso.findByPk(id, { 
            include: [{ model: Empresa, as: 'empresa' }], 
            transaction: t 
        });
    },
    findPendingDesembolsos: () => {
        return Desembolso.findAll({
            where: { status: 'Pendiente' },
            include: [{ 
                model: Empresa, 
                as: 'empresa', 
                attributes: ['id', 'nombre'] 
            }],
            order: [['fecha_solicitud', 'ASC']]
        });
    },

    findPendingDesembolsosByEmpresa: async (idEmpresa) => {
        return Desembolso.findAll({
            where: { 
                id_empresa: idEmpresa,
                status: 'Pendiente'
            }
        });
    },

    findCompletedDesembolsosByEmpresa: async (idEmpresa) => {
        return Desembolso.findAll({
            where: { 
                id_empresa: idEmpresa,
                status: 'Completado'
            },
            attributes: ['id', 'monto_solicitado', 'fecha_aprobacion', 'createdAt', 'comentario_admin'],
            order: [['fecha_aprobacion', 'DESC']]
        });
    }
};