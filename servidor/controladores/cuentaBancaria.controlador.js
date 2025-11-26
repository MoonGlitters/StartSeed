import { getDatosBancarios, updateDatosBancarios } from "../servicios/cuentaBancaria.servicio.js";


export const getDatosBancariosEmpresa = async (req, res) => {
    const userId = req.userid;

    try {
        const datos = await getDatosBancarios(userId);
        res.status(200).json({ 
            success: true, 
            message: datos.banco_nombre ? 'Datos bancarios obtenidos exitosamente.' : 'No hay datos bancarios registrados.',
            data: datos 
        });
        
    } catch (error) {
        const status = error.message.includes('Empresa no encontrada') ? 404 : 500;
        console.error("Error al obtener datos bancarios:", error.message);
        res.status(status).json({ success: false, message: error.message });
    }
};

export const updateDatosBancariosEmpresa = async (req, res) => {
    const userId = req.userid;
    const datosBancarios = req.body;

    try {
        
        const cuentaActualizada = await updateDatosBancarios(userId, datosBancarios);
        
        res.status(200).json({ 
            success: true, 
            message: 'Datos bancarios guardados y actualizados exitosamente.',
            data: cuentaActualizada 
        });
        
    } catch (error) {
        console.error("Error al actualizar datos bancarios:", error.message);
        const status = error.message.includes('obligatorio') || error.message.includes('no válido') ? 400 : 500;
        
        res.status(status).json({ success: false, message: error.message });
    }
};