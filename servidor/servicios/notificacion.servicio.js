import { emailServicio } from './email.servicio.js';
import { usuarioRepositorio } from '../repositorios/usuario.repositorio.js'; 


export const enviarConfirmacionCompra = async (id_usuario, id_venta) => {
    try {
        const usuario = await usuarioRepositorio.findById(id_usuario);

        if (!usuario || !usuario.email) {
        console.error(`No se encontró el email para el usuario ID: ${id_usuario}`);
        return;
        }

        const email = usuario.email;
        const nombre = usuario.nombre || "Cliente";

        const subject = `🌱 ¡Gracias por tu compra #${id_venta} en StartSeed!`;

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${subject}</title>
            <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background-color: #f5f7f9;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            .header {
                background-color: #2e7d32;
                padding: 20px;
                text-align: center;
                color: #ffffff;
            }
            .header img {
                width: 120px;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px;
                line-height: 1.6;
            }
            h1 {
                color: #2e7d32;
                font-size: 22px;
            }
            p {
                margin-bottom: 16px;
            }
            .cta-button {
                display: inline-block;
                background-color: #43a047;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.2s ease-in-out;
            }
            .cta-button:hover {
                background-color: #2e7d32;
            }
            .footer {
                background-color: #f0f0f0;
                padding: 15px;
                text-align: center;
                font-size: 12px;
                color: #777;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <img src="https://startseed.cl/logo.png" alt="StartSeed Logo" />
                <h2>¡Compra confirmada!</h2>
            </div>
            <div class="content">
                <h1>Hola, ${nombre} 👋</h1>
                <p>Queremos agradecerte por confiar en <strong>StartSeed</strong>.</p>
                <p>Tu pago ha sido confirmado exitosamente para el pedido <strong>#${id_venta}</strong>.</p>
                <p>En breve recibirás actualizaciones sobre el envío y podrás revisar tu historial en tu cuenta.</p>
                <div style="text-align:center; margin-top:20px;">
                <a href="https://startseed-web.onrender.com/historial" class="cta-button">
                    Ver mi compra
                </a>
                </div>
                <p style="margin-top:30px;">Si tienes alguna duda, contáctanos respondiendo este correo o visitando nuestro centro de ayuda.</p>
            </div>
            <div class="footer">
                © ${new Date().getFullYear()} StartSeed. Todos los derechos reservados.<br />
                Este es un mensaje automático, por favor no respondas directamente.
            </div>
            </div>
        </body>
        </html>
        `;

        await emailServicio({ to: email, subject, html: htmlContent });
        console.log(`Correo de confirmación enviado a: ${email}`);
    } catch (error) {
        console.error("Error al enviar correo de confirmación:", error.message);
    }
};

export const enviarEmailOTP = async (email, otp) => {
    const to = email
    const subject = 'Clave de verificacion OTP'
    const text = `Tu clave de verificacion es: ${otp}. Verifica tu cuenta usando esta clave`
    await emailServicio({to, subject, text})
}

export const enviarEmailBienvenida = async (email) => {

    const to = email
    const subject = 'Bienvenido a StartSeed'
    const text = `Bienvenido a StartSeed Website. Tu cuenta fue creada exitosamente con este email: ${email}`

    await emailServicio({to, subject, text})
}

export const enviarEmailReset = async (email, otp) => {

    const to = email
    const subject = 'Reset de contraseña OTP'
    const text = `Tu clave OTP para reset de contraseña es: ${otp}. Usa este OTP para cambiar tu contraseña`

    await emailServicio({to, subject, text})
}

export const enviarEmailSolicitud = async(email) => {

    const to = email
    const subject = nuevoEstado === 'aceptada' ? '¡Felicidades! Tu Solicitud ha sido ACEPTADA.' : 'Actualización de Solicitud: Rechazada.';
    const text = nuevoEstado === 'aceptada' 
        ? `Tu solicitud de creación de empresa ha sido aprobada. Ya puedes proceder a crear tu empresa de forma definitiva.`
        : `Lamentamos informarte que tu solicitud ha sido rechazada. Razón: ${razonRechazo || 'No especificada.'}`;

    await emailServicio({to, subject, text})
}