export const has_empresaAuth = async (req, res, next) => {

    try {
        if (!req.has_empresa) {
            return res.json({ success: false, message: 'El usuario no tiene una empresa creada' })
        }

        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }

}