
import { Request, Response } from 'express';
import prisma from '../prisma';

// Listar TODOS los pedidos (Admin)
export const getPedidos = async (req: Request, res: Response) => {
    try {
        const pedidos = await prisma.pedido.findMany({
            include: {
                usuario: { select: { nombre_completo: true, email: true } },
                detalles: { include: { producto: true } },
                pagos: true,
                entrega_datos: true
            },
            orderBy: { fecha_pedido: 'desc' }
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

// Listar MIS pedidos (Cliente)
export const getMisPedidos = async (req: Request, res: Response) => {
    try {
        // req.user viene del middleware authenticateToken (types/express.d.ts o similar necesario si TS estricto, o usar any)
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuario no identificado' });
        }

        const pedidos = await prisma.pedido.findMany({
            where: { id_usuario: Number(userId) },
            include: {
                detalles: { include: { producto: true } },
                entrega_datos: true
            },
            orderBy: { fecha_pedido: 'desc' }
        });
        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener tus pedidos' });
    }
};

// Crear nuevo pedido (Checkout)
export const createPedido = async (req: Request, res: Response) => {
    try {
        const {
            id_usuario, // Puede venir del body (admin creando) o ser null
            tipo_entrega,
            fecha_entrega_programada,
            direccion_entrega,
            referencia_direccion,
            detalles, // Array de { id_producto, cantidad, precio_unitario, personalizacion }
            observaciones_generales,
            costo_envio, // Recibimos el costo de envio personalizado
            id_repartidor_asignado // [NEW] Optional: Assign driver immediately
        } = req.body;

        // Si el usuario está autenticado y no manda id_usuario explícito (cliente comprando), usar su ID token
        const authUserId = (req as any).user?.id;
        const finalUserId = id_usuario ? Number(id_usuario) : (authUserId ? Number(authUserId) : null);

        const total_productos = detalles.reduce((sum: number, item: any) => sum + (item.cantidad * item.precio_unitario), 0);

        // Usar costo_envio si viene, si no default 0. Si no es DELIVERY, forzar 0.
        const envioFinal = tipo_entrega === 'DELIVERY' ? Number(costo_envio || 0) : 0;
        const total_pagar = total_productos + envioFinal;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Crear Pedido Header
            const pedido = await tx.pedido.create({
                data: {
                    id_usuario: finalUserId,
                    tipo_entrega,
                    fecha_entrega_programada: new Date(fecha_entrega_programada),
                    direccion_entrega,
                    referencia_direccion,
                    total_productos,
                    costo_envio: envioFinal,
                    total_pagar,
                    estado: 'PENDIENTE_PAGO',
                    observaciones_generales
                }
            });

            // 1.5 Crear registro de Entrega si es Delivery
            if (tipo_entrega === 'DELIVERY') {
                const deliveryData: any = {
                    id_pedido: pedido.id_pedido,
                    estado_delivery: 'EN_PREPARACION',
                    fecha_salida: null,
                    fecha_entrega_real: null
                };

                // Si se asignó un repartidor desde el inicio
                if (id_repartidor_asignado) {
                    deliveryData.id_repartidor = Number(id_repartidor_asignado);
                    deliveryData.estado_delivery = 'ASIGNADO';
                }

                await tx.entrega.create({ data: deliveryData });
            }

            // 2. Crear Detalles y Actualizar Stock
            for (const det of detalles) {
                // Verificar stock antes de descontar (opcional pero recomendado)
                const producto = await tx.producto.findUnique({ where: { id_producto: det.id_producto } });
                if (!producto || (producto.stock_vitrina || 0) < det.cantidad) {
                    throw new Error(`Stock insuficiente para el producto ID ${det.id_producto}`);
                }

                // Crear detalle
                await tx.detallePedido.create({
                    data: {
                        id_pedido: pedido.id_pedido,
                        id_producto: det.id_producto,
                        cantidad: det.cantidad,
                        precio_unitario: det.precio_unitario,
                        subtotal: det.cantidad * det.precio_unitario,
                        personalizacion: det.personalizacion || null
                    }
                });

                // Descontar stock vitrina
                console.log(`[DEBUG] Descontando stock para producto ${det.id_producto}. Stock actual: ${producto.stock_vitrina}, Cantidad venta: ${det.cantidad}`);

                const updatedProd = await tx.producto.update({
                    where: { id_producto: det.id_producto },
                    data: { stock_vitrina: { decrement: Number(det.cantidad) } }
                });

                console.log(`[DEBUG] Nuevo stock para producto ${det.id_producto}: ${updatedProd.stock_vitrina}`);
            }

            // 3. Registrar Pago Inicial (Asumimos método por defecto o lo recibimos del body)
            // Para este MVP, si no se envía info de pago, asumimos EFECTIVO y estado PENDIENTE si no es una pasarela real.
            // O si el usuario seleccionó método en Checkout (se debe agregar al body).
            const metodoPago = req.body.metodo_pago || 'EFECTIVO'; // Default

            await tx.pago.create({
                data: {
                    id_pedido: pedido.id_pedido,
                    metodo: metodoPago,
                    monto: total_pagar,
                    fecha_pago: new Date(),
                    estado: 'PENDIENTE', // Confirmación manual o webhook
                    comprobante_url: null
                }
            });

            return pedido;
        });

        res.status(201).json(result);

    } catch (error: any) {
        console.error(error);
        if (error.message.includes('Stock insuficiente')) {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al crear pedido. Verifique los datos o la conexión.' });
    }
};

// Actualizar estado del pedido
export const updateEstadoPedido = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        await prisma.pedido.update({
            where: { id_pedido: Number(id) },
            data: { estado }
        });

        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
};
