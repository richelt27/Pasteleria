
import { Router } from 'express';
import { getRecetaByProducto, addInsumoToReceta, removeInsumoFromReceta } from '../controllers/recetaController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

// Obtener receta de un producto
router.get('/producto/:id_producto', getRecetaByProducto);

// Agregar insumo a receta
router.post('/', authorizeRoles(['Admin', 'Pastelero']), addInsumoToReceta);

// Eliminar insumo de receta
router.delete('/:id', authorizeRoles(['Admin', 'Pastelero']), removeInsumoFromReceta);

export default router;
