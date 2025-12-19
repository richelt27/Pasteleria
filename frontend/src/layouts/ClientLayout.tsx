
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Instagram, Facebook, MapPin, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ClientLayout = () => {
    const { itemCount } = useCart();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-cream">
            {/* Navbar Premium */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-secondary/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                                P
                            </div>
                            <span className="text-2xl font-serif font-bold text-primary tracking-tight">
                                Gelatinas <span className="text-secondary">Mary</span>
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8 font-medium">
                            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Inicio</Link>
                            <Link to="/catalogo" className="text-gray-600 hover:text-primary transition-colors">Catálogo</Link>
                            <Link to="/nosotros" className="text-gray-600 hover:text-primary transition-colors">Nosotros</Link>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-primary hover:text-primary-dark opacity-70 hover:opacity-100 transition-opacity">
                                Acceso Staff
                            </Link>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="relative p-2 bg-secondary/10 rounded-full text-secondary hover:bg-secondary hover:text-white transition-all"
                            >
                                <ShoppingBag size={24} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-primary text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <h3 className="text-2xl font-serif font-bold mb-4">Gelatinas Mary</h3>
                        <p className="text-white/80 leading-relaxed">
                            Creando momentos dulces y memorables desde 2024.
                            Utilizamos solo ingredientes seleccionados para garantizar el mejor sabor.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-secondary">Enlaces Rápidos</h4>
                        <ul className="space-y-2 text-white/80">
                            <li><Link to="/catalogo" className="hover:text-secondary transition-colors">Ver Catálogo</Link></li>
                            <li><Link to="/mis-pedidos" className="hover:text-secondary transition-colors">Mis Pedidos</Link></li>
                            <li><Link to="/contacto" className="hover:text-secondary transition-colors">Contacto</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4 text-secondary">Contáctanos</h4>
                        <ul className="space-y-3 text-white/80">
                            <li className="flex items-center gap-2"><MapPin size={18} className="text-secondary" /> Mollepata Cedepa Mz.A Lt.14 Ayacucho</li>
                            <li className="flex items-center gap-2"><Phone size={18} className="text-secondary" /> +51 988 368 886</li>
                            <li className="flex gap-4 mt-4">
                                <a href="#" className="hover:text-secondary hover:scale-110 transition-all"><Instagram size={24} /></a>
                                <a href="#" className="hover:text-secondary hover:scale-110 transition-all"><Facebook size={24} /></a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="text-center border-t border-white/10 pt-8 text-white/40 text-sm">
                    © 2024 Gelatinas Mary. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
