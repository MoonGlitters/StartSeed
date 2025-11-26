import { sequelize } from '../configuracion/sequelize.js';
import { empresaRepositorio } from '../repositorios/empresa.repositorio.js';
import { ventaRepositorio } from '../repositorios/venta.repositorio.js';
import { desembolsoRepositorio } from '../repositorios/desembolso.repositorio.js';
import { configuracionRepositorio } from '../repositorios/confGlobal.repositorio.js';
import { cuentaBancariaRepositorio } from '../repositorios/cuentaBancaria.repositorio.js';
import { payoutApi } from './payoutApiEjemplo.servicio.js';

const calcularGananciasPendientes = async (empresaId, t = null) => {
  const ventasNoPagadas = await ventaRepositorio.getVentasNoPagadasAEmpresa(empresaId, t);

  let subtotalTotal = 0;
  let comisionTotal = 0;
  const ventasIds = [];

  ventasNoPagadas.forEach((venta) => {
    subtotalTotal += parseFloat(venta.subtotal);
    comisionTotal += parseFloat(venta.monto_comision);
    ventasIds.push(venta.id);
  });

  const gananciasNetas = subtotalTotal - comisionTotal;

  return {
    montoPendiente: parseFloat(gananciasNetas.toFixed(2)),
    montoBrutoVentas: parseFloat(subtotalTotal.toFixed(2)),
    montoComisionRetenido: parseFloat(comisionTotal.toFixed(2)),
    ventasIds,
  };
};

export const getGananciasPendientesEmpresa = async (userId) => {
  const empresa = await empresaRepositorio.findByUserId(userId);
  if (!empresa) throw new Error('Empresa no encontrada para el usuario autenticado.');

  const { montoPendiente } = await calcularGananciasPendientes(empresa.id);

  return {
    empresaId: empresa.id,
    empresaNombre: empresa.nombre,
    montoPendiente,
  };
};

export const solicitarDesembolsoEmpresa = async (userId) => {
  const empresa = await empresaRepositorio.findByUserId(userId);
  if (!empresa) throw new Error('Empresa no encontrada.');

  const solicitudesPendientes = await desembolsoRepositorio.findPendingDesembolsosByEmpresa(empresa.id);
  if (solicitudesPendientes && solicitudesPendientes.length > 0) {
    throw new Error('Ya existe una solicitud de desembolso pendiente. Espere la aprobación del administrador.');
  }

  const { montoPendiente, montoBrutoVentas, montoComisionRetenido } = await calcularGananciasPendientes(empresa.id);
  const minMonto = await configuracionRepositorio.getMinDesembolsoMonto();

  if (montoPendiente < minMonto) {
    throw new Error(`El monto mínimo para solicitar es de $${minMonto.toFixed(2)}.`);
  }

  const nuevaSolicitud = await desembolsoRepositorio.createDesembolsoRequest({
    id_empresa: empresa.id,
    fecha_solicitud: new Date(),
    monto_solicitado: montoPendiente,
    monto_bruto_ventas: montoBrutoVentas,
    monto_comision_retenido: montoComisionRetenido,
    status: 'Pendiente',
  });

  return nuevaSolicitud;
};

export const getSolicitudesDesembolsoPendientes = async () => {
  return await desembolsoRepositorio.findPendingDesembolsos();
};

export const aprobarYEjecutarDesembolso = async (solicitudId, adminId) => {
  return await sequelize.transaction(async (t) => {
    const solicitud = await desembolsoRepositorio.findDesembolsoById(solicitudId, t);
    if (!solicitud || solicitud.status !== 'Pendiente') {
      throw new Error('Solicitud no encontrada o ya procesada.');
    }

    const datosCuenta = await cuentaBancariaRepositorio.findByEmpresaId(solicitud.id_empresa, t);
    if (
      !datosCuenta ||
      !datosCuenta.numero_cuenta ||
      !datosCuenta.banco_nombre ||
      !datosCuenta.rut_titular ||
      !datosCuenta.nombre_titular
    ) {
      await solicitud.update(
        {
          status: 'Rechazado',
          id_admin_aprobador: adminId,
          fecha_aprobacion: new Date(),
          comentario_admin: 'Faltan datos bancarios completos de la empresa para realizar la transferencia.',
        },
        { transaction: t }
      );
      throw new Error('La empresa no tiene datos bancarios completos para la transferencia.');
    }

    const { ventasIds } = await calcularGananciasPendientes(solicitud.id_empresa, t);
    if (ventasIds.length === 0) {
      await solicitud.update(
        {
          status: 'Rechazado',
          id_admin_aprobador: adminId,
          fecha_aprobacion: new Date(),
          comentario_admin: 'No se encontraron ventas pendientes para esta solicitud al momento de la aprobación.',
        },
        { transaction: t }
      );
      throw new Error('No se encontraron ventas pendientes asociadas a la solicitud. Rechazada.');
    }

    let referenciaBancaria;
    try {
      referenciaBancaria = await payoutApi.realizarTransferencia(
        datosCuenta.toJSON(),
        solicitud.monto_solicitado,
        `SOL-${solicitud.id}`
      );
    } catch (error) {
      console.error(
        `El servicio Falló en la transferencia externa para solicitud ${solicitud.id}:`,
        error.message
      );
      throw new Error(`Error al procesar la transferencia bancaria: ${error.message}`);
    }

    await ventaRepositorio.markVentasAsPaidToEmpresa(ventasIds, t);

    await solicitud.update(
      {
        status: 'Completado',
        id_admin_aprobador: adminId,
        fecha_aprobacion: new Date(),
        referencia_bancaria: referenciaBancaria,
      },
      { transaction: t }
    );

    return solicitud;
  });
};

export const rechazarDesembolso = async (solicitudId, adminId, comentario) => {
  return await sequelize.transaction(async (t) => {
    const solicitud = await desembolsoRepositorio.findDesembolsoById(solicitudId, t);

    if (!solicitud || solicitud.status !== 'Pendiente') {
      throw new Error('Solicitud no encontrada o ya procesada.');
    }

    if (!comentario || comentario.length < 10) {
      throw new Error('Debe proporcionar un comentario detallado para el rechazo (mínimo 10 caracteres).');
    }

    await solicitud.update(
      {
        status: 'Rechazado',
        id_admin_aprobador: adminId,
        fecha_aprobacion: new Date(),
        comentario_admin: comentario,
      },
      { transaction: t }
    );

    return solicitud;
  });
};
