import { empresaRepositorio } from '../repositorios/empresa.repositorio.js';
import { 
    obtenerProductosActivos, 
    obtenerProductoDetalle,
    actualizarProductoEmpresa,
    obtenerProductosPorEmpresaId,
    crearProductoEmpresa, 
    desactivarProducto,
}  from '../servicios/productos.servicio.js';

export const productosAllController = async (req, res) => {
    try {
        const productos = await obtenerProductosActivos(); 
        
        return res.status(200).json({
            success: true,
            message: "Productos obtenidos con éxito",
            data: productos
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const productosIDController = async (req, res) => {
    try {
        const id = req.params.id; 
        
        const producto = await obtenerProductoDetalle(id);
        
        return res.status(200).json({
            success: true,
            message: "Producto obtenido con éxito",
            data: producto
        });
    } catch (error) {
        const status = error.message.includes('no encontrado') ? 404 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const crearProductoController = async (req, res) => {
    const { nombre, descripcion, precio, stock_inicial, stock_minimo, descuento } = req.body;
    const img_producto = req.file;
    const id_usuario = req.userid;

    try {
        const nuevoProducto = await crearProductoEmpresa(id_usuario, {
        nombre,
        descripcion,
        precio,
        stock_inicial,
        stock_minimo,
        descuento,
        }, img_producto);

        return res.status(201).json({
        success: true,
        message: "Producto creado con éxito",
        data: { id: nuevoProducto.id, nombre: nuevoProducto.nombre },
        });
    } catch (error) {
        const status = error.message.includes('empresa') ? 403 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
    };


export const modificarProductoController = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.userid;

    try {
        const productoActualizado = await actualizarProductoEmpresa(id, id_usuario, req.body);
        
        return res.status(200).json({
            success: true,
            message: "Producto y/o inventario actualizado con éxito",
            data: productoActualizado
        });
    } catch (error) {
        let status = 500;
        if (error.message.includes('no encontrado')) status = 404;
        if (error.message.includes('permiso')) status = 403;
        
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const desactivarProductoController = async (req, res) => {
    const { id } = req.params;
    const id_usuario = req.userid;

    try {
        await desactivarProducto(id, id_usuario);
        
        return res.status(200).json({
            success: true,
            message: "Producto desactivado (Soft Delete) con éxito. Ya no es visible al público.",
        });
    } catch (error) {
        let status = 500;
        if (error.message.includes('no encontrado')) status = 404;
        if (error.message.includes('permiso')) status = 403;
        if (error.message.includes('ya está inactivo')) status = 400;

        return res.status(status).json({ success: false, message: error.message });
    }
};

export const obtenerProductosEmpresaController = async (req, res) => {
    
    const id_usuario = req.userid; 
    try {
        const empresa = await empresaRepositorio.findByUserId(id_usuario);

        if (!empresa) {
            return res.status(404).json({ 
                success: false, 
                message: "No se encontró una empresa asociada a este usuario." 
            });
        }

        const productos = await obtenerProductosPorEmpresaId(empresa.id);

        return res.status(200).json({
            success: true,
            message: `Productos de la empresa ${empresa.nombre_fantasia || empresa.nombre} obtenidos con éxito.`,
            data: productos
        });

    } catch (error) {
        console.error("Error al obtener productos de la empresa:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error interno al procesar la solicitud." 
        });
    }
};

export const obtenerProductosEmpresaPublicController = async (req, res) => {
    const { id } = req.params
    
    try {
        const empresa = await empresaRepositorio.findById(id);

        if (!empresa) {
            return res.status(404).json({ 
                success: false, 
                message: "No se encontró la empresa." 
            });
        }

        const productos = await obtenerProductosPorEmpresaId(empresa.id);

        return res.status(200).json({
            success: true,
            message: `Productos de la empresa ${empresa.nombre_fantasia || empresa.nombre} obtenidos con éxito.`,
            data: productos
        });

    } catch (error) {
        console.error("Error al obtener productos de la empresa:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error interno al procesar la solicitud." 
        });
    }
};

