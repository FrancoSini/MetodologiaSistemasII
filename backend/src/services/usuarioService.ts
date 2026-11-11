import Usuario from "../models/Usuario";

export const obtenerUsuarioPorId = async (uid:string) => {
    
    // la contrasena queda excluida por seguridad
    return await Usuario.findByPk(uid, {
        attributes: {exclude: ["passwordHash"]},
    });
};

export const actualizarDatosUsuario = async (uid:string, datos: any) => {
    const usuario = await Usuario.findByPk(uid);
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }
    const {password, passwordHash, rol, ...datosPermitidos} = datos;
    await usuario.update(datosPermitidos);

    return await obtenerUsuarioPorId(uid);
};

export const obtenerTodosUsuarios = async () => {
    return await Usuario.findAll({
        attributes: {exclude: ["passwordHash"]},
    });
}