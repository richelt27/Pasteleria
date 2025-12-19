
import { Router } from 'express';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../controllers/proveedorController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getProveedores);
router.post('/', authorizeRoles(['Admin', 'Pastelero']), createProveedor);
router.put('/:id', authorizeRoles(['Admin', 'Pastelero']), updateProveedor);
router.delete('/:id', authorizeRoles(['Admin']), deleteProveedor);

export default router;
