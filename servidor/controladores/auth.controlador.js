import { handleValidation } from '../utils/express-validator.js';
import { setAuthCookie } from '../utils/cookie.js';
import { 
    loginUsuario, 
    registrarUsuario, 
    sendVerifyEmailOtp, 
    verificarEmailOTP,
    sendVerifyTelefonoOtp,
    verificarTelefonoOTP,
    sendResetOtp,
    resetPassword
} from '../servicios/auth.servicio.js';

// registro, login, logout

export const registroController = async (req, res) => {
    if (handleValidation(req, res)) return;

    try {
        const { token } = await registrarUsuario(req.body);
        setAuthCookie(res, token);
        
        return res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (error) {
        const status = error.message.includes('ya esta registrado') ? 409 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const loginController = async (req, res) => {
    if (handleValidation(req, res)) return;

    const { email, password } = req.body;

    try {
        const { token, usuario } = await loginUsuario(email, password);
        setAuthCookie(res, token);

        res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        userData: {
            id: usuario.id,
            username: usuario.username,
            email: usuario.email,
            role: usuario.role,
            estado: usuario.estado,
            suspension_expira_at: usuario.suspension_expira_at,
        },
        });
    } catch (error) {
        const status = error.message.includes("inválidas") ? 401 : 403;
        res.status(status).json({ success: false, message: error.message });
    }
};

export const logoutController = (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
        return res.json({ success: true, message: 'Deslogueado' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Email
export const sendVerifyEmailOtpController = async (req, res) => {
    try {
        await sendVerifyEmailOtp(req.userid);
        return res.json({ success: true, message: 'Verificacion OTP enviada al email' });
    } catch (error) {
        const status = error.message.includes('no encontrado') || error.message.includes('ya verificado') ? 400 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const verificarEmailController = async (req, res) => {
    if (handleValidation(req, res)) return;
    
    try {
        const { newToken } = await verificarEmailOTP(req.userid, req.body.otp);
        setAuthCookie(res, newToken);
        
        return res.json({ success: true, message: 'Email verificado exitosamente' });
    } catch (error) {
        const status = error.message.includes('inválido') || error.message.includes('expirado') ? 400 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

// Reset Pass

export const sendResetOtpController = async (req, res) => {
    if (handleValidation(req, res)) return;

    try {
        await sendResetOtp(req.body.email);
        return res.json({ success: true, message: 'OTP enviado al email' });
    } catch (error) {
        // En un login/reset, a menudo devolvemos 200 para eludir la enumeración de usuarios.
        return res.json({ success: true, message: 'Si el usuario existe, se enviará el OTP.' + error });
    }
};

export const resetPasswordController = async (req, res) => {
    if (handleValidation(req, res)) return;

    const { email, otp, password } = req.body;

    try {
        await resetPassword(email, otp, password);
        return res.json({ success: true, message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        const status = error.message.includes('inválido') || error.message.includes('expirado') ? 400 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

// Telefono

export const sendVerifyTelefonoOtpController = async (req, res) => {
    try {
        await sendVerifyTelefonoOtp(req.userid);
        return res.json({ success: true, message: 'Verificación OTP enviada al teléfono' });
    } catch (error) {
        const status = error.message.includes('no encontrado') || error.message.includes('ya verificado') || error.message.includes('no registrado') ? 400 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};

export const verificarTelefonoController = async (req, res) => {
    if (handleValidation(req, res)) return;
    
    try {
        const { newToken } = await verificarTelefonoOTP(req.userid, req.body.otp);
        setAuthCookie(res, newToken); // Actualizar cookie con el nuevo token

        return res.json({ success: true, message: 'Teléfono verificado exitosamente' });
    } catch (error) {
        const status = error.message.includes('inválido') || error.message.includes('expirado') ? 400 : 500;
        return res.status(status).json({ success: false, message: error.message });
    }
};


// Se tiene que usar para verificar si esta logeado el usuario
export const isAuthenticatedController = (req, res) => {
    return res.json({ success: true, message: 'Usuario autenticado' });
};



