import { Sequelize } from "sequelize";
import dotenv from "dotenv";

import schemaUsuario from "../modelo/usuario.modelo.js";
import schemaEmpresa from "../modelo/empresa.modelo.js";
import schemaProducto from "../modelo/producto.modelo.js";
import schemaCarrito from "../modelo/carrito.modelo.js";
import schemaCarritoProducto from "../modelo/carritoProducto.modelo.js";
import schemaVenta from "../modelo/venta.modelo.js";
import schemaDetalleVenta from "../modelo/detalleVenta.modelo.js";
import schemaTransaccionMP from "../modelo/TransaccionMP.modelo.js";
import schemaInventario from "../modelo/inventario.modelo.js";
import schemaSolicitud from "../modelo/solicitud.modelo.js";
import schemaConfiguracionGlobal from "../modelo/confGlobal.modelo.js";
import schemaDesembolso from "../modelo/desembolso.modelo.js";
import schemaCuentaBancaria from "../modelo/cuentaBancaria.modelo.js";
import schemaComentario from "../modelo/comentarioEmp.modelo.js";
import schemaComentarioProducto from "../modelo/comentarioPro.modelo.js";

dotenv.config();
export const sequelize = new Sequelize(process.env.DB_URI, {
    dialect: 'postgres',
    logging: false,

    pool: {
        max: 10,       // mantener razonable: evita que Render cierre conexiones por inactividad
        min: 0,
        acquire: 30000, // 30s para intentar obtener conexion
        idle: 10000,    // cierra si no se usa en 10s
        evict: 10000,   // limpia conexiones muertas (ayuda con ECONNRESET)
    },

    retry: {
        max: 3, // reintenta hasta 3 veces si una query falla por desconexión
    },

    timezone: '+00:00',

    dialectOptions: {
        ssl: {
        require: true,
        rejectUnauthorized: false,
        },
        dateStrings: true,
        typeCast: true,
    },

    define: {
        freezeTableName: true,
    },

    family: 4,
    });

export const Usuario = schemaUsuario(sequelize);
export const Empresa = schemaEmpresa(sequelize);
export const Producto = schemaProducto(sequelize);
export const Inventario = schemaInventario(sequelize);
export const Carrito = schemaCarrito(sequelize);
export const CarritoProducto = schemaCarritoProducto(sequelize);
export const Venta = schemaVenta(sequelize);
export const DetalleVenta = schemaDetalleVenta(sequelize);
export const TransaccionMP = schemaTransaccionMP(sequelize);
export const Solicitud = schemaSolicitud(sequelize);
export const ConfiguracionGlobal = schemaConfiguracionGlobal(sequelize);
export const Desembolso = schemaDesembolso(sequelize)
export const CuentaBancaria = schemaCuentaBancaria(sequelize);
export const Comentario = schemaComentario(sequelize);
export const ComentarioProducto = schemaComentarioProducto(sequelize);

// Usuario Empresa (1:1)
Usuario.hasOne(Empresa, { 
    foreignKey: 'id_usuario',
    as: 'empresaPropietaria',
    onDelete: 'CASCADE'
});
Empresa.belongsTo(Usuario, {
    foreignKey: 'id_usuario',
    as: 'propietario'
});

// Empresa Producto (1:N)
Empresa.hasMany(Producto, {
    foreignKey: "id_empresa",
    as: "productos",
    onDelete: "CASCADE"
});
Producto.belongsTo(Empresa, {
    foreignKey: "id_empresa",
    as: "empresa"
});

// Producto Inventario (1:1)
Producto.hasOne(Inventario, {
    foreignKey: "id_producto",
    as: "inventario"
});
Inventario.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto"
});

// Usuario Carrito (1:1)
Usuario.hasOne(Carrito, {
    foreignKey: "id_usuario",
    as: "carrito",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Carrito.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuarioCarrito"
});

// Carrito Producto (N:M) 
Carrito.belongsToMany(Producto, {
    through: CarritoProducto,
    foreignKey: "id_carrito",
    otherKey: "id_producto",
    as: "productos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Producto.belongsToMany(Carrito, {
    through: CarritoProducto,
    foreignKey: "id_producto",
    otherKey: "id_carrito",
    as: "carritos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

//  Asociación directa Carrito CarritoProducto
Carrito.hasMany(CarritoProducto, {
    foreignKey: "id_carrito",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

CarritoProducto.belongsTo(Carrito, {
    foreignKey: "id_carrito",
    as: "carrito"
});

// CarritoProducto Producto
CarritoProducto.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto"
});

Producto.hasMany(CarritoProducto, {
    foreignKey: "id_producto",
    as: "carritoItems"
});

// Usuario Venta (1:N)
Usuario.hasMany(Venta, {
    foreignKey: "id_usuario",
    as: "ventas"
});
Venta.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario"
});

// Venta TransaccionMP (1:1)
Venta.hasMany(TransaccionMP, {
    foreignKey: "id_venta",
    as: "transaccionesMP",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

TransaccionMP.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta",
});

// Venta DetalleVenta (1:N)
Venta.hasMany(DetalleVenta, {
    foreignKey: "id_venta",
    as: "detalles"
});

DetalleVenta.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta"
});

// Producto DetalleVenta (1:N)
Producto.hasMany(DetalleVenta, {
    foreignKey: "id_producto",
    as: "detallesVenta"
});
DetalleVenta.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto"
});

// Usuario Solicitud (1:N)
Usuario.hasMany(Solicitud, {
    foreignKey: "id_usuario",
    as: "usuarioSolicitud",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Solicitud.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "creador"
});

// Solicitud Empresa (1:1) 
Solicitud.hasOne(Empresa, {
    foreignKey: "id_solicitud",
    as: "empresaCreada",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE"
});
Empresa.belongsTo(Solicitud, {
    foreignKey: "id_solicitud",
    as: "solicitudOrigen"
});

// Empresa DetalleVenta (1:N)
Empresa.hasMany(DetalleVenta, {
    foreignKey: "id_empresa",
    as: "detallesDeVenta"
});
DetalleVenta.belongsTo(Empresa, {
    foreignKey: "id_empresa",
    as: "empresaVendedora"
});

// Empresa Desembolso (1:N)
Empresa.hasMany(Desembolso, { 
    foreignKey: 'id_empresa',
    as: 'desembolsos' 
});
Desembolso.belongsTo(Empresa, { 
    foreignKey: 'id_empresa',
    as: 'empresa' 
});

// Usuario Desembolso (1:N)
Usuario.hasMany(Desembolso, { 
    foreignKey: 'id_admin_aprobador',
    as: 'desembolsosAprobados' 
});
Desembolso.belongsTo(Usuario, { 
    foreignKey: 'id_admin_aprobador',
    as: 'administrador' 
});

// Empresa CuentaBancaria (1:1)
Empresa.hasOne(CuentaBancaria, {
    foreignKey: 'id_empresa',
    as: 'cuentaBancaria'
});

// Empresa tiene muchos Comentarios
Empresa.hasMany(Comentario, {
    foreignKey: "id_empresa",
    as: "comentarios",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

// Comentario pertenece a una Empresa
Comentario.belongsTo(Empresa, {
    foreignKey: "id_empresa",
    as: "empresa",
});

// Usuario también puede comentar
Usuario.hasMany(Comentario, {
    foreignKey: "id_usuario",
    as: "comentarios",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Comentario.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
});

// Producto tiene muchos comentarios
Producto.hasMany(ComentarioProducto, {
    foreignKey: "id_producto",
    as: "comentarios",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

ComentarioProducto.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
});

// Usuario puede comentar productos
Usuario.hasMany(ComentarioProducto, {
    foreignKey: "id_usuario",
    as: "comentariosProducto",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

ComentarioProducto.belongsTo(Usuario, {
    foreignKey: "id_usuario",
    as: "usuario",
});

// Venta → ComentarioEmpresa
Venta.hasMany(Comentario, {
    foreignKey: "id_venta",
    as: "comentarios_empresa",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    });

    // ComentarioEmpresa → Venta
    Comentario.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta",
});

Venta.hasMany(ComentarioProducto, {
    foreignKey: "id_venta",
    as: "comentarios_producto",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

ComentarioProducto.belongsTo(Venta, {
    foreignKey: "id_venta",
    as: "venta",
});

export const conectarDB = async () => {
    try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente.");
    await sequelize.sync({ alter: true });
    console.log("Tablas sincronizadas.");
    } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    }
};
