import { comentarioProductoRepositorio } from "../repositorios/comentarioPro.repositorio.js";
import { productoRepositorio } from "../repositorios/producto.repositorio.js";
import { ventaRepositorio } from '../repositorios/venta.repositorio.js';
import { Op } from "sequelize";


export const crearComentarioProducto = async (id_usuario, id_producto, contenido, calificacion) => {
    const ventas = await ventaRepositorio.findVentasPorProductoUsuario(id_usuario, id_producto);
    if (!ventas || ventas.length === 0) {
        throw new Error("No puedes comentar este producto porque no lo has comprado.");
    }

    const idsVentas = ventas.map(v => v.id);
    const comentarioExistente = await comentarioProductoRepositorio.findOne({
    where: {
        id_usuario,
        id_producto,
        id_venta: { [Op.in]: idsVentas }
    }
    });

    if (comentarioExistente) {
    throw new Error("Ya has comentado este producto anteriormente.");
    }

    const ventaMasReciente = ventas.reduce((a, b) =>
    new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );
    
    const producto = await productoRepositorio.findById(id_producto);
    if (!producto) {
    throw new Error("El producto no existe.");
    }

    return await comentarioProductoRepositorio.crearComentario({
    id_usuario,
    id_producto,
    id_venta: ventaMasReciente.id,
    contenido,
    calificacion
    });
};

export const obtenerComentariosProducto = async (id_producto) => {
    return await comentarioProductoRepositorio.obtenerComentariosPorProducto(id_producto);
}

export const obtenerPromedioProducto = async (id_producto) => {
    return await comentarioProductoRepositorio.obtenerPromedioCalificacionProducto(id_producto);
    
}