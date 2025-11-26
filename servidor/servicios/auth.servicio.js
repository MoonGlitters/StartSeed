import { usuarioRepositorio } from '../repositorios/usuario.repositorio.js';
import bcrypt from 'bcrypt';
import { generarToken } from '../utils/jwt.js';
import { sendSMS } from '../utils/sms.js';
import { enviarEmailBienvenida, enviarEmailOTP, enviarEmailReset } from './notificacion.servicio.js';

// Registro
export const registrarUsuario = async (userData) => {
    const { email } = userData;

    if (await usuarioRepositorio.findByEmail(email)) {
        throw new Error('El Email ya esta registrado'); 
    }

    const usuario = await usuarioRepositorio.create(userData);
    const token = generarToken(usuario);

    await enviarEmailBienvenida(email)

    return { token, usuario };
};

//Login

export const loginUsuario = async (email, password) => {
    const usuario = await usuarioRepositorio.findByEmail(email);

    if (!usuario) throw new Error("Credenciales inválidas");

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) throw new Error("Credenciales inválidas");

    //  Bloquear si esta inactivo
    if (usuario.estado === "inactiva") {
        throw new Error("Tu cuenta fue inactivada. Contacta con soporte.");
    }
    // Bloquear si esta suspendido
    if (usuario.estado === "suspendida") {
        const fecha = new Date(usuario.suspension_expira_at).toLocaleString("es-CL", {
        dateStyle: "long",
        timeStyle: "short",
        });
        throw new Error(`Tu cuenta está suspendida hasta ${fecha}.`);
    }

    //  Solo si está activa generas el token
    const token = generarToken(usuario);
    return { token, usuario };
    };

// Verificacion Email

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));
const EXP_OTP_TIME = 60 * 1000; 

export const sendVerifyEmailOtp = async (userid) => {
    const usuario = await usuarioRepositorio.findById(userid);
    
    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.is_email_verified) throw new Error('Email ya verificado');
    const OTP = generateOTP();
    usuario.verify_email_otp = OTP;
    usuario.verify_email_otp_expire_at = Date.now() + EXP_OTP_TIME;

    await usuarioRepositorio.save(usuario);

    await enviarEmailOTP(usuario.email, OTP)

    return true;
};

export const verificarEmailOTP = async (userid, otp) => {

    const usuario = await usuarioRepositorio.findById(userid);

    if (!usuario) throw new Error('Usuario no existe');
    if (usuario.verify_email_otp === '' || usuario.verify_email_otp !== otp) throw new Error('OTP inválido');
    if (usuario.verify_email_otp_expire_at < Date.now()) throw new Error('OTP expirado');

    usuario.is_email_verified = true;
    usuario.verify_email_otp = '';
    usuario.verify_email_otp_expire_at = null;
    await usuarioRepositorio.save(usuario);
    
    const newToken = generarToken(usuario);
    return { newToken };
};

// Verificar Telefono

export const sendVerifyTelefonoOtp = async (userid) => {

    const usuario = await usuarioRepositorio.findById(userid);
    
    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.is_phone_verified) throw new Error('Teléfono ya verificado');
    if (!usuario.telefono) throw new Error('Teléfono no registrado para el usuario');

    const OTP = generateOTP();
    usuario.verify_phone_otp = OTP;
    usuario.verify_phone_otp_expire_at = Date.now() + EXP_OTP_TIME;

    await usuarioRepositorio.save(usuario);
    await sendSMS(usuario.telefono, OTP);
    
    return true;
};

export const verificarTelefonoOTP = async (userid, otp) => {

    const usuario = await usuarioRepositorio.findById(userid);

    if (!usuario) throw new Error('Usuario no existe');
    if (usuario.verify_phone_otp === '' || usuario.verify_phone_otp !== otp) throw new Error('OTP inválido');
    if (usuario.verify_phone_otp_expire_at < Date.now()) throw new Error('OTP expirado');

    usuario.is_phone_verified = true;
    usuario.verify_phone_otp = '';
    usuario.verify_phone_otp_expire_at = null;
    await usuarioRepositorio.save(usuario);
    
    const newToken = generarToken(usuario);
    return { newToken };
};


// Reset de Contraseña

export const sendResetOtp = async (email) => {

    const usuario = await usuarioRepositorio.findByEmail(email);
    
    if (!usuario) throw new Error('Usuario no encontrado');

    const OTP = generateOTP();
    usuario.reset_otp = OTP;
    usuario.reset_otp_expire_at = Date.now() + EXP_OTP_TIME;

    await usuarioRepositorio.save(usuario);

    await enviarEmailReset(usuario.email, OTP)
    
    return true;
};

export const resetPassword = async (email, otp, newPassword) => {
    const usuario = await usuarioRepositorio.findByEmail(email);

    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.reset_otp === '' || usuario.reset_otp !== otp) throw new Error('OTP inválido');
    if (usuario.reset_otp_expire_at < Date.now()) throw new Error('OTP expirado');

    usuario.password = newPassword;
    usuario.reset_otp = '';
    usuario.reset_otp_expire_at = null;
    
    await usuarioRepositorio.save(usuario);
    
    return true;
};