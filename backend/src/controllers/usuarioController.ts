
import { Request, Response } from 'express';
import prisma from '../prisma';
import { hashPassword } from '../utils/auth';

export const getUsuarios = async (req: Request, res: Response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            include: { rol: true },
            orderBy: { id_usuario: 'asc' }
        });
        // Ocultar password_hash en la respuesta
        const usuariosSafe = usuarios.map(u => {
            const { password_hash, ...rest } = u;
            return rest;
        });
        res.json(usuariosSafe);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const createUsuario = async (req: Request, res: Response) => {
    try {
        const { nombre_completo, email, password, id_rol, telefono, direccion } = req.body;

        const existingUser = await prisma.usuario.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await hashPassword(password);

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre_completo,
                email,
                password_hash: hashedPassword,
                id_rol: Number(id_rol),
                telefono,
                direccion_default: direccion
            }
        });

        res.status(201).json({ message: 'Usuario creado exitosamente', userId: nuevoUsuario.id_usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

export const updateUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre_completo, id_rol, telefono, estado, direccion } = req.body;

        await prisma.usuario.update({
            where: { id_usuario: Number(id) },
            data: {
                nombre_completo,
                id_rol: id_rol ? Number(id_rol) : undefined,
                telefono,
                estado,
                direccion_default: direccion
            }
        });

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft remove: Cambiar estado a INACTIVO en lugar de borrar para mantener historial
        await prisma.usuario.update({
            where: { id_usuario: Number(id) },
            data: { estado: 'INACTIVO' }
        });
        res.json({ message: 'Usuario desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};
