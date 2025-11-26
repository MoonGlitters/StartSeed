import { DataTypes } from 'sequelize';

const schemaCuentaBancaria = (sequelize) => {
    const CuentaBancaria = sequelize.define('CuentaBancaria', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull:false
        },
        id_empresa: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true, 
            references: {
                model: 'empresas',
                key: 'id'
            },
        },
        banco_nombre: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        tipo_cuenta: {
            type: DataTypes.ENUM('Corriente', 'Ahorro', 'Vista'),
            allowNull: false,
        },
        numero_cuenta: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rut_titular: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nombre_titular: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: "Cuentas_Bancarias",
        timestamps: true,
    });

    return CuentaBancaria;
};

export default schemaCuentaBancaria;