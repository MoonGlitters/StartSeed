import { DataTypes } from 'sequelize';

const schemaConfiguracionGlobal = (sequelize) => {
    const ConfiguracionGlobal = sequelize.define('ConfiguracionGlobal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            defaultValue: 1 
        },
        
        iva_porcentaje: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 19
        },
        comision_porcentaje: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 5
        },
        sitio_en_mantenimiento: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        mensaje_mantenimiento: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'El sitio está temporalmente fuera de servicio por mantenimiento.'
        },
        costo_envio_base: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 3000,
        },
        monto_minimo_envio_gratis: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 50000,
        },
        monto_minimo_desembolso: { 
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 10000,
        },
        dias_max_devolucion: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 30,
        }
        
    }, {
        tableName: "ConfiguracionGlobal",
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    return ConfiguracionGlobal;
};

export default schemaConfiguracionGlobal;