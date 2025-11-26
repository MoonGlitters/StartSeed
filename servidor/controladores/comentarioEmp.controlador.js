import { crearComentario, obtenerComentarios, obtenerPromedioEmpresa } from "../servicios/comentarioEmp.servicio.js";

export const crearComentarioController = async (req, res) => {
    try {
        const id_usuario = req.userid;
        const { id_empresa, contenido, calificacion } = req.body;

        const comentario = await crearComentario(
        id_usuario,
        id_empresa,
        contenido,
        calificacion
        );

        return res.status(201).json({ success: true, comentario });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const obtenerComentariosController = async (req, res) => {

    try {
        const { id_empresa } = req.params;

        const comentarios = await obtenerComentarios(id_empresa);

        return res.status(200).json({ success: true, comentarios });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const obtenerPromedioEmpresaController = async (req, res) => {
    try {
        const { id_empresa } = req.params;
        const promedio = await obtenerPromedioEmpresa(id_empresa);

        return res.status(200).json({ success: true, id_empresa, promedio: promedio.promedio, comentarios: promedio.total });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};