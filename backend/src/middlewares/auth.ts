import { Request, Response, NextFunction } from "express";
import { verificarJWT } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export interface authRequest extends Request {
    usuario?: {
        uid: string;
        rol: string;
    };
}   
interface tokenPayload extends JwtPayload {
    uid: string;
    rol: string;
}

export const validarToken = (req: authRequest, res: Response, next: NextFunction) => {
    const token = req.header('x-token') || req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        const payload = verificarJWT(token) as tokenPayload | null;
        if (!payload || typeof payload === 'string' || !payload.uid) {
            return res.status(401).json({ ok: false, msg: 'Token no válido' });
        }
        req.usuario = payload;
        next();
    } catch (error) {
        res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
};

export const validarAdmin = (req: authRequest, res: Response, next: NextFunction) => {
    if (!req.usuario) {
        return res.status(500).json({msg: 'Se intento verificar el rol sin validar el token primero'});
    }

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            ok: false,
            msg: 'No tiene privilegios para realizar esta acción'
        });
    }

    next();
};
