
import { Router } from 'express';
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    getCategorias,
    createCategoria
} from '../controllers/productoController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// --- Rutas Públicas (Catálogo Cliente) ---
router.get('/categorias', getCategorias);
router.get('/', getProductos);
router.get('/:id', getProductoById);

// --- Rutas Protegidas (Admin / Pastelero) ---
router.post('/categorias', authenticateToken, authorizeRoles(['Admin', 'Pastelero']), createCategoria);

router.post('/', authenticateToken, authorizeRoles(['Admin']), createProducto);
router.put('/:id', authenticateToken, authorizeRoles(['Admin']), updateProducto);
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), deleteProducto);

export default router;
