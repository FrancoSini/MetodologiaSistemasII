import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'secreto_seguro_cine'

export const generarJWT = (uid: string, rol: string) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, rol };

        jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: '2h' },
            (err: Error | null, token: string | undefined) => {
                if (err || !token) {
                    console.error(err);
                    reject('No se pudo generar el token');
                } else {
                    resolve(token);
                }
            }
        );

    });
};
export const verificarJWT = (token:string) => {
    try{
        return jwt.verify(token, SECRET_KEY);
    }catch(err){
        console.error(err);
        return null;
    }
};
    