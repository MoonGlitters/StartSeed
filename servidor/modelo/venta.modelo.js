import { DataTypes } from "sequelize";

const schemaVenta = (sequelize) => {

    const Venta = sequelize.define("venta", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_usuario: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
            model: "usuarios",
            key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Suma de productos antes de impuestos'
        },
        monto_iva: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Monto de IVA calculado sobre el subtotal'
        },
        monto_comision: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Monto de comisión (calculado sobre subtotal) para la plataforma'
        },
        total_compra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Total pagado por el cliente (Subtotal + IVA)'
        },
        estado: {
            type: DataTypes.ENUM("Pendiente", "Completado", "Cancelado"),
            defaultValue: "Pendiente"
        },
        referencia_pago: {      // Link o ID de Mercado Pago
            type: DataTypes.STRING,
            allowNull: true
        },
        status_pago: {          // Estado del pago
            type: DataTypes.STRING,
            allowNull: true
        },
        fecha_pago: {           // Fecha de aprobación del pago
            type: DataTypes.DATE,
            allowNull: true
        },
        pagado_a_empresa: {
            type: DataTypes.BOOLEAN, // si el dinero ya se pago a la empresa
            allowNull: false,
            defaultValue: false,
        },
        fecha_pagado_a_empresa: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        direccion_calle: {
        type: DataTypes.STRING(150),
        allowNull: true,
        },
        direccion_numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
        },
        direccion_villa: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        direccion_comuna: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        direccion_region: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        direccion_referencia: {
        type: DataTypes.STRING(255),
        allowNull: true,
        },
        }, {
        tableName: "ventas",
        timestamps: true
    });

    return Venta
}

export default schemaVenta;