import { DataTypes } from "sequelize";

const schemaProducto = (sequelize) => {

    const Producto = sequelize.define("Producto", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        id_empresa: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
            model: "empresas",
            key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        precio: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        url_imagen_principal: {
            type: DataTypes.STRING,
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM('activo', 'inactivo'),
            defaultValue: 'activo',
            allowNull: false},
        }, {
            tableName: "productos",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            
        });

        return Producto
}

export default schemaProducto;