import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
export const validarCampos = (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    
    if(!errores.isEmpty()){
        return res.status(400).json({
            ok: false,
            errores: errores.mapped()
        });

    }
    next();
}