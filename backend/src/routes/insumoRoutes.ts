
import { Router } from 'express';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../controllers/insumoController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getInsumos);
router.post('/', authorizeRoles(['Admin', 'Pastelero']), createInsumo);
router.put('/:id', authorizeRoles(['Admin', 'Pastelero']), updateInsumo);
router.delete('/:id', authorizeRoles(['Admin']), deleteInsumo);

export default router;
