import { useState, useEffect } from 'react';
import { Plus as PlusIcon, Edit, Trash2, Search, Package, ScrollText } from 'lucide-react';
import ProductoModal from '../../components/modals/ProductoModal';
import RecetaModal from '../../components/modals/RecetaModal';

interface Categoria {
    id_categoria: number;
    nombre: string;
}

interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagen_url?: string;
    categoria?: Categoria;
    stock_vitrina: number;
    activo: boolean;
    es_personalizable: boolean;
    id_categoria: number; // For edit mapping
}

const ProductosPage = () => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

    // Receta Modal state
    const [isRecetaOpen, setIsRecetaOpen] = useState(false);
    const [recetaProducto, setRecetaProducto] = useState<{ id: number, nombre: string } | null>(null);


    const fetchProductos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/productos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProductos(data);
            }
        } catch (error) {
            console.error('Error al cargar productos', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchProductos();
            } else {
                alert('No se pudo eliminar el producto');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (producto: Producto) => {
        setSelectedProducto(producto);
        setIsModalOpen(true);
    };

    const handleReceta = (producto: Producto) => {
        setRecetaProducto({ id: producto.id_producto, nombre: producto.nombre });
        setIsRecetaOpen(true);
    };

    const handleNew = () => {
        setSelectedProducto(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchProductos();
    };

    const filteredProductos = productos.filter(p =>
        (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary font-serif">Catálogo de Productos</h1>
                <div className="flex gap-2">
                    <button
                        onClick={fetchProductos}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                        title="Actualizar lista"
                    >
                        <PlusIcon size={20} />
                        Actualizar
                    </button>
                    <button
                        onClick={handleNew}
                        className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <PlusIcon size={20} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center p-8 text-gray-500">Cargando catálogo...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProductos.map((prod) => (
                        <div key={prod.id_producto} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 group">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {prod.imagen_url ? (
                                    <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                                        <Package size={48} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleReceta(prod)}
                                        className="bg-white/90 p-2 rounded-full shadow hover:text-blue-600 transition-colors hover:scale-110 transform"
                                        title="Receta / Ficha Técnica"
                                    >
                                        <ScrollText size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(prod)}
                                        className="bg-white/90 p-2 rounded-full shadow hover:text-blue-600 transition-colors hover:scale-110 transform"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(prod.id_producto)}
                                        className="bg-white/90 p-2 rounded-full shadow hover:text-red-600 transition-colors hover:scale-110 transform"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {prod.stock_vitrina <= 2 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs text-center py-1">
                                        {prod.stock_vitrina === 0 ? 'AGOTADO' : 'POCAS UNIDADES'}
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{prod.nombre}</h3>
                                    <span className="bg-secondary/20 text-secondary-dark px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2">
                                        {prod.categoria?.nombre || 'General'}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                                    {prod.descripcion || 'Sin descripción'}
                                </p>
                                <div className="flex justify-between items-center border-t pt-4">
                                    <span className="text-2xl font-bold text-primary">S/ {Number(prod.precio_base).toFixed(2)}</span>
                                    <span className={`text-xs font-bold ${prod.stock_vitrina > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        Stock: {prod.stock_vitrina}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredProductos.length === 0 && !loading && (
                <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    No se encontraron productos. ¡Agrega el primero con el botón superior!
                </div>
            )}

            <ProductoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                productoToEdit={selectedProducto}
            />

            <RecetaModal
                isOpen={isRecetaOpen}
                onClose={() => setIsRecetaOpen(false)}
                productId={recetaProducto?.id || null}
                productName={recetaProducto?.nombre || ''}
            />
        </div>
    );
};

export default ProductosPage;
