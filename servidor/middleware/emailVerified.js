const emailVerified = async (req, res, next) => {

    try {
        if (!req.emailVerified) {
            return res.json({ success: false, message: 'El usuario no tiene el email verificado' })
        }

        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}