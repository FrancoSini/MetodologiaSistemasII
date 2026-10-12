import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generarJWT } from '../utils/jwt';
import Usuario from '../models/Usuario';

export const registrarUsuario = async (req: Request, res: Response) => {
    const { nombre, email, password, rol = "Cliente" } = req.body;

    try {
        //1. Verificar si el mail ya existe
        const existeEmail = await Usuario.findOne({ where: { email } });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        // 2. rncriptar la contraseña antes de guardarla 
        const salt = bcrypt.genSaltSync(10);
        const passwordHasheada = bcrypt.hashSync(password, salt);

        // 3. Crear el registro del usuaio en la bdd

        const usuario = await Usuario.create({ 
            nombre, 
            email, 
            passwordHash: passwordHasheada, 
            rol });

        // 4. Generar el JWT
        const token = await generarJWT(usuario.id.toString(), usuario.rol);
        
        res.status(201).json({
            ok: true,
            msg: 'Usuario registrado correctamente',
            uid: usuario.id,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al registrar el usuario'
        });
    }
};

export const loginUsuario = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        //1 buscar si el usuario exste
        const usuario = await Usuario.findOne ({ where: { email } });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos'
            });
        }
        //2 validar que la contrasena coincida con el passwordhash
        const validPassword = bcrypt.compareSync(password, usuario.passwordHash);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos'
            });
        }
        const token = await generarJWT(usuario.id.toString(), usuario.rol);
        res.json({
            ok: true,
            msg: 'Login exitoso',
            uid: usuario.id,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al iniciar sesión'
        });
    }
};  
