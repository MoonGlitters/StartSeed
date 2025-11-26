import { Op } from 'sequelize';
import { Usuario } from '../configuracion/sequelize.js';

export const usuarioRepositorio = {
    
    findByEmail: async (email) => {
        return Usuario.findOne({ where: { email } });
    },

    findById: async (id, options = {}) => {
        return await Usuario.findOne({ where: { id }, ...options });
    },
    create: async (userData) => {
        return Usuario.create(userData);
    },

    save: async (usuario) => {
        return usuario.save();
    },

    updateUserStatusAndExpiry: async (userId, status, suspension_expira_at, options = {}) => {
    return  await Usuario.update(
        { estado: status, suspension_expira_at: suspension_expira_at },
        { where: { id: userId }, ...options }
        );
    },

    async findUsuariosSuspendidosVencidos(t) {
        return await Usuario.findAll({
        where: {
            estado: "suspendida",
            suspension_expira_at: { [Op.lte]: new Date() }
        },
        transaction: t
        });
    },

    async reactivarUsuario(user, t) {
        return await user.update(
        { estado: "activa", suspension_expira_at: null },
        { transaction: t }
        );
    }
};