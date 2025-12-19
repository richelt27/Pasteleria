
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Truck } from 'lucide-react';

const DriverLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 leading-tight">Pastelería App</h1>
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">Modo Repartidor</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4 safe-area-bottom">
                <Outlet />
            </main>
        </div>
    );
};

export default DriverLayout;
