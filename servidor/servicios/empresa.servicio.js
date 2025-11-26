import { empresaRepositorio } from '../repositorios/empresa.repositorio.js';
import { desembolsoRepositorio } from '../repositorios/desembolso.repositorio.js';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../configuracion/sequelize.js';

export const crearEmpresa = async (userId, bodyData) => {
    
    const usuario = await empresaRepositorio.findUsuarioById(userId);
    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.has_empresa) throw new Error(`${usuario.username} ya tiene una empresa asignada`); 

    const solicitud = await empresaRepositorio.findAceptedSolicitud(userId);
    if (!solicitud) throw new Error("Debe tener una solicitud de empresa aprobada para poder crearla.");

    const requiredFields = ['descripcion', 'telefono', 'tipo_empresa', 'direccion_texto'];
    const missing = requiredFields.filter(field => !bodyData[field]);
    if (missing.length > 0) {
        throw new Error(`Faltan datos requeridos: ${missing.join(', ')} son obligatorios.`); 
    }
    
    const nuevaEmpresa = await empresaRepositorio.create({
        id: uuidv4(),
        id_usuario: userId,
        id_solicitud: solicitud.id,
        estado_solicitud: 'finalizado', 
        rut: solicitud.rut, 
        nombre: solicitud.nombre, 
        url_certificado: solicitud.url_certificado,
        estado: 'activa',
        
        nombre_fantasia: bodyData.nombre_fantasia || null,
        descripcion: bodyData.descripcion,
        telefono: bodyData.telefono,
        tipo_empresa: bodyData.tipo_empresa,
        direccion_texto: bodyData.direccion_texto,
        google_place_id: bodyData.google_place_id || null,
        latitud: bodyData.latitud || null,
        longitud: bodyData.longitud || null
    });

    usuario.has_empresa = true;
    await empresaRepositorio.save(usuario);

    solicitud.estado = 'finalizado';
    await empresaRepositorio.save(solicitud);

    return nuevaEmpresa;
};


export const obtenerEmpresaPorId = async (id) => {
    const empresa = await empresaRepositorio.findById(id);
    if (!empresa) throw new Error('Empresa no encontrada');
    return empresa;
};

export const obtenerEmpresasActivas = async () => {
    return empresaRepositorio.findAllActivas();
};

export const obtenerEmpresas = async () => {
    return empresaRepositorio.findAll();
};

export const obtenerEmpresaPorUsuario = async (userId) => {
    const empresa = await empresaRepositorio.findByUserId(userId);
    if (!empresa) throw new Error('No tienes empresa');
    return empresa;
};

export const editarEmpresa = async (id, updateData) => {
    
    const empresa = await empresaRepositorio.findById(id);
    if (!empresa) {
        throw new Error('Empresa no encontrada'); 
    }

    const camposEditables = [
        "nombre_fantasia",
        "descripcion",
        "telefono",
        "tipo_empresa",
        "direccion_texto",
        "google_place_id",
        "latitud",
        "longitud"
    ];

    const datosFiltrados = {};
    camposEditables.forEach((campo) => {
        if (updateData[campo] !== undefined) { 
            datosFiltrados[campo] = updateData[campo];
        }
    });

    if (Object.keys(datosFiltrados).length === 0) {
        throw new Error('No se proporcionaron campos válidos para la actualización.');
    }
    const updated = await empresaRepositorio.update(empresa, datosFiltrados);
    
    return updated;
};


export const deshabilitarEmpresa = async (id) => {
    const empresa = await empresaRepositorio.findById(id);
    if (!empresa) throw new Error('Empresa no encontrada'); 
    
    if (empresa.estado === 'inactiva') throw new Error('La empresa ya está inactiva');

    empresa.estado = 'inactiva';
    await empresaRepositorio.save(empresa);
    
    return empresa;
};

export const generateSalesDashboard = async (userId) => {
    
    const empresa = await empresaRepositorio.findByUserId(userId);

    if (!empresa) {
        throw new Error('Empresa no encontrada para el usuario autenticado.');
    }
    const empresaId = empresa.id;

    const detallesVenta = await empresaRepositorio.findCompletedSalesData(empresaId);

    if (!detallesVenta || detallesVenta.length === 0) {
        return {
            empresaNombre: empresa.nombre,
            summary: { ventas_totales: 0, ingresos_netos: 0, comision_total: 0, iva_total: 0 },
            sales_by_month: {},
            detailed_sales: []
        };
    }

    const desembolsosCompletados = await desembolsoRepositorio.findCompletedDesembolsosByEmpresa(empresaId);
    
    let totalPagadoEmpresa = 0;
    let desembolsosRecientes = [];
    
    desembolsosCompletados.forEach(d => {
        totalPagadoEmpresa += parseFloat(d.monto_pagado);
        
        desembolsosRecientes.push({
            id_desembolso: d.id,
            fecha_pago: d.fecha_aprobacion,
            monto: parseFloat(d.monto_pagado.toFixed(2)),
            periodo: d.fecha_inicio_periodo.toISOString().split('T')[0] + ' a ' + d.fecha_fin_periodo.toISOString().split('T')[0]
        });
    });

    let resumenGlobal = {
        ventas_totales: 0, // Total de dinero que el cliente pago
        ingresos_netos: 0, // Total que la empresa recibirá (Subtotal - Comisión)
        comision_total: 0,
        iva_total: 0,
    };
    const ventasPorMes = {};
    const ventasPorAnio = {};
    const ventasDetalladas = [];
    
    const ventasUnicas = new Set();
    
    detallesVenta.forEach(detalle => {
        const venta = detalle.venta.dataValues;
        const fecha = new Date(venta.createdAt);
        const anio = fecha.getFullYear();
        const mesAnio = `${anio}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!ventasUnicas.has(venta.id)) {
            const subtotal = parseFloat(venta.subtotal);
            const montoIva = parseFloat(venta.monto_iva);
            const montoComision = parseFloat(venta.monto_comision);
            const totalCompra = parseFloat(venta.total_compra);
            
            // Calculo de Ingreso Neto Subtotal (precio base) - Comisión
            const ingresoNeto = subtotal - montoComision;
            
            // Resumen Global
            resumenGlobal.ventas_totales += totalCompra;
            resumenGlobal.ingresos_netos += ingresoNeto;
            resumenGlobal.comision_total += montoComision;
            resumenGlobal.iva_total += montoIva;

            // Agregacion por Mes/Año

            // Inicializar si es la primera vez
            if (!ventasPorMes[mesAnio]) ventasPorMes[mesAnio] = { total: 0, neto: 0, iva: 0, comision: 0, n_ventas: 0 };
            if (!ventasPorAnio[anio]) ventasPorAnio[anio] = { total: 0, neto: 0, iva: 0, comision: 0, n_ventas: 0 };
            
            ventasPorMes[mesAnio].total += totalCompra;
            ventasPorMes[mesAnio].neto += ingresoNeto;
            ventasPorMes[mesAnio].iva += montoIva;
            ventasPorMes[mesAnio].comision += montoComision;
            ventasPorMes[mesAnio].n_ventas += 1;

            ventasPorAnio[anio].total += totalCompra;
            ventasPorAnio[anio].neto += ingresoNeto;
            ventasPorAnio[anio].iva += montoIva;
            ventasPorAnio[anio].comision += montoComision;
            ventasPorAnio[anio].n_ventas += 1;

            ventasUnicas.add(venta.id);
        }

        // Lista de Ventas Detalladas
        ventasDetalladas.push({
            id_venta: venta.id,
            fecha: venta.createdAt,
            producto: detalle.nombre_producto,
            cantidad: detalle.cantidad_comprada,
            precio_unitario: detalle.precio_unitario_compra, // Precio sin IVA
            total_producto: parseFloat(detalle.precio_unitario_compra) * detalle.cantidad_comprada,
            total_pagado_venta: parseFloat(venta.total_compra), 
        });
    });

    return {
        empresaNombre: empresa.nombre,
        sumario: {
            ventas_totales: parseFloat(resumenGlobal.ventas_totales.toFixed(2)), 
            ingresos_netos: parseFloat(resumenGlobal.ingresos_netos.toFixed(2)),
            comision_total: parseFloat(resumenGlobal.comision_total.toFixed(2)),
            iva_total: parseFloat(resumenGlobal.iva_total.toFixed(2)),
            total_ingresos_pagados: parseFloat(totalPagadoEmpresa.toFixed(2))
        },
        ventas_por_mes: ventasPorMes,
        ventas_por_anio: ventasPorAnio,
        pagos_empresa: { 
            total_historico_pagado: parseFloat(totalPagadoEmpresa.toFixed(2)),
            ultimos_desembolsos: desembolsosRecientes.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago)).slice(0, 5) 
        },
        ventas_detalladas: ventasDetalladas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    };
};


export const updateEmpresaStatus = async (empresaId) => {
    return await sequelize.transaction(async (t) => {
    const empresa = await empresaRepositorio.findById(empresaId, { transaction: t });
    if (!empresa) throw new Error("Empresa no encontrada.");

    const nuevoEstado = empresa.estado === "activa" ? "inactiva" : "activa";

    await empresa.update({ estado: nuevoEstado }, { transaction: t });

    return empresa;
})};