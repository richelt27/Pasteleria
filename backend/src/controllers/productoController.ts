
import { Request, Response } from 'express';
import prisma from '../prisma';

// --- CATEGORÍAS ---
export const getCategorias = async (req: Request, res: Response) => {
    try {
        const categorias = await prisma.categoria.findMany({
            where: { activo: true }
        });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

export const createCategoria = async (req: Request, res: Response) => {
    try {
        const { nombre, imagen_url } = req.body;
        const categoria = await prisma.categoria.create({
            data: { nombre, imagen_url }
        });
        res.status(201).json(categoria);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

// --- PRODUCTOS ---
export const getProductos = async (req: Request, res: Response) => {
    try {
        const productos = await prisma.producto.findMany({
            where: { activo: { not: false } }, // Trae true o null
            include: { categoria: true }
        });
        res.json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

export const getProductoById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const producto = await prisma.producto.findUnique({
            where: { id_producto: Number(id) },
            include: { categoria: true, recetas: { include: { insumo: true } } }
        });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

export const createProducto = async (req: Request, res: Response) => {
    try {
        const { nombre, descripcion, precio_base, id_categoria, imagen_url, es_personalizable, stock_vitrina } = req.body;

        const producto = await prisma.producto.create({
            data: {
                nombre,
                descripcion,
                precio_base,
                id_categoria: Number(id_categoria),
                imagen_url,
                es_personalizable: es_personalizable || false,
                stock_vitrina: Number(stock_vitrina) || 0
            }
        });
        res.status(201).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

export const updateProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio_base, id_categoria, imagen_url, stock_vitrina, es_personalizable } = req.body;

        await prisma.producto.update({
            where: { id_producto: Number(id) },
            data: {
                nombre,
                descripcion,
                precio_base,
                id_categoria: Number(id_categoria),
                imagen_url,
                stock_vitrina: Number(stock_vitrina) || 0,
                es_personalizable: es_personalizable
            }
        });
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
};

export const deleteProducto = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete
        await prisma.producto.update({
            where: { id_producto: Number(id) },
            data: { activo: false }
        });
        res.json({ message: 'Producto eliminado (Soft Delete)' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
};
