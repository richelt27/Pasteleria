
import { Request, Response } from 'express';
import prisma from '../prisma';

export const getProveedores = async (req: Request, res: Response) => {
    try {
        const proveedores = await prisma.proveedor.findMany({
            orderBy: { razon_social: 'asc' }
        });
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};

export const createProveedor = async (req: Request, res: Response) => {
    try {
        const { razon_social, ruc, contacto_nombre, telefono, email_contacto } = req.body;

        const proveedor = await prisma.proveedor.create({
            data: {
                razon_social,
                ruc,
                contacto_nombre,
                telefono,
                email_contacto
            }
        });
        res.status(201).json(proveedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear proveedor' });
    }
};

export const updateProveedor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { razon_social, ruc, contacto_nombre, telefono, email_contacto } = req.body;

        await prisma.proveedor.update({
            where: { id_proveedor: Number(id) },
            data: {
                razon_social,
                ruc,
                contacto_nombre,
                telefono,
                email_contacto
            }
        });
        res.json({ message: 'Proveedor actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
};

export const deleteProveedor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.proveedor.delete({ where: { id_proveedor: Number(id) } });
        res.json({ message: 'Proveedor eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
};
