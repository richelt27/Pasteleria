
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsuariosPage from './pages/admin/UsuariosPage';
import ProductosPage from './pages/admin/ProductosPage';
import InsumosPage from './pages/admin/InsumosPage';
import ProduccionPage from './pages/admin/ProduccionPage';
import PedidosPage from './pages/admin/PedidosPage';

// Client Imports
import ClientLayout from './layouts/ClientLayout';
import HomePage from './pages/client/HomePage';
import CatalogoPage from './pages/client/CatalogoPage';
import ClientPedidosPage from './pages/client/ClientPedidosPage';
import CheckoutPage from './pages/client/CheckoutPage';

// Driver Imports
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import EntregaPage from './pages/admin/EntregaPage';

// Context
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Cliente Público */}
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogo" element={<CatalogoPage />} />
            <Route path="nosotros" element={<div className="p-20 text-center text-primary font-bold text-3xl">Próximamente: Nuestra Historia</div>} />
            <Route path="contacto" element={<div className="p-20 text-center text-primary font-bold text-3xl">Contáctanos al +51 999 999 999</div>} />
            <Route path="mis-pedidos" element={<ClientPedidosPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>

          {/* Login Staff */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Driver */}
          <Route path="/repartidor" element={<DriverLayout />}>
            <Route index element={<DriverDashboard />} />
          </Route>

          {/* Rutas Protegidas (Admin) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="productos" element={<ProductosPage />} />
            <Route path="insumos" element={<InsumosPage />} />
            <Route path="produccion" element={<ProduccionPage />} />
            <Route path="pedidos" element={<PedidosPage />} />
            <Route path="entregas" element={<EntregaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
