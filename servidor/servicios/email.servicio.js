import 'dotenv/config';
import sgMail from '@sendgrid/mail'

const SENDER_EMAIL = process.env.SENDER_EMAIL || "no-reply@startseed.cl";

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

export const emailServicio = async ({ to, subject, html = "", text = "" }) => {
  try {
    if (!to) throw new Error("El destinatario 'to' es obligatorio.");
    if (!subject || subject.trim() === "")
      throw new Error("El asunto 'subject' es obligatorio.");

    // Asegura que haya contenido
    const contenidoHtml =
      html && html.trim() !== ""
        ? html
        : text && text.trim() !== ""
        ? `<p>${text}</p>`
        : `<p>Mensaje automático de StartSeed. No se proporcionó contenido.</p>`;

    const contenidoTexto =
      text && text.trim() !== ""
        ? text
        : "Mensaje automático de StartSeed. No se proporcionó contenido.";

    const msg = {
      to,
      from: {
        email: SENDER_EMAIL,
        name: "StartSeed",
      },
      subject,
      html: contenidoHtml,
      text: contenidoTexto,
    };

    console.log("Enviando correo con contenido:", {
      to,
      subject,
      tieneHTML: Boolean(html),
      tieneTexto: Boolean(text),
    });

    await sgMail.send(msg);
    console.log(`Correo enviado correctamente a: ${to} - Asunto: ${subject}`);
  } catch (error) {
    console.error(
      "Error al enviar el correo con SendGrid:",
      error.response?.body || error.message
    );
  }
};

