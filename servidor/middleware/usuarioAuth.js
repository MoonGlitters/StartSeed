import jwt from "jsonwebtoken";

// midlewares

// Este verifica que exista un token y devuelve el id de la persona con el token
const userAuth = async (req, res, next) => {
    const { token } = req.cookies

    if(!token) {
        return res.json({success: false, message: 'No autorizado, Loguear nuevamente'})
    }
    try {
        const tokenVerificado = jwt.verify(token, process.env.JWT_SECRET)

        if (!tokenVerificado || !tokenVerificado.id) {
            return res.status(401).json({ success: false, message: "No autorizado, loguear nuevamente" });
        }

        req.userid = tokenVerificado.id
        req.role = tokenVerificado.role
        req.verifyEmail = tokenVerificado.verifyEmail
        req.verifyPhone = tokenVerificado.verifyPhone
        req.has_empresa = tokenVerificado.has_empresa
        next();
        
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }

}

export default userAuth;