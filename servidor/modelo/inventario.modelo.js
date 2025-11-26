import { DataTypes } from "sequelize";

const schemaInventario = (sequelize) => {

    const Inventario = sequelize.define("inventario", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
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
        stock_actual: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        stock_minimo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        descuento: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0
        }
        }, {
        tableName: "Inventarios",
        timestamps: false
        });

    return Inventario
}

export default schemaInventario;