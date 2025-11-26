import { validationResult } from 'express-validator';

export const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map(err => err.msg), 
        });
    }
    return null;
};