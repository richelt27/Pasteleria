
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { Search, Filter, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url: string;
    categoria?: { id_categoria: number; nombre: string };
}

const CatalogoPage = () => {
    const { addToCart } = useCart();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState<{ id_categoria: number, nombre: string }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [resProd, resCat] = await Promise.all([
                    fetch(`${API_URL}/api/productos`),
                    fetch(`${API_URL}/api/productos/categorias`)
                ]);

                if (resProd.ok) setProductos(await resProd.json());
                if (resCat.ok) setCategorias(await resCat.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const filteredProducts = selectedCategory
        ? productos.filter(p => p.categoria?.nombre === categorias.find(c => c.id_categoria === selectedCategory)?.nombre)
        : productos;

    const productsToDisplay = selectedCategory
        ? productos.filter(p => p.categoria && p.categoria.id_categoria === selectedCategory)
        : productos;

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-primary mb-4">Nuestro Catálogo</h1>
                    <p className="text-gray-500">Explora todas nuestras delicias disponibles para ti.</p>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Buscar torta, postre..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50" />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-sm font-bold shadow-md whitespace-nowrap transition-colors ${selectedCategory === null ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            Todos
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id_categoria}
                                onClick={() => setSelectedCategory(cat.id_categoria)}
                                className={`px-4 py-2 rounded-full text-sm font-bold shadow-md whitespace-nowrap transition-colors ${selectedCategory === cat.id_categoria ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Render Productos Real or Mock */}
                    {productsToDisplay.length > 0 ? productsToDisplay.map(prod => (
                        <div key={prod.id_producto} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group">
                            <div className="h-64 bg-gray-200 relative overflow-hidden">
                                <img
                                    src={prod.imagen_url || 'https://via.placeholder.com/400'}
                                    alt={prod.nombre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Sin+Imagen';
                                    }}
                                />
                                <button
                                    onClick={() => addToCart(prod)}
                                    className="absolute bottom-4 right-4 bg-white text-secondary p-3 rounded-full shadow-lg hover:bg-secondary hover:text-white transition-colors transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300 z-10 cursor-pointer"
                                >
                                    <ShoppingCart size={20} />
                                </button>
                            </div>
                            <div className="p-5">
                                <div className="text-xs font-bold text-secondary uppercase mb-1">{prod.categoria?.nombre || 'Pastelería'}</div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{prod.nombre}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{prod.descripcion}</p>
                                <div className="flex justify-between items-center border-t pt-3">
                                    <span className="text-xl font-bold text-primary">S/ {Number(prod.precio_base).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        // MOCK FALLBACK for demo purpose if backend is protected
                        [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group animate-pulse">
                                <div className="h-64 bg-gray-200"></div>
                                <div className="p-5">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {productos.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No se pudieron cargar los productos (Backend Protegido o Vacío). <br /> Necesitamos asegurarnos que el backend está corriendo y las rutas públicas funcionan.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CatalogoPage;
