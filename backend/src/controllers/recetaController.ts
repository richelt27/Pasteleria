
import { Request, Response } from 'express';
import prisma from '../prisma';

export const getRecetaByProducto = async (req: Request, res: Response) => {
    try {
        const { id_producto } = req.params;
        const receta = await prisma.receta.findMany({
            where: { id_producto: Number(id_producto) },
            include: {
                insumo: true
            }
        });
        res.json(receta);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la receta' });
    }
};

export const addInsumoToReceta = async (req: Request, res: Response) => {
    try {
        const { id_producto, id_insumo, cantidad_requerida, unidad_uso } = req.body;

        const item = await prisma.receta.create({
            data: {
                id_producto: Number(id_producto),
                id_insumo: Number(id_insumo),
                cantidad_requerida: Number(cantidad_requerida),
                unidad_uso
            },
            include: { insumo: true }
        });
        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar insumo a la receta' });
    }
};

export const removeInsumoFromReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id_receta
        await prisma.receta.delete({
            where: { id_receta: Number(id) }
        });
        res.json({ message: 'Insumo eliminado de la receta' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar insumo' });
    }
};
