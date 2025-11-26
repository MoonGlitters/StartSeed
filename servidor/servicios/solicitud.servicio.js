import { solicitudRepositorio} from '../repositorios/solicitud.repositorio.js';
import { subirArchivoS3 } from '../utils/awsS3.js'; 
import { enviarEmailSolicitud } from "./notificacion.servicio.js"
import { v4 as uuidv4 } from 'uuid'; 

// Crear solicitud

export const crearSolicitudEmpresa = async (userId, data, archivoCertificado) => {
    
    const solicitudExistentePendiente = await solicitudRepositorio.findPendingByUserId(userId);
    if (solicitudExistentePendiente) {
        throw new Error('Ya tienes una solicitud pendiente de revisión.');
    }

    if (!archivoCertificado) {
        throw new Error('Falta adjuntar el certificado.');
    }
    
    if (!data.nombre || !data.rut) {
        throw new Error('Faltan datos requeridos (nombre o rut).');
    }
    
    const url_certificado = await subirArchivoS3(archivoCertificado, 'solicitudes', userId, uuidv4());

    const nuevaSolicitud = await solicitudRepositorio.create({
        id: uuidv4(),
        id_usuario: userId,
        nombre: data.nombre,
        rut: data.rut,
        url_certificado: url_certificado,
        estado: 'pendiente',
    });

    return nuevaSolicitud; 
};

// cambiar el estado
export const cambiarEstadoSolicitudEmpresa = async (solicitudId, nuevoEstado, razonRechazo) => {
    
    const estadosValidos = ['aceptado', 'rechazado'];

    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Debe ser "aceptado" o "rechazado".');
    }

    if (nuevoEstado === 'rechazado' && !razonRechazo) {
        throw new Error('La razón de rechazo es obligatoria.');
    }
    
    const solicitud = await solicitudRepositorio.findByIdWithUser(solicitudId);
    
    if (!solicitud) {
        throw new Error('Solicitud no encontrada.');
    }
    
    if (solicitud.estado !== 'pendiente') {
        throw new Error(`La solicitud ya fue ${solicitud.estado}. No se puede modificar.`);
    }

    solicitud.estado = nuevoEstado;
    solicitud.razon_rechazo = nuevoEstado === 'rechazado' ? razonRechazo : null;
    await solicitudRepositorio.save(solicitud);

    try {
    await enviarEmailSolicitud(solicitud.creador.email, nuevoEstado, razonRechazo);
    } catch (err) {
    console.error(" Error enviando correo de notificación:", err.message)}


    return solicitud;
};

export const obtenerUltimaSolicitudPorUsuario = async (userId) => {
    return solicitudRepositorio.findLatestByUserId(userId);
};

export const obtenerTodasSolicitudesPorUsuario = async (userId) => {
    return solicitudRepositorio.findAllByUserId(userId);
};

export const obtenerTodasSolicitudesParaAdmin = async () => {
    return solicitudRepositorio.findAll();
};