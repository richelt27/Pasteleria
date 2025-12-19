
import { Request, Response } from 'express';
import prisma from '../prisma';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true }
        });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await comparePassword(password, usuario.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (usuario.estado !== 'ACTIVO') {
            return res.status(403).json({ error: 'Usuario inactivo o suspendido' });
        }

        const token = generateToken({
            id: usuario.id_usuario,
            email: usuario.email,
            rol: usuario.rol.nombre
        });

        res.json({
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                email: usuario.email,
                rol: usuario.rol.nombre
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { nombre_completo, email, password, id_rol, telefono } = req.body;

        // Verificar si existe email
        const existingUser = await prisma.usuario.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await hashPassword(password);

        // Por defecto rol Cliente (id 2) si no se envía, o validar que el usuario que registra sea admin si asigna otros roles.
        // Para simplificar, permitiremos enviar id_rol por ahora, pero idealmente se controla.
        // Asumiremos 2 (Cliente) por defecto si no viene.

        const rolId = id_rol || 2;

        const newUser = await prisma.usuario.create({
            data: {
                nombre_completo,
                email,
                password_hash: hashedPassword,
                id_rol: rolId,
                telefono,
                estado: 'ACTIVO'
            }
        });

        res.status(201).json({ message: 'Usuario registrado correctamente', userId: newUser.id_usuario });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
}
