
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Package,
    ChefHat,
    Menu,
    X,
    LogOut,
    Motorbike,
    Truck
} from 'lucide-react';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener usuario del almacenamiento local
    const usuarioRaw = localStorage.getItem('usuario');
    const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;

    // Si no hay usuario, redirigir a login (protección básica)
    if (!usuario) {
        window.location.href = '/login'; // Forzar recarga o usar navigate en useEffect
        return null;
    }

    // Definir ítems de menú con roles permitidos
    const allMenuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Pastelero'] },
        { path: '/admin/usuarios', label: 'Usuarios', icon: <Users size={20} />, roles: ['Admin'] },
        { path: '/admin/productos', label: 'Productos', icon: <ShoppingBag size={20} />, roles: ['Admin'] },
        { path: '/admin/insumos', label: 'Insumos', icon: <Package size={20} />, roles: ['Admin', 'Pastelero'] },
        { path: '/admin/produccion', label: 'Producción', icon: <ChefHat size={20} />, roles: ['Admin', 'Pastelero'] },
        { path: '/admin/entregas', label: 'Despacho', icon: <Motorbike size={20} />, roles: ['Admin', 'Pastelero'] },
        { path: '/admin/pedidos', label: 'Pedidos', icon: <Truck size={20} />, roles: ['Admin', 'Pastelero'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(usuario.rol));

    const handleLogout = () => {
        if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            navigate('/login');
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          bg-primary text-cream transition-all duration-300 flex flex-col shadow-xl
        `}
            >
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    <h1 className={`font-serif font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>
                        {usuario.rol === 'Admin' ? 'Administración' : 'Producción'}
                    </h1>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path} className="mb-1">
                                <Link
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors
                    ${location.pathname === item.path ? 'bg-secondary/40 border-l-4 border-accent' : ''}
                  `}
                                >
                                    <span className="text-secondary">{item.icon}</span>
                                    <span className={`${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-danger hover:text-red-400 transition-colors w-full"
                    >
                        <LogOut size={20} />
                        <span className={`${!isSidebarOpen && 'hidden'}`}>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-primary font-serif">Panel de Administración</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-primary">{usuario.nombre}</p>
                            <p className="text-xs text-gray-500">{usuario.rol}</p>
                        </div>
                        <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-offset-2 ring-secondary/50">
                            {getInitials(usuario.nombre)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
