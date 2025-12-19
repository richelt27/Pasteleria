
import { Request, Response } from 'express';
import prisma from '../prisma';
import { EstadoOrden } from '@prisma/client';

export const getOrdenesProduccion = async (req: Request, res: Response) => {
    try {
        const ordenes = await prisma.ordenProduccion.findMany({
            include: {
                producto: true,
                pastelero: {
                    select: { id_usuario: true, nombre_completo: true }
                }
            },
            orderBy: { fecha_inicio: 'desc' }
        });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener órdenes de producción' });
    }
};

export const createOrdenProduccion = async (req: Request, res: Response) => {
    try {
        const { id_producto, cantidad_a_producir, fecha_fin_estimada, id_pastelero_asignado, lote_interno } = req.body;

        const orden = await prisma.ordenProduccion.create({
            data: {
                id_producto: Number(id_producto),
                cantidad_a_producir: Number(cantidad_a_producir),
                fecha_fin_estimada: fecha_fin_estimada ? new Date(fecha_fin_estimada) : null,
                id_pastelero_asignado: id_pastelero_asignado ? Number(id_pastelero_asignado) : null, // Opcional al crear
                lote_interno: lote_interno || `LOTE-${Date.now()}`,
                estado: 'PENDIENTE'
            }
        });
        res.status(201).json(orden);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear orden de producción' });
    }
};

export const updateEstadoOrden = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // PENDIENTE, EN_PRODUCCION, HORNEADO, DECORADO, TERMINADO

        // Validar Estado
        if (!Object.values(EstadoOrden).includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }

        const orden = await prisma.ordenProduccion.findUnique({
            where: { id_produccion: Number(id) },
            include: { producto: true }
        });

        if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

        // LOGICA DE NEGOCIO PRIMARIA:
        // Si pasa a TERMINADO y antes no lo estaba
        if (estado === 'TERMINADO' && orden.estado !== 'TERMINADO') {
            await prisma.$transaction(async (tx) => {
                // 1. Aumentar stock de producto terminado
                if (orden.id_producto) {
                    await tx.producto.update({
                        where: { id_producto: orden.id_producto },
                        data: {
                            stock_vitrina: { increment: orden.cantidad_a_producir }
                        }
                    });

                    // 2. Descontar Insumos (Backflush)
                    // Buscar receta
                    const receta = await tx.receta.findMany({
                        where: { id_producto: orden.id_producto }
                    });

                    for (const item of receta) {
                        const cantidadTotal = Number(item.cantidad_requerida) * orden.cantidad_a_producir;

                        // Descontar del inventario
                        await tx.insumo.update({
                            where: { id_insumo: item.id_insumo },
                            data: {
                                stock_actual: { decrement: cantidadTotal }
                            }
                        });

                        // Registrar movimiento (Kardex)
                        await tx.movimientoAlmacen.create({
                            data: {
                                id_insumo: item.id_insumo,
                                tipo: 'USO_PRODUCCION',
                                cantidad: -cantidadTotal, // Salida
                                observacion: `Producción ID #${orden.id_produccion}: ${orden.producto?.nombre}`,
                                id_usuario_responsable: 1 // Por defecto sistema o admin
                            }
                        });
                    }
                }

                // 3. Actualizar estado de la orden
                await tx.ordenProduccion.update({
                    where: { id_produccion: Number(id) },
                    data: { estado: estado }
                });
            });
        } else {
            // Cambio de estado normal sin efectos de stock
            await prisma.ordenProduccion.update({
                where: { id_produccion: Number(id) },
                data: { estado: estado }
            });
        }

        res.json({ message: 'Estado actualizado correctamente', nuevoEstado: estado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado de orden' });
    }
};

export const deleteOrden = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.ordenProduccion.delete({ where: { id_produccion: Number(id) } });
        res.json({ message: 'Orden eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar orden' });
    }
}
