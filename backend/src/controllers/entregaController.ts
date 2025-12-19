
import { Request, Response } from 'express';
import prisma from '../prisma';

// Admin: Obtener todas las entregas (reportes y despacho)
export const getEntregasAdmin = async (req: Request, res: Response) => {
    try {
        const { inicio, fin } = req.query;

        // Filtro base: siempre DELIVERY
        const whereClause: any = { tipo_entrega: 'DELIVERY' };

        // Filtros de fecha si existen (Reportes)
        if (inicio && fin) {
            whereClause.fecha_entrega_programada = {
                gte: new Date(inicio as string),
                lte: new Date(fin as string)
            };
        } else {
            // Si no hay filtro, por defecto mostrar todo o quizás solo pendientes?
            // Por consistencia con la vista de "Despacho" original, mostramos TODO si no se filtra, 
            // o quizás limitar a últimos 30 días para optimizar. Dejémoslo en todo por ahora.
        }

        const pedidos = await prisma.pedido.findMany({
            where: whereClause,
            include: {
                usuario: { select: { nombre_completo: true, email: true, telefono: true } },
                detalles: { include: { producto: true } },
                entrega_datos: {
                    include: {
                        repartidor: { select: { nombre_completo: true, id_usuario: true } }
                    }
                }
            },
            orderBy: { fecha_entrega_programada: 'desc' } // Más recientes primero para reportes
        });

        const entregasMapped = pedidos.map(p => {
            if (p.entrega_datos) {
                return { ...p.entrega_datos, pedido: p };
            } else {
                return {
                    id_entrega: 0,
                    estado_delivery: 'PENDIENTE',
                    repartidor: null,
                    fecha_salida: null,
                    fecha_entrega_real: null,
                    evidencia_foto_url: null,
                    pedido: p
                };
            }
        });

        res.json(entregasMapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener entregas' });
    }
};

// Driver: Obtener mis entregas asignadas
export const getMisEntregas = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const entregas = await prisma.entrega.findMany({
            where: { id_repartidor: Number(userId) },
            include: {
                pedido: {
                    include: {
                        usuario: { select: { nombre_completo: true, telefono: true } },
                        detalles: { include: { producto: true } }
                    }
                }
            },
            orderBy: { pedido: { fecha_entrega_programada: 'asc' } }
        });
        res.json(entregas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus entregas' });
    }
};

// Admin: Asignar repartidor (Crea el registro Entrega si no existe)
export const asignarRepartidor = async (req: Request, res: Response) => {
    try {
        const { id_pedido, id_repartidor } = req.body;

        // Usamos upsert para crear si no existe, o actualizar si existe
        const entrega = await prisma.entrega.upsert({
            where: { id_pedido: Number(id_pedido) },
            update: {
                id_repartidor: Number(id_repartidor),
                estado_delivery: 'ASIGNADO'
            },
            create: {
                id_pedido: Number(id_pedido),
                id_repartidor: Number(id_repartidor),
                estado_delivery: 'ASIGNADO'
            }
        });

        res.json(entrega);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar repartidor' });
    }
};

// Driver: Actualizar estado (En Ruta, Entregado)
export const actualizarEstadoEntrega = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // id de la entrega
        const { estado } = req.body; // EN_RUTA, ENTREGADO

        const data: any = { estado_delivery: estado };
        if (estado === 'EN_RUTA') data.fecha_salida = new Date();
        if (estado === 'ENTREGADO') {
            data.fecha_entrega_real = new Date();
            if (req.file) {
                // Save relative path or full URL. Usually relative + client prepends base URL.
                data.evidencia_foto_url = `uploads/${req.file.filename}`;
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const ent = await tx.entrega.update({
                where: { id_entrega: Number(id) },
                data
            });

            // Sincronizar con el estado del pedido principal
            if (estado === 'EN_RUTA') {
                await tx.pedido.update({
                    where: { id_pedido: ent.id_pedido },
                    data: { estado: 'EN_RUTA' }
                });
            } else if (estado === 'ENTREGADO') {
                await tx.pedido.update({
                    where: { id_pedido: ent.id_pedido },
                    data: { estado: 'ENTREGADO' }
                });
            }
            return ent;
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado de entrega' });
    }
};
// Driver: Obtener pedidos disponibles (sin repartidor)
export const getEntregasDisponibles = async (req: Request, res: Response) => {
    try {
        const entregas = await prisma.entrega.findMany({
            where: {
                id_repartidor: null,
                estado_delivery: { not: 'CANCELADO' }
            },
            include: {
                pedido: {
                    include: {
                        usuario: { select: { nombre_completo: true, telefono: true } },
                        detalles: { include: { producto: true } }
                    }
                }
            },
            orderBy: { pedido: { fecha_entrega_programada: 'asc' } }
        });
        res.json(entregas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener entregas disponibles' });
    }
};

// Driver: Auto-asignarse un pedido (Tomar pedido)
export const tomarEntrega = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { id_entrega } = req.body;

        // Validar que no haya sido tomado ya por otro (Atomic check)
        const result = await prisma.entrega.updateMany({
            where: {
                id_entrega: Number(id_entrega),
                id_repartidor: null // IMPORTANTE: Solo si no tiene dueño
            },
            data: {
                id_repartidor: Number(userId),
                estado_delivery: 'ASIGNADO'
            }
        });

        if (result.count === 0) {
            return res.status(409).json({ error: 'Este pedido ya fue tomado por otro repartidor.' });
        }

        res.json({ message: 'Pedido asignado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al tomar el pedido' });
    }
};
