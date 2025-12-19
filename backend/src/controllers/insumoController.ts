
import { Request, Response } from 'express';
import prisma from '../prisma';
import { UnidadMedida } from '@prisma/client';

export const getInsumos = async (req: Request, res: Response) => {
    try {
        const insumos = await prisma.insumo.findMany({
            include: { proveedor: true },
            orderBy: { nombre: 'asc' }
        });
        res.json(insumos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener insumos' });
    }
};

export const createInsumo = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, unidad, stock_minimo, id_proveedor_preferido, stock_actual, costo_promedio } = req.body;

        if (!Object.values(UnidadMedida).includes(unidad)) {
            return res.status(400).json({ error: 'Unidad de medida inválida' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const insumo = await tx.insumo.create({
                data: {
                    nombre,
                    descripcion,
                    unidad,
                    stock_minimo: Number(stock_minimo) || 5,
                    id_proveedor_preferido: id_proveedor_preferido ? Number(id_proveedor_preferido) : null,
                    stock_actual: Number(stock_actual) || 0,
                    costo_promedio: Number(costo_promedio) || 0
                }
            });

            // Registrar Movimiento Inicial (Inventario Inicial)
            if (Number(stock_actual) > 0) {
                await tx.movimientoAlmacen.create({
                    data: {
                        id_insumo: insumo.id_insumo,
                        tipo: 'AJUSTE', // o COMPRA inicial
                        cantidad: Number(stock_actual),
                        costo_unitario: Number(costo_promedio) || 0,
                        observacion: 'Inventario Inicial',
                        id_usuario_responsable: 1 // Admin/System por defecto
                    }
                });
            }
            return insumo;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear insumo' });
    }
};

export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, unidad, stock_minimo, id_proveedor_preferido, stock_actual, costo_promedio } = req.body;

        await prisma.$transaction(async (tx) => {
            // Obtener stock anterior para calcular diferencia
            const oldInsumo = await tx.insumo.findUnique({ where: { id_insumo: Number(id) } });

            if (!oldInsumo) throw new Error('Insumo no encontrado');

            await tx.insumo.update({
                where: { id_insumo: Number(id) },
                data: {
                    nombre,
                    descripcion,
                    unidad,
                    stock_minimo: Number(stock_minimo),
                    id_proveedor_preferido: id_proveedor_preferido ? Number(id_proveedor_preferido) : null,
                    stock_actual: stock_actual !== undefined ? Number(stock_actual) : undefined,
                    costo_promedio: costo_promedio !== undefined ? Number(costo_promedio) : undefined
                }
            });

            // Si hay cambio de stock, registrar movimiento
            if (stock_actual !== undefined) {
                const diff = Number(stock_actual) - Number(oldInsumo.stock_actual);
                if (diff !== 0) {
                    await tx.movimientoAlmacen.create({
                        data: {
                            id_insumo: Number(id),
                            tipo: diff > 0 ? 'COMPRA' : 'AJUSTE', // Simplificación
                            cantidad: diff,
                            costo_unitario: Number(costo_promedio) || Number(oldInsumo.costo_promedio) || 0,
                            observacion: 'Actualización manual de stock',
                            id_usuario_responsable: 1
                        }
                    });
                }
            }
        });

        res.json({ message: 'Insumo actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar insumo' });
    }
};

export const deleteInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Insumos no tienen "activo" boolean en el schema original, si se quiere borrar 
        // hay que verificar dependencias. Si hay recetas o movimientos, fallará.
        // Por ahora intentaremos un delete físico, si falla es porque tiene relaciones.

        await prisma.insumo.delete({
            where: { id_insumo: Number(id) }
        });

        res.json({ message: 'Insumo eliminado' });
    } catch (error: any) {
        // P2003 es el código de error de Prisma para fallos de Foreign Key
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'No se puede eliminar: El insumo es parte de recetas o movimientos.' });
        }
        res.status(500).json({ error: 'Error al eliminar insumo' });
    }
};
