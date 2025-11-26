import { Router } from 'express'
import { 
    crearSolicitud, 
    cambiarEstadoSolicitud, 
    obtenerUltimaSolicitud, 
    obtenerSolicitudesUsuario,
    obtenerSolicitudesAdmin
} from '../controladores/solicitud.controlador.js'

import userAuth from '../middleware/usuarioAuth.js'
import { is_admin } from '../middleware/is_admin.js'
import { archivoCertificadoValidator, nombreEmpresaValidator, rutValidator } from '../middleware/validadores.js'
import { multerUpload } from '../middleware/multerUpload.js'

const solicitudesRouter = Router()

solicitudesRouter.post('/solicitud', userAuth, multerUpload.single('archivo'),[...rutValidator, ...nombreEmpresaValidator, archivoCertificadoValidator], crearSolicitud)

solicitudesRouter.get('/ultima-solicitud', userAuth, obtenerUltimaSolicitud)

solicitudesRouter.get('/usuario', userAuth, obtenerSolicitudesUsuario)

solicitudesRouter.get('/admin',userAuth, is_admin, obtenerSolicitudesAdmin)

export default solicitudesRouter
