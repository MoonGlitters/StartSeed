import { z } from "zod";
import { isValidRut } from "../rutUtils.js";

export const SolicitudSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  rut: z
    .string()
    .min(3, "RUT requerido.")
    .refine((v) => isValidRut(v), "El RUT no es válido."),
  archivo: z
    .any()
    .refine((file) => file instanceof File, "Debes adjuntar un archivo.")
    .refine(
      (file) => ["application/pdf", "image/png", "image/jpeg"].includes(file.type),
      "El archivo debe ser PDF, JPG o PNG."
    ),
});
