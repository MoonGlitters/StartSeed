import { Solicitud, Usuario } from '../configuracion/sequelize.js';

export const solicitudRepositorio = {
    
    findPendingByUserId: async (userId) => {
        return Solicitud.findOne({
            where: {
                id_usuario: userId,
                estado: 'pendiente'
            }
        });
    },

    create: async (solicitudData) => {
        return Solicitud.create(solicitudData);
    },

    findByIdWithUser: async (id) => {
        return Solicitud.findOne({
            where: { id: id },
            include: [{ model: Usuario, as: 'creador' }]
        });
    },

    findLatestByUserId: async (userId) => {
        return Solicitud.findOne({
            where: { id_usuario: userId },
            order: [['created_at', 'DESC']]
        });
    },

    save: async (solicitud) => {
        return solicitud.save();
    },

    findAllByUserId: async (userId) => {
        return Solicitud.findAll({
            where: { id_usuario: userId },
            order: [['created_at', 'DESC']]
        });
    },

    findAll: async () => {
        return Solicitud.findAll({
            include: [{ model: Usuario, as: 'creador', attributes: ['id', 'username', 'email'] }],
            order: [['estado', 'ASC'], ['created_at', 'ASC']]
        });
    }
};