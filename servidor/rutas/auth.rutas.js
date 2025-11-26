import express from 'express';
import { 
    loginController, 
    logoutController, 
    registroController, 
    verificarEmailController,
    sendVerifyEmailOtpController, 
    isAuthenticatedController, 
    sendResetOtpController, 
    resetPasswordController, 
    sendVerifyTelefonoOtpController, 
    verificarTelefonoController 
} from '../controladores/auth.controlador.js';
import userAuth from '../middleware/usuarioAuth.js';
import { usernameValidator, OTPValidator, emailValidator, contraseñaValidator } from '../middleware/validadores.js';


//Rutas de autenticacion con Router

const authRouter = express.Router();

authRouter.post('/registro',[...usernameValidator, ...emailValidator, ...contraseñaValidator],  registroController);
authRouter.post('/login',[...emailValidator],  loginController);
authRouter.post('/logout', logoutController);
authRouter.post('/is-auth', userAuth, isAuthenticatedController);

authRouter.post('/enviar-email-otp', userAuth, sendVerifyEmailOtpController);
authRouter.post('/verificar-email-otp',[...OTPValidator], userAuth, verificarEmailController);

authRouter.post('/enviar-telefono-otp', userAuth, sendVerifyTelefonoOtpController);
authRouter.post('/verificar-telefono-otp',[...OTPValidator], userAuth, verificarTelefonoController);

authRouter.post('/enviar-reset-otp',[...emailValidator], sendResetOtpController);
authRouter.post('/reset-password',[...emailValidator, ...OTPValidator, ...contraseñaValidator], resetPasswordController);


export default authRouter;