export const is_admin = async (req, res, next) => {

    try {
        if (req.role !== 'admin') {
            return res.json({ success: false, message: 'El usuario no tiene  permisos de administrador' })
        }

        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }

}