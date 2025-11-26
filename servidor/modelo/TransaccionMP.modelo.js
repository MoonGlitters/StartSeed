import { DataTypes } from "sequelize";

const schemaTransaccionMP = (sequelize) => {
    const TransaccionMP = sequelize.define("TransaccionMP", {
        id: {
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
        payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
        },
        status: {
        type: DataTypes.STRING,
        allowNull: false
        },
        status_detail: {
        type: DataTypes.STRING
        },
        date_approved: {
        type: DataTypes.DATE
        },
        payer_email: {
        type: DataTypes.STRING
        },
        mp_raw: {
        type: DataTypes.JSONB,
        allowNull: true
        },
        unique_key: {
        type: DataTypes.STRING,
        unique: true, 
        allowNull: false
        },
        processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
        }
    }, {
        tableName: "transacciones_mp",
        timestamps: true
    });

    return TransaccionMP;
};

export default schemaTransaccionMP;