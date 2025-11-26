import { Router } from 'express';
import userAuth from '../middleware/usuarioAuth.js';
import { is_admin } from '../middleware/is_admin.js';
import { estadoSolicitudValidator } from '../middleware/validadores.js';
import { cambiarEstadoSolicitud } from '../controladores/solicitud.controlador.js';
import { 
    aprobarDesembolsoController, 
    getDesembolsosPendientesController, 
    rechazarDesembolsoController 
} from '../controladores/desembolso.controlador.js';
import { getReporteEmpresaController, getReporteFinancieroGlobalController } from '../controladores/reportes.controlador.js';
import { cambiarEstadoUsuarioController, suspenderUsuarioController } from '../controladores/user.controlador.js';
import { cambiarEstadoEmpresaController } from '../controladores/empresa.controlador.js';
import { actualizarConfiguracionController, obtenerConfiguracionController } from '../controladores/confGlobal.controlador.js';



export const adminRouter = Router();


adminRouter.patch('/estado-solicitud', userAuth, is_admin,[...estadoSolicitudValidator], cambiarEstadoSolicitud)

adminRouter.get('/reportes/finanzas',userAuth, is_admin, getReporteFinancieroGlobalController);
adminRouter.get('/reportes/:empresaId/finanzas', userAuth, is_admin, getReporteEmpresaController)

adminRouter.get('/desembolsos/pendientes', userAuth, is_admin, getDesembolsosPendientesController);
adminRouter.post('/desembolsos/:id_solicitud/rechazar', userAuth, is_admin, rechazarDesembolsoController);

adminRouter.post('/desembolsos/:id_solicitud/aprobar', userAuth, is_admin, aprobarDesembolsoController);

// Control de usuarios y empresas

adminRouter.put('/users/:id/suspender-temporal',userAuth,is_admin, suspenderUsuarioController); 

// Inactivar/Activar permanentemente un usuario
adminRouter.put('/users/:id/estado',userAuth, is_admin, cambiarEstadoUsuarioController);

// Inactivar/Activar una empresa
adminRouter.put('/empresas/:id/estado',userAuth, is_admin, cambiarEstadoEmpresaController);

// confGlobal

adminRouter.get("/conf", obtenerConfiguracionController);

// PUT para actualizar (solo admin)
adminRouter.put("/conf/update", actualizarConfiguracionController);




