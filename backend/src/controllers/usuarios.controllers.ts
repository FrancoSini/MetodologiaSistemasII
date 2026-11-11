import { Response } from "express";
import { authRequest } from  '../middlewares/auth';
import * as usuarioService from '../services/usuarioService';

export const obtenerPerfil = async (req: authRequest, res: Response) => {
    try {
        const uid = req.usuario!.uid;
        const usuario = await usuarioService.obtenerUsuarioPorId(uid);
        
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ok: true, usuario});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener el perfil del usuario" });
    }
};

export const actualizarPerfil = async (req: authRequest, res: Response) => {
    try {
        const uid = req.usuario!.uid;
        const usuarioActualizado = await usuarioService.actualizarDatosUsuario(uid, req.body);
        res.json({
            ok:true,
            msg: 'perfil actualizado correctamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al actualizar el perfil del usuario" });
    }
};

export const listarUsuarios = async (req: authRequest, res: Response) => {
    try {
        const usuarios = await usuarioService.obtenerTodosUsuarios();
        res.json({ok:true, usuarios});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener la lista de usuarios" });
    }
};
