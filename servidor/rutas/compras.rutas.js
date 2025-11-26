import { getHistorialDeCompraController } from "../controladores/compras.controlador.js";
import { Router } from 'express';
import userAuth from "../middleware/usuarioAuth.js";

export const comprasRouter = Router()

comprasRouter.get('/historial', userAuth ,getHistorialDeCompraController)