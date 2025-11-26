import { comentarioRepositorio } from "../repositorios/comentarioEmp.repositorio.js";
import { empresaRepositorio } from "../repositorios/empresa.repositorio.js";
import { ventaRepositorio } from "../repositorios/venta.repositorio.js";
import { Op } from "sequelize";

export const crearComentario = async (id_usuario, id_empresa, contenido, calificacion) => {
    const empresa = await empresaRepositorio.findById(id_empresa);
    if (!empresa) throw new Error("La empresa no existe.");

    const ventas = await ventaRepositorio.findVentasPorEmpresaUsuario(id_usuario, id_empresa);
    if (!ventas || ventas.length === 0) {
        throw new Error("No puedes comentar esta empresa porque no has comprado productos de ella.");
    }

    const idsVentas = ventas.map(v => v.id);

    const comentarioExistente = await comentarioRepositorio.findOne({
        where: {
        id_usuario,
        id_empresa,
        id_venta: { [Op.in]: idsVentas },
        },
    });


    if (comentarioExistente) {
        throw new Error("Ya has comentado esta empresa anteriormente.");
    }

    const ventaMasReciente = ventas.reduce((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? a : b
    );

    return await comentarioRepositorio.crearComentario(
        { id_usuario, id_empresa,id_venta: ventaMasReciente.id, contenido, calificacion }
    );
}

export const obtenerComentarios = async (id_empresa) => {
    return await comentarioRepositorio.obtenerComentariosPorEmpresa(id_empresa);
}

export const obtenerPromedioEmpresa = async (id_empresa) => {
    return await comentarioRepositorio.obtenerPromedioCalificacionEmpresa(id_empresa);
}