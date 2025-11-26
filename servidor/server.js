// Importaciones
import express from "express";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import { conectarDB } from "./configuracion/sequelize.js";
import authRouter from "./rutas/auth.rutas.js";
import userRouter from "./rutas/user.rutas.js";
import empresaRouter from "./rutas/empresa.rutas.js";
import carritoRouter from "./rutas/carrito.rutas.js";
import solicitudesRouter from "./rutas/solicitudes.rutas.js";
import productoRouter from "./rutas/producto.rutas.js";
import { comprasRouter } from "./rutas/compras.rutas.js";
import checkoutRouter from "./rutas/checkout.rutas.js";
import { adminRouter } from "./rutas/admin.rutas.js";
import comentarioRouter from "./rutas/comentarios.rutas.js";
import { reactivarUsuariosJob } from "./jobs/reactivarUsuarios.js";
import cors from "cors";

// Crear servidor Express
const app = express();
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  "http://localhost:5173",
  "https://startseed-web.onrender.com",
];


app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Middlewares globales
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf } }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Conectar a la base de datos
conectarDB();

// Activar tarea automática de reactivación de usuarios suspendidos
reactivarUsuariosJob();

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("Servidor StartSeed en funcionamiento ");
});

// Rutas API
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/empresa", empresaRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/productos", productoRouter);
app.use("/api/carrito", carritoRouter);
app.use("/api/compras", comprasRouter);
app.use("/api/pago", checkoutRouter);
app.use("/api/admin", adminRouter);
app.use("/api/comentario", comentarioRouter);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(` Servidor en puerto ${PORT}`);
});
