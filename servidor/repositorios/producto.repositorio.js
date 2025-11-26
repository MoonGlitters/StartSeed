import { Producto, Inventario, Empresa } from '../configuracion/sequelize.js'; 


export const productoRepositorio = {

    createProducto: async (data) => {
        return Producto.create(data);
    },
    createInventario: async (data) => {
        return Inventario.create(data);
    },

    findAllActive: async () => {
        return Producto.findAll({
            where: { estado: 'activo' },
            include: [{ model: Inventario, as: 'inventario' }]
        });
    },
    
    findAllActiveByEmpresaId: async (empresaId) => {
        return Producto.findAll({
            where: { 
            id_empresa: empresaId,
            estado: 'activo' // solo los activos
            },
            include: [{ model: Inventario, as: 'inventario' }]
        });
        },

    findById: async (id) => {
        return Producto.findOne({
            where: { id },
            include: [{ model: Inventario, as: 'inventario' }, { model: Empresa, as: 'empresa' }]
        });
    },

    findAllByEmpresaId: async (empresaId) => {
        return Producto.findAll({
            where: { id_usuario: empresaId },
            include: [{ model: Inventario, as: 'inventario' }]
        });
    },

    updateProducto: async (productoInstance, data) => {
        return productoInstance.update(data);
    },

    updateInventario: async (inventarioInstance, data) => {
        return inventarioInstance.update(data);
    },

    save: async (modelInstance) => {
        return modelInstance.save();
    },

    findProductoWithStock: async (productoId) => {
        return Producto.findOne({
            where: { id: productoId },
            include: [{
                model: Inventario,
                as: 'inventario',
                attributes: ['stock_actual']
            }]
        });
    }
};