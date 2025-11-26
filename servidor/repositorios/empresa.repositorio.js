import { Empresa, Usuario, Solicitud, DetalleVenta, Venta } from '../configuracion/sequelize.js';

export const empresaRepositorio = {
    
    // encontrar usuario
    findUsuarioById: async (userId) => Usuario.findOne({ where: { id: userId } }),

    // encontrar solicitud aceptada
    findAceptedSolicitud: async (userId) => Solicitud.findOne({
        where: { id_usuario: userId, estado: 'aceptado' },
        order: [['created_at', 'DESC']]
    }),

    updateEmpresaStatus: async (empresaId, status, options = {}) => {
    return  await Empresa.update(
        { estado: status },
        { where: { id: empresaId }, ...options }
        );
    },

    
    // empresa por id de empresa
    findById: async (id, options = {}) => Empresa.findOne({ where: { id }, ...options }),
    
    // empresas activas
    findAllActivas: async () => Empresa.findAll({ where: { estado: 'activa' } }),

    findAll: async () => Empresa.findAll(),
    
    // empresas por id de usuario
    findByUserId: async (userId) => Empresa.findOne({ where: { id_usuario: userId } }),
    
    create: async (data) => Empresa.create(data),

    save: async (modelInstance) => modelInstance.save(),

    update: async (empresaInstance, data) => empresaInstance.update(data),

    findCompletedSalesData: async (empresaId) => {
        return DetalleVenta.findAll({
            where: { id_empresa: empresaId },
            include: [{
                model: Venta,
                as: 'venta',
                where: { estado: 'Pagado', status_pago: 'approved' },
                attributes: [
                    'id',
                    'subtotal',
                    'monto_iva',
                    'monto_comision',
                    'total_compra',
                    'createdAt'
                ]
            }],
            attributes: [
                'nombre_producto',
                'precio_unitario_compra',
                'cantidad_comprada'
            ],
            order: [[{ model: Venta, as: 'venta' }, 'createdAt', 'DESC']]
        });
    }
};