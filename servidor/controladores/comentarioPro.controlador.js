import { crearComentarioProducto, obtenerComentariosProducto, obtenerPromedioProducto } from "../servicios/comentarioPro.servicio.js";

export const crearComentarioProductoController = async (req, res) => {
    try {
        const id_usuario = req.userid;
        const { id_producto, contenido, calificacion } = req.body;
        
        const comentario = await crearComentarioProducto(
        id_usuario,
        id_producto,
        contenido,
        calificacion
        );

        return res.status(201).json({ success: true, comentario });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export const obtenerComentariosProductoController = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const comentarios = await obtenerComentariosProducto(id_producto);

        return res.status(200).json({ success: true, comentarios });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const obtenerPromedioProductoController = async (req, res) => {
    try {
        const { id_producto } = req.params;
        const promedio = await obtenerPromedioProducto(id_producto);

        return res.status(200).json({ success: true, id_producto, promedio: promedio.promedio, comentarios: promedio.total });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};