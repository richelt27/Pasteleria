import express from 'express';
import cors from 'cors';

import usuarioRoutes from './routes/usuarioRoutes';
import authRoutes from './routes/authRoutes';
import productoRoutes from './routes/productoRoutes';
import insumoRoutes from './routes/insumoRoutes';
import produccionRoutes from './routes/produccionRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import recetaRoutes from './routes/recetaRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import entregaRoutes from './routes/entregaRoutes';
import reporteRoutes from './routes/reporteRoutes';

const app = express();

// Middlewares
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/produccion', produccionRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/entregas', entregaRoutes);
app.use('/api/reportes', reporteRoutes);

// Rutas básicas
app.get('/', (req, res) => {
    res.json({ message: 'API Pastelería funcionando correctamente 🍰' });
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

export default app;
