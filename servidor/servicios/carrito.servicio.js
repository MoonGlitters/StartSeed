import { carritoRepositorio } from '../repositorios/carrito.repositorio.js';
import { productoRepositorio } from '../repositorios/producto.repositorio.js';



export const obtenerContenidoCarrito = async (userId) => {
    const carrito = await carritoRepositorio.findCarritoWithItems(userId);
    
    if (!carrito) {
        return { items: [] };
    }

    const contenidoCarrito = carrito.items.map(item => ({
        itemId: item.id,
        cantidad: item.cantidad,
        producto: item.producto,
    }));
    
    return { items: contenidoCarrito };
}

export const agregarProductoAlCarrito= async (userId, productoId, cantidad) => {

    const producto = await productoRepositorio.findProductoWithStock(productoId);

    if (!producto || producto.estado !== 'activo') {
        throw new Error('Este producto no está disponible.');
    }
    if (!producto.inventario || producto.inventario.stock_actual < cantidad) {
        throw new Error('Stock insuficiente.');
    }

    const [carrito] = await carritoRepositorio.findOrCreateCarrito(userId);
    
    const [item, itemCreated] = await carritoRepositorio.findOrCreateItem(carrito.id, productoId, cantidad);

    if (!itemCreated) {
        const nuevaCantidad = item.cantidad + cantidad;
        if (producto.inventario.stock_actual < nuevaCantidad) {
            throw new Error('Stock insuficiente para la cantidad total.');
        }
        item.cantidad = nuevaCantidad; 
        await carritoRepositorio.saveItem(item);
    }
    
    return { item, itemCreated };
}

export const actualizarCantidadItem = async (userId, itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
        throw new Error('La cantidad debe ser al menos 1.');
    }

    const [carrito, item] = await Promise.all([
        carritoRepositorio.findOrCreateCarrito(userId),
        carritoRepositorio.findItemById(itemId, (await carritoRepositorio.findOrCreateCarrito(userId))[0].id) 
    ]);
    
    if (!item) throw new Error('Ítem no encontrado en el carrito.'); 

    const producto = await productoRepositorio.findProductoWithStock(item.id_producto);
    if (!producto.inventario || producto.inventario.stock_actual < nuevaCantidad) {
        throw new Error('Stock insuficiente.');
    }

    item.cantidad = nuevaCantidad;
    await carritoRepositorio.saveItem(item);
    return item;
}

export const eliminarProductoDelCarrito= async (userId, itemId) => {
    const carrito = await carritoRepositorio.findOrCreateCarrito(userId);
    
    const filasEliminadas = await carritoRepositorio.destroyItem(itemId, carrito[0].id);

    if (filasEliminadas === 0) {
        throw new Error('Ítem no encontrado en el carrito.');
    }
    return true;
}

export const vaciarCarrito = async (userId) => {
    const carrito = await carritoRepositorio.findOrCreateCarrito(userId);
    
    await carritoRepositorio.clearCart(carrito[0].id);
    return true;
}
