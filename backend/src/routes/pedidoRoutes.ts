
import { Router } from 'express';
import { getPedidos, createPedido, updateEstadoPedido, getMisPedidos } from '../controllers/pedidoController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // Proteger todo

// Rutas Específicas primero
router.get('/mis-pedidos', getMisPedidos);

router.get('/', getPedidos);
router.post('/', createPedido);
router.put('/:id/estado', updateEstadoPedido);

export default router;
