//sirve para mas adelante, en un controller, en vez de armar respuestas a mano, se puede escribir cosas
//como throw new AppError("No se encontró el usuario", 404) y se va a manejar en el middleware de errores

export class AppError extends Error {
    public readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "AppError";
        this.status = status;
    }
}
//es un error esperado de la aplicacion, el errorhandler lo convierte en respuesta http con el status code que le pasamos, y el mensaje que le pasamos.}
