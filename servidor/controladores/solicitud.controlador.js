import { 
    crearSolicitudEmpresa,
    cambiarEstadoSolicitudEmpresa,
    obtenerUltimaSolicitudPorUsuario,
    obtenerTodasSolicitudesPorUsuario,
    obtenerTodasSolicitudesParaAdmin
} from '../servicios/solicitud.servicio.js';
import { handleValidation } from '../utils/express-validator.js';

// crear solicitud
export const crearSolicitud = async (req, res) => {

    if (handleValidation(req, res)) return;

    const userid = req.userid;
    const { nombre, rut } = req.body;
    const archivoCertificado = req.file;
    
    try {
        await crearSolicitudEmpresa(userid, { nombre, rut }, archivoCertificado);

        return res.status(201).json({ success: true, message: 'Solicitud Creada exitosamente' });

    } catch (error) {
        let status = 500;
        if (error.message.includes('pendiente')) status = 409; 
        if (error.message.includes('Falta')) status = 400;
        
        return res.status(status).json({ success: false, message: error.message });
    }
};

// cambiar estado
export const cambiarEstadoSolicitud = async (req, res) => {
    
    const { id, estado, razon_rechazo } = req.body;

    try {
        await cambiarEstadoSolicitudEmpresa(id, estado, razon_rechazo);

        return res.status(200).json({
            success: true,
            message: `Solicitud marcada como '${estado}' exitosamente.`,
            solicitud_id: id
        });

    } catch (error) {
        let status = 500;
        if (error.message.includes('inválido') || error.message.includes('obligatoria')) status = 400;
        if (error.message.includes('no encontrada')) status = 404; 
        if (error.message.includes('ya fue')) status = 409;
        
        return res.status(status).json({ success: false, message: error.message });
    }
};

// obtener ultima solicitud aceptada

export const obtenerUltimaSolicitud = async (req, res) => {
    try {
        const userid = req.userid;

        const solicitud = await obtenerUltimaSolicitudPorUsuario(userid);

        if (!solicitud) {
            return res.json({
                success: true,
                tieneSolicitud: false,
                estado: null,
                message: "No tienes solicitudes aún."
            });
        }

        return res.json({
            success: true,
            tieneSolicitud: true,
            estado: solicitud.estado,
            solicitud: solicitud 
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener las solicitudes.",
            error: error.message
        });
    }
};

export const obtenerSolicitudesUsuario = async (req, res) => {
    try {
        const userid = req.userid;

        const solicitudes = await obtenerTodasSolicitudesPorUsuario(userid);

        return res.json({
            success: true,
            data: solicitudes,
            message: solicitudes.length > 0 ? 'Historial de solicitudes obtenido.' : 'No tienes solicitudes aún.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener tus solicitudes.",
            error: error.message
        });
    }
};

export const obtenerSolicitudesAdmin = async (req, res) => {
    
    try {
        const solicitudes = await obtenerTodasSolicitudesParaAdmin();

        return res.json({
            success: true,
            data: solicitudes,
            total: solicitudes.length,
            message: 'Listado completo de solicitudes obtenido.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener el listado de solicitudes para administración.",
            error: error.message
        });
    }
};