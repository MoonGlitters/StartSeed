import { Sequelize } from "sequelize";
import { ComentarioProducto, Usuario } from "../configuracion/sequelize.js";

export const comentarioProductoRepositorio = {
    findOne: (options) => ComentarioProducto.findOne(options),
    
    async crearComentario(data, t) {
        return await ComentarioProducto.create(data, { transaction: t });
    },

    async obtenerComentariosPorProducto(id_producto) {
        return await ComentarioProducto.findAll({
        where: { id_producto },
        include: [
            { model: Usuario, as: "usuario", attributes: ["id", "nombre"] },
        ],
        order: [["createdAt", "DESC"]]
        });
    },
    async obtenerPromedioCalificacionProducto(id_producto) {
        const result = await ComentarioProducto.findOne({
        attributes: [
            [Sequelize.fn("AVG", Sequelize.col("calificacion")), "promedio"],
            [Sequelize.fn("COUNT", Sequelize.col("id")), "total"]
        ],
        where: { id_producto },
        raw: true
        });
        return {
        promedio: result.promedio ? parseFloat(result.promedio).toFixed(1) : null,
        total: parseInt(result.total, 10) || 0
        };
    }
};