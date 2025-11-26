import express from 'express';
import { getUserData, usuarioAll, usuarioId, editarUsuario, eliminarUsuario } from '../controladores/user.controlador.js';
import userAuth from '../middleware/usuarioAuth.js';
import { multerUpload } from '../middleware/multerUpload.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);


//GET
userRouter.get('/', usuarioAll)
userRouter.get('/:id', usuarioId)
//PATCH
userRouter.patch('/editar',userAuth, multerUpload.single('img_perfil'), editarUsuario)

//DELETE
userRouter.delete('/eliminar/:id',userAuth, eliminarUsuario)

export default userRouter;