import { Router } from "express";
import {
  crearProductoController,
  desactivarProductoController,
  modificarProductoController,
  productosAllController,
  productosIDController,
  obtenerProductosEmpresaController,
  obtenerProductosEmpresaPublicController
} from "../controladores/producto.controlador.js";
import userAuth from "../middleware/usuarioAuth.js";
import { multerUpload } from "../middleware/multerUpload.js";
import { isOwnerOfProduct } from "../middleware/isOwnerOfProduct.js";
import { has_empresaAuth } from "../middleware/has_empresaAuth.js";

const productoRouter = Router();

productoRouter.get("/mis-productos", userAuth, has_empresaAuth, obtenerProductosEmpresaController);
productoRouter.post("/crear", userAuth, multerUpload.single("archivo"), crearProductoController);
productoRouter.patch("/editar/:id", userAuth, isOwnerOfProduct, multerUpload.single("archivo"), modificarProductoController);
productoRouter.patch("/editar/:id/desactivar", userAuth, isOwnerOfProduct, desactivarProductoController);

productoRouter.get("/por-empresa/:id", obtenerProductosEmpresaPublicController);
productoRouter.get("/", productosAllController);
productoRouter.get("/:id", productosIDController);

export default productoRouter;
