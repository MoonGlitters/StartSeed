import { generarReporteFinancieroGlobal, getReporteFinancieroEmpresa } from "../servicios/reportes.servicio.js";

export const getReporteFinancieroGlobalController = async (req, res, next) => {
    try {
        const reporte = await generarReporteFinancieroGlobal();
        
        if (!reporte) {
            return res.status(404).json({ mensaje: 'No hay datos financieros para generar el reporte.' });
        }
        
        return res.status(200).json({ 
            mensaje: 'Reporte financiero global generado correctamente.',
            data: reporte 
        });
        
    } catch (error) {
        console.error('Error en controlador getReporteFinancieroGlobal:', error.message);
        return res.status(500).json({ 
            mensaje: 'Error interno al generar el reporte financiero.',
        });
    }
};

export const getReporteEmpresaController = async (req, res, next) => {

    const empresaId = req.params.empresaId; 

    try {
        const reporte = await getReporteFinancieroEmpresa(empresaId);
        
        return res.status(200).json({ 
            mensaje: `Reporte financiero para empresa ID ${empresaId} generado.`,
            data: reporte 
        });
        
    } catch (error) {
        console.error(`Error al obtener reporte de empresa UUID ${empresaId}:`, error.message);
        return res.status(500).json({ 
            mensaje: error.message || 'Error interno del servidor al generar el reporte de empresa.',
        });
    }
};