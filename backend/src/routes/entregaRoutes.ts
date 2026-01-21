
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getEntregasAdmin, getMisEntregas, asignarRepartidor, actualizarEstadoEntrega, getEntregasDisponibles, tomarEntrega } from '../controllers/entregaController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

// Configure Multer
import { upload } from '../config/cloudinary';

const router = Router();
router.use(authenticateToken);

// Admin Routes
router.get('/', authorizeRoles(['Admin', 'Pastelero']), getEntregasAdmin);
router.post('/asignar', authorizeRoles(['Admin']), asignarRepartidor);

// Driver Routes
router.get('/disponibles', authorizeRoles(['Delivery', 'Admin']), getEntregasDisponibles);
router.post('/tomar', authorizeRoles(['Delivery', 'Admin']), tomarEntrega);
router.get('/mis-entregas', authorizeRoles(['Delivery', 'Admin']), getMisEntregas);
router.put('/:id/estado', authorizeRoles(['Delivery', 'Admin']), upload.single('evidencia'), actualizarEstadoEntrega);

export default router;
