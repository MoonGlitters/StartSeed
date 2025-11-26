import express from 'express';
import {
  deshabilitarEmpresaController,
  editarEmpresaController,
  crearEmpresaController,
  empresaAllController,
  getEmpresaUsuarioController,
  empresaIdController,
  getDashboardEmpresaController,
  empresaAllActivasController,
} from '../controladores/empresa.controlador.js';

import userAuth from '../middleware/usuarioAuth.js';
import { isOwnerOrAdmin} from '../middleware/isOwnerOrAdmin.js';
import { has_empresaAuth } from '../middleware/has_empresaAuth.js';
import { is_admin } from '../middleware/is_admin.js'
import {
  getDatosBancariosEmpresa,
  updateDatosBancariosEmpresa,
} from '../controladores/cuentaBancaria.controlador.js';
import {
  getGananciasPendientesController,
  solicitarDesembolsoController,
} from '../controladores/desembolso.controlador.js';

const empresaRouter = express.Router();



//  Cuenta Bancaria
empresaRouter.get('/banco', userAuth, has_empresaAuth, getDatosBancariosEmpresa);
empresaRouter.post('/banco', userAuth, has_empresaAuth, updateDatosBancariosEmpresa);

//  Desembolsos
empresaRouter.get('/ganancias-pendientes', userAuth, getGananciasPendientesController);
empresaRouter.post('/solicitar-desembolso', userAuth, solicitarDesembolsoController);

//  Dashboard
empresaRouter.get('/dashboard', userAuth, has_empresaAuth, getDashboardEmpresaController);

// Empresa del usuario logueado
empresaRouter.get('/usuario', userAuth, getEmpresaUsuarioController);

//  Listados generales
empresaRouter.get('/activas', empresaAllActivasController);
empresaRouter.get('/',userAuth, is_admin, empresaAllController);

//  Rutas con parámetros dinámicos
empresaRouter.get('/:id', empresaIdController);
empresaRouter.patch('/editar/:id', userAuth, isOwnerOrAdmin, editarEmpresaController);
empresaRouter.patch('/:id/deshabilitar', userAuth, isOwnerOrAdmin, deshabilitarEmpresaController);

// Creacion
empresaRouter.post('/crear', userAuth, crearEmpresaController);

export default empresaRouter;


