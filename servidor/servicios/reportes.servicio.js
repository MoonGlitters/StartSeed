import { desembolsoRepositorio } from "../repositorios/desembolso.repositorio.js";
import { reportesRepositorio } from "../repositorios/reportes.repositorio.js";

export const generarReporteFinancieroGlobal = async () => {
    const { totalVentasBruto, totalComisionRetenida, totalDesembolsado } = await reportesRepositorio.getDatosFinancierosGlobales();
    
    const config = await configuracionGlobalRepository.getConfiguracion();
    const ivaPorcentaje = parseFloat(config.iva_porcentaje || 19.00) / 100;

    const montoComision = parseFloat(totalComisionRetenida);
    const montoDesembolsado = parseFloat(totalDesembolsado);
    
    const ivaComision = montoComision * ivaPorcentaje;
    const ingresoNetoPlataforma = montoComision - ivaComision;
    
    const saldoPlataforma = parseFloat(totalVentasBruto) - montoDesembolsado;

    return {
        ventasBrutasTotales: parseFloat(totalVentasBruto),
        comisionRetenidaTotal: montoComision,
        totalPagadoAEmpresas: montoDesembolsado,
        ivaGeneradoPorComisiones: parseFloat(ivaComision.toFixed(2)),
        ingresoNetoPlataforma: parseFloat(ingresoNetoPlataforma.toFixed(2)),
        saldoEstimadoEnPlataforma: parseFloat(saldoPlataforma.toFixed(2))
    };
};

export const getReporteFinancieroEmpresa = async (empresaId) => {
    
    const { montoPendiente, montoBrutoVentas, montoComisionRetenido } = await calcularGananciasPendientes(empresaId);
    const historialDesembolsos = await desembolsoRepositorio.findCompletedDesembolsosByEmpresa(empresaId);
    const historialVentas = await reportesRepositorio.getVentasHistoricasByEmpresa(empresaId);
    const totalPagado = historialDesembolsos.reduce((sum, d) => sum + parseFloat(d.monto_solicitado), 0);

    return {
        empresaId,
        saldo: {
            pendienteASolicitar: montoPendiente,
            totalPagadoHistorico: parseFloat(totalPagado.toFixed(2)),
            ventasPendientesBruto: montoBrutoVentas,
            comisionPendienteRetenida: montoComisionRetenido,
        },
        historialDesembolsos: historialDesembolsos,
        historialVentas: historialVentas
    };
};