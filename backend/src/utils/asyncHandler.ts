import { NextFunction, Request, RequestHandler, Response } from "express";

// Envuelve un controller async para que cualquier error llegue al errorHandler.
// (Express 5 ya captura promesas rechazadas, pero dejamos explícito
// para que el código de los controllers sea uniforme y fácil de leer.)
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
  //Cuando una función async falla, el error no llega solo al manejador de errores. 
  // Esto atrapa el fallo y se lo pasa con next,
  //  así en los controllers no hay que escribir try/catch en cada uno.