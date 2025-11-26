
import { DataTypes } from "sequelize";
import slugify from 'slugify'
import { Producto } from "../configuracion/sequelize.js";

const schemaEmpresa = (sequelize) => {
    const Empresa = sequelize.define('empresas', {

        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_usuario: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'usuarios',
                key: 'id',
            },
        },
        id_solicitud: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: "solicitudes",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT"
        },
        slug: {
            type: DataTypes.STRING,
            unique: true
        },
        rut: { 
            type: DataTypes.STRING(12), 
            allowNull: false,
            unique: true
        },
        nombre: { // Razón Social
            type: DataTypes.STRING(100),
            allowNull: false
        },
        nombre_fantasia: { // Nombre comercial para mostrar en la plataforma
            type: DataTypes.STRING(100),
            allowNull: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        tipo_empresa: { // Rubro o Categoría principal
            type: DataTypes.STRING(50),
            allowNull: false
        },
        url_certificado: {
            type: DataTypes.STRING,
            allowNull: false
        },
        direccion_texto: {
            type: DataTypes.STRING,
            allowNull: true
        },
        google_place_id: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        latitud: {
            type: DataTypes.DECIMAL(10, 8), 
            allowNull: true
        },
        longitud: {
            type: DataTypes.DECIMAL(11, 8), 
            allowNull: true
        },
        estado: {
        type: DataTypes.ENUM('activa', 'inactiva', 'suspendida'),
        defaultValue: 'activa',
        allowNull: false},
    }, 
    {
        tableName: 'empresas', 
        timestamps: true, 
        createdAt: 'created_at',
        updatedAt: 'update_at',
        hooks: {
            beforeCreate: (empresa) => {
                empresa.slug = slugify(`${empresa.nombre}-${empresa.rut}-${empresa.id_usuario.substring(0, 4)}`, { 
                lower: true, 
                strict: true })
            },
            afterUpdate: async (empresa, options) => {
                if (empresa.changed('estado')) {
                    const nuevoEstadoEmpresa = empresa.estado;
                    let nuevoEstadoProducto;
                    if (nuevoEstadoEmpresa === 'activa') {
                        nuevoEstadoProducto = 'activo';
                    } else { 
                        nuevoEstadoProducto = 'inactivo';
                    }
                    
                    await Producto.update(
                        { estado: nuevoEstadoProducto },
                        {
                            where: { id_empresa: empresa.id }, 
                            transaction: options.transaction
                        }
                    );
                }
            },
        }
    }
);
    return Empresa;
};

export default schemaEmpresa;