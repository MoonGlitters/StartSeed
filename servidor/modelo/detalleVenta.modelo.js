import { DataTypes } from "sequelize";

const schemaDetalleVenta = (sequelize) => {

    const DetalleVenta = sequelize.define("DetalleVenta", {

        id_detalle: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_venta: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "ventas",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        id_producto: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "productos",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        id_empresa: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: 'ID de la empresa a la que se vendió este producto.'
        },
        nombre_producto: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Nombre del producto al momento exacto de la compra.'
        },
        precio_unitario_compra: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        cantidad_comprada: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: "Detalles_Venta",
        timestamps: true
    });

    return DetalleVenta;
};

export default schemaDetalleVenta;