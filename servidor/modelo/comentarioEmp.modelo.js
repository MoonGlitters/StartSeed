import { DataTypes } from "sequelize";

const schemaComentario = (sequelize) => {
    const Comentario = sequelize.define("Comentario", {
        id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        },
        id_empresa: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "empresas",
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
        id_venta: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "ventas",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
        tableName: "comentarios",
        timestamps: true,
    });

    return Comentario;
};

export default schemaComentario;