import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import { Empresa } from "../configuracion/sequelize.js";

const schemaUsuario = (sequelize) => {

    const Usuario = sequelize.define('usuarios', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [3, 100],
                is: /^\w[a-zA-Z0-9_]+$/
            }
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: [3, 100],
                is: /^[a-zA-Z_]+$/
            }
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: [3, 100],
                is: /^[a-zA-Z_]+$/
            }
        },
        telefono: {
        type: DataTypes.STRING(12), // +56 + 9 dígitos = 12 caracteres
        allowNull: true,
        validate: {
            is: {
            args: /^\+56\d{9}$/,
            msg: "El teléfono debe tener el formato +569XXXXXXXX"
            }}
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: [8, 255]
            }
        },
        url_img_perfil: {
        type: DataTypes.STRING, // URL donde se almacena la imagen
        allowNull: true
        },
        role: {
            type: DataTypes.ENUM('usuario', 'empresa', 'admin'),
            allowNull: false, 
            defaultValue: 'usuario'
        },
        calle: {
        type: DataTypes.STRING(150),
        allowNull: true,
        },
        numero: {
        type: DataTypes.STRING(20),
        allowNull: true,
        },
        villa: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        comuna: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        region: {
        type: DataTypes.STRING(100),
        allowNull: true,
        },
        referencia_direccion: {
        type: DataTypes.STRING(255),
        allowNull: true,
        },
        verify_email_otp: {
            type: DataTypes.STRING(50),
            defaultValue: ''
        },
        verify_email_otp_expire_at: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
        verify_phone_otp: {
            type: DataTypes.STRING(50),
            defaultValue: ''
        },
        verify_phone_otp_expire_at: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_phone_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        has_empresa: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        reset_otp: {
            type: DataTypes.STRING(50),
            defaultValue: ''
        },
        reset_otp_expire_at: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        },
        estado: {
        type: DataTypes.ENUM('activa', 'inactiva', 'suspendida'),
        defaultValue: 'activa',
        allowNull: false
        },
        suspension_expira_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    }, {
        tableName: 'usuarios',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeSave: async (user) => {
                if (user.changed('password')) {
                    const saltRounds = 10;
                    user.password = await bcrypt.hash(user.password, saltRounds);
                }
            },
            afterUpdate: async (usuario, options) => {
                if (usuario.changed('estado') && usuario.has_empresa) {
                    const nuevoEstadoUsuario = usuario.estado;
                    let nuevoEstadoEmpresa;

                    if (nuevoEstadoUsuario === 'activa') {
                        nuevoEstadoEmpresa = 'activa';
                    } else {
                        nuevoEstadoEmpresa = 'inactiva';
                    }

                    const empresa = await Empresa.findOne({
                        where: { id_usuario: usuario.id },
                        transaction: options.transaction
                    });

                    if (empresa && empresa.estado !== nuevoEstadoEmpresa) {
                        await empresa.update(
                            { estado: nuevoEstadoEmpresa },
                            { transaction: options.transaction } 
                        );
                    }
                }
            },
            afterFind: async (instance, options) => {
                let instances = [];
                if (Array.isArray(instance)) {
                    instances = instance;
                } else if (instance) {
                    instances = [instance];
                }
                const now = new Date();

                for (const user of instances) {
                    if (user.estado === 'suspendida' && user.suspension_expira_at && user.suspension_expira_at <= now) {
                        try {
                            user.estado = 'activa';
                            user.suspension_expira_at = null;

                            await user.update({
                                estado: 'activa',
                                suspension_expira_at: null
                            }, { transaction: options?.transaction });
                            
                            console.log(`Usuario ${user.id} reactivado automáticamente por expiración de suspensión.`);
                        } catch (error) {
                            console.error(`Error al actualizar estado en afterFind para usuario ${user.id}:`, error);
                            user.estado = 'activa';
                            user.suspension_expira_at = null;
                        }
                    }
                }
            }

        }
    });

    return Usuario
}

export default schemaUsuario;