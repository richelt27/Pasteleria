
import { Router } from 'express';
import { getOrdenesProduccion, createOrdenProduccion, updateEstadoOrden, deleteOrden } from '../controllers/produccionController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getOrdenesProduccion);
router.post('/', authorizeRoles(['Admin', 'Pastelero']), createOrdenProduccion);
router.put('/:id/estado', authorizeRoles(['Admin', 'Pastelero']), updateEstadoOrden);
router.delete('/:id', authorizeRoles(['Admin']), deleteOrden);

export default router;
