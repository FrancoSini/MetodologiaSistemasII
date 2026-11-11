import { Router } from 'express';
import { obtenerPerfil, actualizarPerfil, listarUsuarios } from '../controllers/usuarios.controllers';
import { asyncHandler } from "../utils/asyncHandler";
import { validarToken, validarAdmin } from '../middlewares/auth';


const router = Router();
// operaciones para clientes -> usuarios logueados
router.get('/me', validarToken, asyncHandler(obtenerPerfil));
router.put('/me', validarToken, asyncHandler(actualizarPerfil));

//operaciones exclusivas para administradores
router.get('/', validarToken, validarAdmin, asyncHandler(listarUsuarios));

export default router;