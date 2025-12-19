
import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Ventas de Hoy
        const ventasHoy = await prisma.pedido.aggregate({
            where: {
                fecha_pedido: { gte: today },
                estado: { not: 'CANCELADO' }
            },
            _sum: { total_pagar: true }
        });

        // 2. Pedidos Totales (Activos)
        const pedidosActivos = await prisma.pedido.count({
            where: { estado: { notIn: ['ENTREGADO', 'CANCELADO'] } }
        });

        // 3. Productos Activos
        // El modelo Producto no tiene campo 'estado', contamos todos.
        const productosActivos = await prisma.producto.count();

        // 4. Alerta Insumos (Bajo Stock)
        const insumos = await prisma.insumo.findMany();
        const insumosAlerta = insumos.filter(i => {
            const actual = i.stock_actual ?? 0;
            const minimo = i.stock_minimo ?? 0;
            return actual <= minimo;
        }).length;

        res.json({
            ventasHoy: ventasHoy._sum.total_pagar || 0,
            pedidosActivos,
            productosActivos,
            insumosAlerta
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

export const getVentasReport = async (req: Request, res: Response) => {
    try {
        // Últimos 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const ventas = await prisma.pedido.groupBy({
            by: ['fecha_pedido'],
            where: {
                fecha_pedido: { gte: sevenDaysAgo },
                estado: { not: 'CANCELADO' }
            },
            _sum: { total_pagar: true },
            orderBy: { fecha_pedido: 'asc' }
        });

        // Formatear para frontend
        const ventasFormatted = ventas.map((v: any) => ({
            fecha: new Date(v.fecha_pedido).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
            total: v._sum.total_pagar || 0
        }));

        res.json(ventasFormatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reporte ventas' });
    }
};

export const getTopProductos = async (req: Request, res: Response) => {
    try {
        // Top 5 productos más vendidos historicamente
        const top = await prisma.detallePedido.groupBy({
            by: ['id_producto'],
            _sum: { cantidad: true },
            orderBy: { _sum: { cantidad: 'desc' } },
            take: 5
        });

        // Obtener nombres
        const productos = await Promise.all(top.map(async (item: any) => {
            const prod = await prisma.producto.findUnique({
                where: { id_producto: item.id_producto },
                select: { nombre: true }
            });
            return {
                nombre: prod?.nombre || 'Desconocido',
                cantidad: item._sum.cantidad || 0
            };
        }));

        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener top productos' });
    }
};
