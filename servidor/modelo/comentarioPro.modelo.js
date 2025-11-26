import { DataTypes } from "sequelize";

const schemaComentarioProducto = (sequelize) => {
    const ComentarioProducto = sequelize.define("ComentarioProducto", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_producto: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "productos",
                key: "id",
        },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        id_venta: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "ventas",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        },
        id_usuario: {
        type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
        },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
            contenido: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
            calificacion: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1, max: 5 },
        },
    }, {
        tableName: "comentarios_productos",
        timestamps: true,
        indexes: [
        {
            unique: true,
            fields: ["id_usuario", "id_producto", "id_venta"],
        },
        ],
    });

    return ComentarioProducto;
};

export default schemaComentarioProducto;