
import { ArrowRight, Star, Clock, Truck, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url: string;
}

const HomePage = () => {
    const [favoritos, setFavoritos] = useState<Producto[]>([]);

    useEffect(() => {
        const fetchFavoritos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/productos`);
                if (res.ok) {
                    const data = await res.json();
                    // Tomamos los primeros 3 productos de la respuesta (o los últimos si quisiéramos novedades)
                    // Como no hay endpoint específicos de "destacados", usamos los primeros 3 como simple implementación.
                    setFavoritos(data.slice(0, 3));
                }
            } catch (err) {
                console.error("Error cargando favoritos", err);
            }
        };
        fetchFavoritos();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Cake Hero"
                        className="w-full h-full object-cover filter brightness-50"
                    />
                </div>

                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <span className="block text-secondary font-bold tracking-widest uppercase mb-4 animate-fade-in-up">Artesanal & Delicioso</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-fade-in-up delay-100">
                        El Sabor de la <br /> Felicidad Real
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        Descubre nuestra selección de tortas personalizadas y postres gourmet hechos con pasión.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                        <Link to="/catalogo" className="bg-secondary hover:bg-secondary-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                            Ver Catálogo <ArrowRight size={20} />
                        </Link>
                        <Link to="/nosotros" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                            Nuestra Historia
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="bg-white py-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream transition-colors">
                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                            <Star size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Calidad Premium</h3>
                            <p className="text-gray-500 text-sm">Ingredientes 100% naturales.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream transition-colors">
                        <div className="bg-secondary/10 p-3 rounded-full text-secondary">
                            <Truck size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Delivery Seguro</h3>
                            <p className="text-gray-500 text-sm">Llevamos tu pedido con cuidado.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-cream transition-colors">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Frescura Garantizada</h3>
                            <p className="text-gray-500 text-sm">Horneado el mismo día de entrega.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Preview (Dynamic) */}
            <section className="py-20 bg-cream/30">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-4xl font-serif font-bold text-primary mb-4">Favoritos de la Casa</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-12">
                        Estas son las creaciones que más aman nuestros clientes. Pídeles hoy y recíbelos frescos.
                    </p>

                    {favoritos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {favoritos.map((prod) => (
                                <div key={prod.id_producto} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                                    <div className="h-64 overflow-hidden relative">
                                        <img
                                            src={prod.imagen_url || 'https://via.placeholder.com/400'}
                                            alt={prod.nombre}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Sin+Imagen'; // Fallback
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                                            Destacado
                                        </div>
                                    </div>
                                    <div className="p-6 text-left">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{prod.nombre}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{prod.descripcion || 'Sin descripción'}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold text-secondary">S/ {Number(prod.precio_base).toFixed(2)}</span>
                                            <Link to="/catalogo" className="text-primary font-bold hover:underline flex items-center gap-1">
                                                Ver más <ShoppingCart size={16} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Cargando nuestras mejores delicias...</p>
                            {/* Opcional: Mostrar Skeletons aquí en lugar de 'Cargando...' */}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
