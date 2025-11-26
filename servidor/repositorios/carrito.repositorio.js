import { Carrito, CarritoProducto, Producto, Inventario } from '../configuracion/sequelize.js';

export const carritoRepositorio = {
    
    findCarritoWithItems: async (userId) => {
        return Carrito.findOne({
            where: { id_usuario: userId },
            attributes: ['id'],
            include: [{
                model: CarritoProducto,
                as: 'items',
                attributes: ['id', 'cantidad'],
                include: [{
                    model: Producto,
                    as: 'producto',
                    attributes: ['id', 'nombre', 'precio', 'url_imagen_principal', 'estado'],
                }]
            }]
        });
    },

    findOrCreateCarrito: async (userId) => {
        return Carrito.findOrCreate({
            where: { id_usuario: userId },
            defaults: { id_usuario: userId }
        });
    },

    findOrCreateItem: async (carritoId, productoId, cantidad) => {
        return CarritoProducto.findOrCreate({
            where: { id_carrito: carritoId, id_producto: productoId },
            defaults: { id_carrito: carritoId, id_producto: productoId, cantidad: cantidad }
        });
    },

    findItemById: async (itemId, carritoId) => {
        return CarritoProducto.findOne({
            where: { id: itemId, id_carrito: carritoId }
        });
    },

    saveItem: async (itemInstance) => {
        return itemInstance.save();
    },

    destroyItem: async (itemId, carritoId) => {
        return CarritoProducto.destroy({
            where: { id: itemId, id_carrito: carritoId }
        });
    },

    clearCart: async (carritoId, t) => { 
        return CarritoProducto.destroy({
            where: { id_carrito: carritoId },
            transaction: t
        });
    },

    obtenerCarritoConProductos: async (id_usuario, t) => {
        return await Carrito.findOne({
            where: { id_usuario },
            include: [{
                model: Producto,
                as: "productos",
                attributes: ['id', 'id_empresa', 'nombre', 'precio', 'estado'],
                through: { attributes: ["cantidad"] }, 
                include: [{
                    model: Inventario,
                    as: 'inventario',
                    attributes: ['id_producto','stock_actual']
                }]
            }],
            transaction: t
        });
    },

    vaciarCarrito: async (id_usuario, transaction = null) => {
        try {
            // Buscar el carrito del usuario
            const carrito = await Carrito.findOne({
            where: { id_usuario },
            transaction,
            });

            if (!carrito) {
            console.warn(`No se encontró carrito para el usuario ${id_usuario}`);
            return false;
            }

            // Eliminar los productos del carrito
            await CarritoProducto.destroy({
            where: { id_carrito: carrito.id },
            transaction,
            });

            console.log(`Carrito del usuario ${id_usuario} vaciado correctamente.`);
            return true;
        } catch (error) {
            console.error("Error al vaciar el carrito:", error);
            throw new Error("No se pudo vaciar el carrito del usuario.");
        }
    }
};