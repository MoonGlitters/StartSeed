import { checkoutController } from "../controladores/checkout.controlador.js";
import { webhookMPController } from "../controladores/webHookMP.controlador.js";
import { processPaymentController } from "../controladores/mpProcessPaymentController.js";

import { Router } from "express";
import userAuth from "../middleware/usuarioAuth.js";

const checkoutRouter = Router();

checkoutRouter.post("/checkout",userAuth, checkoutController);
checkoutRouter.post("/mp/pago", webhookMPController);
checkoutRouter.post("/process_payment", processPaymentController);


export default checkoutRouter;