import { Venta, DetalleVenta, Producto } from '../configuracion/sequelize.js';

export const ventaRepositorio = {

    findVentaById: (id, t) => {
        return Venta.findOne({
            where: { id: String(id).trim() },
            transaction: t
        });
},

    updateVentaStatus: async (venta, newStatus, newPaymentStatus, date, t) => {
        venta.estado = newStatus;
        venta.status_pago = newPaymentStatus;
        venta.fecha_pago = date;
        await venta.save({ transaction: t });
        return venta;
    },
    
    createVenta: (ventaData, t) => {
        return Venta.create({ 
            id_usuario: ventaData.id_usuario, 
            subtotal: ventaData.subtotal,
            monto_iva: ventaData.monto_iva,
            monto_comision: ventaData.monto_comision,
            total_compra: ventaData.total_compra, 
            estado: "Pendiente", 
            status_pago: "Pendiente"
            
        }, { transaction: t });
    },

    createDetallesVenta: (detalles, t) => {
        return DetalleVenta.bulkCreate(detalles, { transaction: t });
    },

    getPurchaseHistory: (id_usuario) => {
        return Venta.findAll({
            where: { id_usuario: id_usuario },
            order: [['createdAt', 'DESC']],
            
            include: [{
                model: DetalleVenta,
                as: 'detalles',
                attributes: [
                    'nombre_producto', 
                    'precio_unitario_compra', 
                    'cantidad_comprada',
                    'id_empresa'
                ]
            }],
            attributes: [
                'id',
                'total_compra',
                'estado', 
                'status_pago', 
                'createdAt',
                'direccion_calle',
                'direccion_numero',
                'direccion_villa',
                'direccion_comuna',
                'direccion_region',
                'direccion_referencia',
            ],
            raw: false, 
        });
    },

    getVentasNoPagadasAEmpresa: async (empresaId, t = null) => {
        return Venta.findAll({
        where: {
            estado: 'Pagado',
            status_pago: 'approved',
            pagado_a_empresa: false
        },
        include: [{
            model: DetalleVenta,
            as: 'detalles',
            where: { id_empresa: empresaId },
            attributes: [] 
        }],
        attributes: ['id', 'subtotal', 'monto_comision', 'createdAt'],
        transaction: t
        });
    },


    markVentasAsPaidToEmpresa: async (ventaIds, t) => {
        await Venta.update(
            { pagado_a_empresa: true, fecha_pagado_a_empresa: new Date() },
            { where: { id: ventaIds }, transaction: t }
        );
    },

    updateVentaReferencia: async (id_venta, referencia) => {
        await Venta.update(
            { referencia_pago: referencia },
            { where: { id: id_venta } }
        )
    },

    findVentaPendientePorUsuario: async (id_usuario, transaction = null) => {
        try {
            const venta = await Venta.findOne({
            where: {
                id_usuario,
                estado: "Pendiente"
            },
            order: [["createdAt", "DESC"]],
            transaction
            });

            return venta;
        } catch (error) {
            console.error("Error al buscar venta pendiente por usuario:", error);
            throw new Error("No se pudo obtener la venta pendiente del usuario.");
        }
    },
    findVentasPorProductoUsuario: async (usuarioId, productoId) => {
    return await Venta.findAll({
        where: {
        id_usuario: usuarioId,
        estado: ["Pagado"]
        },
        include: [
        {
            model: DetalleVenta,
            as: "detalles",
            where: { id_producto: productoId }
        }
        ]
    });
    
    },
    asociarDireccionVenta: async (id_venta, usuario, t) => {
    await Venta.update(
        {
        direccion_calle: usuario.calle,
        direccion_numero: usuario.numero,
        direccion_villa: usuario.villa,
        direccion_comuna: usuario.comuna,
        direccion_region: usuario.region,
        direccion_referencia: usuario.referencia_direccion,
        },
        {
        where: { id: id_venta },
        transaction: t,
        }
    );
    },
    findVentasPorEmpresaUsuario: async (usuarioId, empresaId) => {
        return await Venta.findAll({
            where: {
            id_usuario: usuarioId,
            estado: ["Pagado"],
            },
            include: [
            {
                model: DetalleVenta,
                as: "detalles",
                include: [
                {
                    model: Producto,
                    as: "producto",
                    where: { id_empresa: empresaId },
                },
                ],
            },
            ]
        });
    }
};