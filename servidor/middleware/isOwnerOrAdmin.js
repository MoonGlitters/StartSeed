import { Empresa } from "../configuracion/sequelize.js";

export const isOwnerOrAdmin = async (req, res, next) => {

    const empresaId = req.params.id;
    const userId = req.userid;       
    const userRole = req.role;    

    if (userRole === 'admin') {
        console.log(`Acceso concedido: Usuario ${userId} es administrador.`);
        return next();
    }
    
    try {
        
        const empresa = await Empresa.findOne({ where: { id: empresaId } });

        if (!empresa) {
            return res.status(404).json({ success: false, message: 'Empresa no encontrada.' });
        }

        if (empresa.id_usuario === userId) {
            console.log(`Acceso concedido: Usuario ${userId} es el dueño.`);
            return next();
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permiso para editar esta empresa.' 
            });
        }

    } catch (error) {
        console.error("Error en el middleware de autorización:", error);
        return res.status(500).json({ success: false, message: 'Error interno de autorización.' });
    }
};