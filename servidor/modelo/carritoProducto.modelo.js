import { DataTypes } from "sequelize";

const schemaCarritoProducto = (sequelize) => {

    const CarritoProducto = sequelize.define("CarritoProducto", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_carrito: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
            model: "Carritos",
            key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        id_producto: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
            model: "Productos",
            key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
        }, {
            tableName: "Carritos_Productos",
            timestamps: false
        });
        
        return CarritoProducto

}

export default schemaCarritoProducto;