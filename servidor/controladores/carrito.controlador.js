
import { 
    obtenerContenidoCarrito,
    agregarProductoAlCarrito,
    actualizarCantidadItem,
    eliminarProductoDelCarrito,
    vaciarCarrito
} from '../servicios/carrito.servicio.js';


export const obtenerCarritoController = async (req, res) => {
    try {
        const { items } = await obtenerContenidoCarrito(req.userid);
        return res.status(200).json({
        success: true,
        message: items?.length ? 'Carrito obtenido.' : 'El carrito está vacío.',
        items: items || [],
        });
    } catch (error) {
        console.error('Error en obtenerCarritoController:', error);
        return res.status(500).json({
        success: false,
        message: 'Error interno al obtener carrito.',
        error: error.message,
        });
    }
    };

export const agregarItemController = async (req, res) => {

    const { id_producto, cantidad = 1 } = req.body;
    
    try {
        const { item, itemCreated } = await agregarProductoAlCarrito(req.userid, id_producto, cantidad);
        
        const accion = itemCreated ? "agregado" : "cantidad actualizada";
        return res.status(200).json({ success: true, message: `Producto ${accion} al carrito.`, item: item });
    } catch (error) {
        let status = 500;
        if (error.message.includes('disponible') || error.message.includes('encontrado')) status = 404;
        if (error.message.includes('stock')) status = 400;

        return res.status(status).json({ success: false, message: error.message });
    }
};

export const actualizarItemController = async (req, res) => {
    const { itemId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad < 1) {
        return res.status(400).json({ success: false, message: 'Cantidad inválida.' });
    }

    try {
        const itemActualizado = await actualizarCantidadItem(req.userid, itemId, cantidad);
        
        return res.status(200).json({ success: true, message: 'Cantidad actualizada.', item: itemActualizado });
    } catch (error) {
        let status = 500;
        if (error.message.includes('encontrado')) status = 404;
        if (error.message.includes('stock')) status = 400;

        return res.status(status).json({ success: false, message: error.message });
    }
};

export const eliminarItemController = async (req, res) => {
    const { itemId } = req.params;
    
    try {
        await eliminarProductoDelCarrito(req.userid, itemId);
        
        return res.status(200).json({ success: true, message: 'Ítem eliminado del carrito exitosamente.' });
    } catch (error) {
        const status = error.message.includes('encontrado') ? 404 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const vaciarCarritoController = async (req, res) => {
    try {
        await vaciarCarrito(req.userid);
        
        return res.status(200).json({ success: true, message: 'Carrito vaciado exitosamente.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};