import { productoRepositorio } from '../repositorios/producto.repositorio.js';
import { empresaRepositorio } from '../repositorios/empresa.repositorio.js';
import { subirArchivoS3 } from '../utils/awsS3.js'; // Utilidad de S3
import { v4 as uuidv4 } from 'uuid';


export const crearProductoEmpresa = async (id_usuario, data, img_producto) => {

    const empresa = await empresaRepositorio.findByUserId(id_usuario);
    if (!empresa) {
        throw new Error('El usuario no tiene una empresa asignada.'); 
    }

    const carpeta_s3 = `empresas/${empresa.id}/productos`;
    
    const productoId = uuidv4(); 

    const url_imagen_principal = await subirArchivoS3(
        img_producto, 
        carpeta_s3, 
        productoId,
        'principal' 
    );


    const productoData = {
        id: productoId, 
        id_empresa: empresa.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        url_imagen_principal: url_imagen_principal,
        estado: 'activo'
    };
    const nuevoProducto = await productoRepositorio.createProducto(productoData);
    
    const inventarioData = {
        id: uuidv4(),
        id_producto: nuevoProducto.id,
        stock_actual: data.stock_inicial || 0, 
        stock_minimo: data.stock_minimo || 0,
        descuento: data.descuento || 0,
    };

    await productoRepositorio.createInventario(inventarioData);

    return nuevoProducto;
};


export const actualizarProductoEmpresa = async (productoId, userId, updateData) => {

    const producto = await productoRepositorio.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado.')
   

    const empresa = await empresaRepositorio.findByUserId(userId);
    if (!empresa || producto.id_empresa !== empresa.id) {
        throw new Error('No tienes permiso para modificar este producto.'); 
    }

    const productoUpdateFields = { nombre: updateData.nombre, descripcion: updateData.descripcion, precio: updateData.precio };
    await productoRepositorio.updateProducto(producto, productoUpdateFields);

    if (updateData.stock_actual !== undefined || updateData.stock_minimo !== undefined || updateData.descuento !== undefined) {
        const inventario = producto.inventario; 
        const inventarioUpdateFields = {
            stock_actual: updateData.stock_actual,
            stock_minimo: updateData.stock_minimo,
            descuento: updateData.descuento,
        };
        await productoRepositorio.updateInventario(inventario, inventarioUpdateFields);
    }
    
    return producto;
};

export const desactivarProducto = async (productoId, userId) => {
    const producto = await productoRepositorio.findById(productoId);
    if (!producto) throw new Error('Producto no encontrado.');

    const empresa = await empresaRepositorio.findByUserId(userId);
    if (!empresa || producto.id_empresa !== empresa.id) {
        throw new Error('No tienes permiso para desactivar este producto.'); 
    }

    if (producto.estado === 'inactivo') throw new Error('El producto ya está inactivo.');

    producto.estado = 'inactivo';
    await productoRepositorio.save(producto);
    
    return producto;
};


export const obtenerProductosActivos = async () => {
    return productoRepositorio.findAllActive();
};

export const obtenerProductoDetalle = async (id) => {
    const producto = await productoRepositorio.findById(id);
    if (!producto) throw new Error('Producto no encontrado.');
    return producto;
};

export const obtenerProductosPorEmpresaId = async (empresaId) => {
  return productoRepositorio.findAllActiveByEmpresaId(empresaId);
};
