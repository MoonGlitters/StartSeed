import { Producto, Empresa } from '../configuracion/sequelize.js';

export const isOwnerOfProduct = async (req, res, next) => {
    
    const productoId = req.params.id; 
    const userId = req.userid;      
    const userRole = req.role;   

    if (userRole === 'admin') {
        return next();
    }
    
    try {
        const producto = await Producto.findOne({ 
            where: { id: productoId },
            attributes: ['id_empresa'] 
        });

        if (!producto) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        
        const empresaId = producto.id_empresa;

        const empresa = await Empresa.findOne({
            where: { id: empresaId },
            attributes: ['id_usuario']
        });
        
        if (!empresa) {
            return res.status(500).json({ success: false, message: 'La empresa del producto es inválida.' });
        }

        if (empresa.id_usuario === userId) {
            return next(); 
        } else {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permiso para modificar este producto. Debes ser el dueño de la empresa.' 
            });
        }

    } catch (error) {
        console.error("Error en el middleware isOwnerOfProduct:", error);
        return res.status(500).json({ success: false, message: 'Error interno de autorización.' });
    }
};