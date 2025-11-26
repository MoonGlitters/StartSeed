import { 
    crearEmpresa, 
    obtenerEmpresaPorId, 
    obtenerEmpresaPorUsuario, 
    obtenerEmpresasActivas,
    editarEmpresa,
    deshabilitarEmpresa,
    generateSalesDashboard,
    updateEmpresaStatus,
    obtenerEmpresas
} from '../servicios/empresa.servicio.js';
import { Usuario } from '../configuracion/sequelize.js';
import { handleValidation } from '../utils/express-validator.js';
import { generarToken } from "../utils/jwt.js";
import { setAuthCookie } from "../utils/cookie.js";


export const crearEmpresaController = async (req, res) => {
    const userid = req.userid;

    if (handleValidation(req, res)) return;

    try {
        const nuevaEmpresa = await crearEmpresa(userid, req.body);

        const usuario = await Usuario.findByPk(userid);
        usuario.has_empresa = true;
        await usuario.save();

        const nuevoToken = generarToken(usuario);
        setAuthCookie(res, nuevoToken);

        return res.status(201).json({
        success: true,
        mensaje: "Empresa creada exitosamente y vinculada a la solicitud aprobada.",
        empresa: nuevaEmpresa,
        });
    } catch (error) {
        let status = 500;
        if (error.message.includes("Usuario no encontrado")) status = 404;
        else if (error.message.includes("ya tiene una empresa")) status = 400;
        else if (error.message.includes("aprobada para poder crearla")) status = 403;
        else if (error.message.includes("Faltan datos")) status = 400;

        return res.status(status).json({ success: false, mensaje: error.message });
    }
    };


export const empresaIdController = async (req, res) => {
    try {
        const empresa = await obtenerEmpresaPorId(req.params.id);
        return res.status(200).json({ success: true, data: empresa });
    } catch (error) {
        const status = error.message.includes('no encontrada') ? 404 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};


export const empresaAllActivasController = async (req, res) => {
    try {
        const empresas = await obtenerEmpresasActivas();
        return res.status(200).json({ success: true, data: empresas });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const empresaAllController = async (req, res) => {
    try {
        const empresas = await obtenerEmpresas();
        return res.status(200).json({ success: true, data: empresas });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getEmpresaUsuarioController = async (req, res) => {
    try {
        const empresa = await obtenerEmpresaPorUsuario(req.userid);
        return res.status(200).json({ success: true, empresa });
    } catch (error) {
        const status = error.message.includes('No tienes empresa') ? 404 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const editarEmpresaController = async (req, res) => {

    try {
        const empresaActualizada = await editarEmpresa(req.params.id, req.body);
        
        return res.status(200).json({
            success: true,
            message: "Empresa actualizada con éxito",
            data: empresaActualizada,
        });
    } catch (error) {
        const status = error.message.includes('no encontrada') ? 404 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const deshabilitarEmpresaController = async (req, res) => {

    try {
        await deshabilitarEmpresa(req.params.id);
        
        return res.status(200).json({
            success: true,
            message: "Empresa deshabilitada (inactivada) con éxito.",
        });
    } catch (error) {
        const status = error.message.includes('no encontrada') ? 404 : 400; 
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const getDashboardEmpresaController = async (req, res) => {
    const userId = req.userid; 

    try {
        const dashboardData = await generateSalesDashboard(userId);
        
        return res.status(200).json({
            success: true,
            message: 'Dashboard de ventas generado exitosamente.',
            data: dashboardData
        });

    } catch (error) {
        let status = 500;
        if (error.message.includes('Empresa no encontrada')) status = 404;
        
        console.error("Error al generar el dashboard de ventas:", error.message);
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const cambiarEstadoEmpresaController = async (req, res) => {
    try {
        const { id } = req.params;

        const empresa = await updateEmpresaStatus(id);
        if (!empresa) {
        return res.status(404).json({ 
            success: false, 
            message: 'Empresa no encontrada.' 
        });
        }

        return res.status(200).json({ 
        success: true, 
        message: `Empresa actualizada a estado '${empresa.estado}' correctamente.`, 
        data: empresa 
        });

    } catch (error) {
        console.error("Error en updateEmpresaState:", error);
        return res.status(500).json({ 
        success: false, 
        message: error.message || 'Error interno del servidor.' 
        });
    }
};


