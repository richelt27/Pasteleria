import { Router } from 'express';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../controllers/usuarioController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación. Solo Admin puede gestionar usuarios.
router.use(authenticateToken);
router.use(authorizeRoles(['Admin']));

router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
