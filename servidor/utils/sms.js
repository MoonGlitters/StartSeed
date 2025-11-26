import { client } from "../configuracion/twillio.js";

export const sendSMS = async (phoneNumber, otp) => {
    return await client.messages.create({
        body: `Tu OTP es: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
    });
};