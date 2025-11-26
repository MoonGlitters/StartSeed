import express from 'express';
import { 
    obtenerCarritoController, 
    agregarItemController, 
    eliminarItemController, 
    actualizarItemController, 
    vaciarCarritoController 
} from '../controladores/carrito.controlador.js';
import userAuth from '../middleware/usuarioAuth.js';

const carritoRouter = express.Router();

carritoRouter.get('/', userAuth, obtenerCarritoController);

carritoRouter.post('/items',userAuth, agregarItemController);

carritoRouter.patch('/items/:itemId',userAuth, actualizarItemController);

carritoRouter.delete('/items/:itemId',userAuth, eliminarItemController);
carritoRouter.delete('/',userAuth, vaciarCarritoController);

export default carritoRouter;