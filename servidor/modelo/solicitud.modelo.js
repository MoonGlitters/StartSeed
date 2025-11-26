import { DataTypes } from "sequelize";

const schemaSolicitud = (sequelize) => {

    const Solicitud = sequelize.define("solicitud", {
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
        nombre: { // Razón Social
            type: DataTypes.STRING(100),
            allowNull: false
        },
        rut: { 
            type: DataTypes.STRING(12), 
            allowNull: false,
            unique: true
        },
        url_certificado: {
            type: DataTypes.STRING, // URL donde se almacena el archivo
            allowNull: false
        },
        estado: {
            type: DataTypes.ENUM('pendiente', 'aceptado', 'rechazado', 'finalizado'),
            allowNull: false,
            defaultValue: 'pendiente'
        },
        razon_rechazo: {
            type: DataTypes.TEXT,
            allowNull: true,
        }}, {
        tableName: "solicitudes",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
        });

    return Solicitud
}

export default schemaSolicitud;