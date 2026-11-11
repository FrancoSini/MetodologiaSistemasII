import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/autentication.controller';

import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post('/registro', asyncHandler(registrarUsuario));
router.post('/login', asyncHandler(loginUsuario));

export default router;