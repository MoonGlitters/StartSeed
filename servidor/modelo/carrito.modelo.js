import { DataTypes } from "sequelize";

const schemaCarrito = (sequelize) => {
    
    const Carrito = sequelize.define("Carrito", {
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
        }},
        {
            tableName: "Carritos",
            timestamps: false,
            createdAt: 'created_at',
        });

        return Carrito
}


export default schemaCarrito;