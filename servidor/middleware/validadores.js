import { body, check } from "express-validator";

export const contraseñaValidator = [
    body("password")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&.])[A-Za-z\d@$#!%*?&.]{8,}$/)
        .withMessage("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"),
];

export const OTPValidator = [
    body("otp")
    .isLength({ min: 6, max: 6 }).withMessage("OTP debe tener 6 dígitos")
    .matches(/^\d{6}$/).withMessage("OTP solo puede contener números")
];

export const emailValidator = [
    body("email")
        .isEmail().withMessage("Debe ser un email válido"),
]

export const usernameValidator = [
    body("username")
        .isLength({ min: 3, max: 100 }).withMessage("El username debe tener entre 3 y 100 caracteres")
        .matches(/^[a-zA-Z0-9]+$/).withMessage("El username solo puede contener letras, números y guion bajo")
];

export const nombreValidator = [
    body("nombre")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
        .matches(/^[a-zA-Z]+$/).withMessage("El nombre solo puede contener letras")
];

export const nombreEmpresaValidator = [
    body("nombre")
        .isLength({ min: 3, max: 100 }).withMessage("El nombre debe tener entre 3 y 100 caracteres")
        .matches(/^[a-zA-Z0-9\s.]+$/).withMessage("El campo solo puede contener letras, números, espacios y puntos.")
];

export const apellidoValidator = [
    body("apellido")
        .isLength({ min: 3, max: 100 }).withMessage("El apellido debe tener entre 3 y 100 caracteres")
        .matches(/^[a-zA-Z]+$/).withMessage("El apellido solo puede contener letras")
];

export const telefonoValidator = [
    body("telefono")
        .optional()
        .matches(/^\+56\d{9}$/)
        .withMessage("El teléfono debe tener el formato +569XXXXXXXX")
];

export const rutValidator = [
    body('rut')
        .notEmpty().withMessage('El RUT es obligatorio.')
        .isString().withMessage('El RUT debe ser una cadena de texto.')
        .trim()
        .matches(/^(\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]|\d{7,8}-[\dkK])$/)
            .withMessage('El formato del RUT es incorrecto (ej: 11.111.111-K o 12345678-9).')
];

export const archivoCertificadoValidator = [
    check('archivo').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Falta adjuntar el certificado.');
        }
        return true;
    }).withMessage('El certificado es obligatorio.')
];

export const estadoSolicitudValidator = [
    check('id')
        .exists().withMessage('El ID de la solicitud es obligatorio.')
        .isUUID().withMessage('El ID de solicitud es inválido.'),
    
    check('estado')
        .exists().withMessage('El estado es obligatorio.')
        .isIn(['aceptada', 'rechazada']).withMessage('Estado inválido. Debe ser "aceptada" o "rechazada".'),

    check('razon_rechazo')
        .if(check('estado').equals('rechazada'))
        .notEmpty().withMessage('La razón de rechazo es obligatoria si el estado es "rechazada".')
];

