
import { 
    aprobarYEjecutarDesembolso, 
    getGananciasPendientesEmpresa, 
    getSolicitudesDesembolsoPendientes, 
    solicitarDesembolsoEmpresa, 
    rechazarDesembolso,
} from "../servicios/desembolso.servicio.js";

export const getGananciasPendientesController = async (req, res) => {
    const userId = req.userid;
    try {
        const data = await getGananciasPendientesEmpresa(userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const solicitarDesembolsoController = async (req, res) => {
    const userId = req.userid;
    try {
        const solicitud = await solicitarDesembolsoEmpresa(userId);
        res.status(201).json({
        success: true,
        message: 'Solicitud creada. Pendiente de aprobación.',
        solicitud
        });
    } catch (error) {
        res.status(400).json({
        success: false,
        message: error.message
        });
    }
    };

export const getDesembolsosPendientesController = async (req, res) => {
    try {
        const solicitudes = await getSolicitudesDesembolsoPendientes();
        res.status(200).json({ success: true, data: solicitudes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const aprobarDesembolsoController = async (req, res) => {
    const { id_solicitud } = req.params;
    const adminId = req.userid; 
    try {
        const solicitudAprobada = await aprobarYEjecutarDesembolso(id_solicitud, adminId);
        res.status(200).json({ 
            success: true, 
            message: 'Desembolso aprobado y ejecutado exitosamente.', 
            solicitud: solicitudAprobada 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const rechazarDesembolsoController = async (req, res) => {
    const { id_solicitud } = req.params;
    const { comentario } = req.body;
    const adminId = req.userid;
    console.log(" ID solicitud:", id_solicitud);
    console.log(" Body recibido en el backend:", req.body);
    console.log(" Comentario recibido:", comentario);

    try {
        const solicitudRechazada = await rechazarDesembolso(id_solicitud, adminId, comentario);
        res.status(200).json({ 
            success: true, 
            message: 'Solicitud de desembolso rechazada.', 
            solicitud: solicitudRechazada 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};