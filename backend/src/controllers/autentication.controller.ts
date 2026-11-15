
import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { generarJWT } from "../utils/jwt";
import Usuario from "../models/Usuario";

// REGISTRO DE USUARIOS
export const registrarUsuario = async (
  req: Request,
  res: Response
) => {
  const { nombre, email, password } = req.body;

  try {
    // 1. Verificar si el correo ya existe.
    const existeEmail = await Usuario.findOne({
      where: { email },
    });

    if (existeEmail) {
      return res.status(400).json({
        ok: false,
        msg: "El correo ya está registrado",
      });
    }

    // 2. Encriptar la contraseña.
    const salt = bcrypt.genSaltSync(10);

    const passwordHasheada = bcrypt.hashSync(
      password,
      salt
    );

    // 3. Registrar al usuario como cliente.
    // No aceptamos el rol enviado desde el frontend.
    const usuario = await Usuario.create({
      nombre,
      email,
      passwordHash: passwordHasheada,
      rol: "cliente",
    });

    // 4. Generar el JWT con el rol.
    const token = await generarJWT(
      usuario.id.toString(),
      usuario.rol
    );

    // 5. Devolver la sesión.
    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado correctamente",
      uid: usuario.id,
      rol: usuario.rol,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      msg: "Error al registrar el usuario",
    });
  }
};

// INICIO DE SESIÓN
export const loginUsuario = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar el usuario.
    const usuario = await Usuario.findOne({
      where: { email },
    });

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña incorrectos",
      });
    }

    // 2. Verificar la contraseña.
    const validPassword = bcrypt.compareSync(
      password,
      usuario.passwordHash
    );

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Usuario o contraseña incorrectos",
      });
    }

    // 3. Generar JWT.
    const token = await generarJWT(
      usuario.id.toString(),
      usuario.rol
    );

    // 4. Devolver sesión y rol.
    return res.status(200).json({
      ok: true,
      msg: "Login exitoso",
      uid: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      msg: "Error al iniciar sesión",
    });
  }
};
