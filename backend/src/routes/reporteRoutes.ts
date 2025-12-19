
import { Router } from 'express';
import { getDashboardStats, getVentasReport, getTopProductos } from '../controllers/reporteController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles(['Admin', 'Pastelero']));

router.get('/stats', getDashboardStats);
router.get('/ventas', getVentasReport);
router.get('/top-productos', getTopProductos);

export default router;
