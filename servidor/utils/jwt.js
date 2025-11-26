import jwt from 'jsonwebtoken';

export const generarToken = (usuario) => {
    return jwt.sign(
        { 
            id: usuario.id,
            role: usuario.role,
            verifyEmail: usuario.is_email_verified,
            verifyPhone: usuario.is_phone_verified,
            has_empresa: usuario.has_empresa,
            estado: usuario.estado
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};