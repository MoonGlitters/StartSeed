import { DataTypes } from 'sequelize';

const schemaDesembolso = (sequelize) => {
    const Desembolso = sequelize.define('Desembolso', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull:false
        },
        id_empresa: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'empresas',
                key: 'id'
            },
        },
        id_admin_aprobador: {
            type: DataTypes.UUID,
            allowNull: true, 
            references: {
                model: 'usuarios', 
                key: 'id'
            },
        },
        fecha_solicitud: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        monto_solicitado: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        monto_bruto_ventas: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        monto_comision_retenido: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado', 'Completado', 'Fallido'),
            allowNull: false,
            defaultValue: 'Pendiente',
        },
        fecha_aprobacion: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        referencia_bancaria: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        comentario_admin: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        tableName: "Desembolsos", 
        timestamps: true,
        indexes: [
            { fields: ['id_empresa'] },
            { fields: ['status'] }
        ]
    });

    return Desembolso;
};

export default schemaDesembolso;