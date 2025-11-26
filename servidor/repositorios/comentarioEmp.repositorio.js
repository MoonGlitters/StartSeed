import { Sequelize } from "sequelize";
import { Comentario, Usuario } from "../configuracion/sequelize.js";

export const comentarioRepositorio = {
    findOne: (options) => Comentario.findOne(options),
    
    async crearComentario(data, t) {
        return await Comentario.create(data, { transaction: t });
    },

    async obtenerComentariosPorEmpresa(id_empresa) {
        return await Comentario.findAll({
        where: { id_empresa },
        include: [
            { model: Usuario, as: "usuario", attributes: ["id", "nombre"] },
        ],
        order: [["createdAt", "DESC"]],
        });
    },

    obtenerPromedioCalificacionEmpresa: async(id_empresa) => {
    const result = await Comentario.findOne({
        attributes: [
            [Sequelize.fn("AVG", Sequelize.col("calificacion")), "promedio"],
            [Sequelize.fn("COUNT", Sequelize.col("id")), "total"]
        ],
        where: { id_empresa },
        raw: true
    });
    return {
        promedio: result.promedio ? parseFloat(result.promedio).toFixed(1) : null,
        total: parseInt(result.total, 10) || 0
    }
    }
};