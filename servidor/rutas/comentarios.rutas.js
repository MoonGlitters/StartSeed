import { 
  crearComentarioController, 
  obtenerComentariosController, 
  obtenerPromedioEmpresaController 
} from "../controladores/comentarioEmp.controlador.js";

import { 
  crearComentarioProductoController, 
  obtenerComentariosProductoController, 
  obtenerPromedioProductoController 
} from "../controladores/comentarioPro.controlador.js";

import userAuth from "../middleware/usuarioAuth.js";
import { Router } from 'express';

const comentarioRouter = Router();

// Empresa

// crear comentario
comentarioRouter.post("/comentar_emp", userAuth, crearComentarioController);

// promedio empresa 
comentarioRouter.get("/promedio_emp/:id_empresa", obtenerPromedioEmpresaController);

// lista comentarios empresa
comentarioRouter.get("/empresa/:id_empresa", obtenerComentariosController);



// Producto

// crear comentario
comentarioRouter.post("/comentar_pro", userAuth, crearComentarioProductoController);

// promedio producto 
comentarioRouter.get("/promedio_pro/:id_producto", obtenerPromedioProductoController);

// lista comentarios producto
comentarioRouter.get("/producto/:id_producto", obtenerComentariosProductoController);



export default comentarioRouter;