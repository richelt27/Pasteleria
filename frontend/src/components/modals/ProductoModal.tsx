
import { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Plus } from 'lucide-react';
import CategoriaModal from './CategoriaModal';

interface Categoria {
    id_categoria: number;
    nombre: string;
}

interface Producto {
    id_producto?: number;
    nombre: string;
    descripcion: string;
    precio_base: number | string;
    id_categoria: number;
    imagen_url?: string;
    es_personalizable: boolean;
    stock_vitrina: number | string;
}

interface ProductoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    productoToEdit?: Producto | null;
}

const ProductoModal = ({ isOpen, onClose, onSave, productoToEdit }: ProductoModalProps) => {
    const [formData, setFormData] = useState<Producto>({
        nombre: '',
        descripcion: '',
        precio_base: '',
        id_categoria: 0,
        imagen_url: '',
        es_personalizable: false,
        stock_vitrina: 0
    });
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/productos/categorias', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCategorias(data);
                return data;
            }
        } catch (err) {
            console.error("Error cargando categorías", err);
        }
        return [];
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategorias().then(data => {
                // Si es nuevo y hay categorías, seleccionar la primera por defecto solo si no se ha seleccionado nada aún
                if (!productoToEdit && data.length > 0 && formData.id_categoria === 0) {
                    setFormData(prev => ({ ...prev, id_categoria: data[0].id_categoria }));
                }
            });
        }
    }, [isOpen, productoToEdit]);

    useEffect(() => {
        if (productoToEdit) {
            setFormData({
                ...productoToEdit,
                id_categoria: (productoToEdit as any).categoria?.id_categoria || productoToEdit.id_categoria
            });
        } else {
            // Reset form
            setFormData({
                nombre: '',
                descripcion: '',
                precio_base: '',
                id_categoria: 0,
                imagen_url: '',
                es_personalizable: false,
                stock_vitrina: 0
            });
        }
        setError('');
    }, [productoToEdit, isOpen]);

    const handleCategoriaCreated = (newId?: number) => {
        fetchCategorias();
        if (newId) {
            setFormData(prev => ({ ...prev, id_categoria: newId }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = productoToEdit
                ? `http://localhost:3000/api/productos/${productoToEdit.id_producto}`
                : 'http://localhost:3000/api/productos';

            const method = productoToEdit ? 'PUT' : 'POST';

            // Convertir números
            const payload = {
                ...formData,
                precio_base: Number(formData.precio_base),
                id_categoria: Number(formData.id_categoria),
                stock_vitrina: Number(formData.stock_vitrina)
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar producto');
            }

            onSave();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="bg-primary px-6 py-4 flex justify-between items-center text-white sticky top-0 z-10">
                        <h3 className="font-bold text-lg font-serif">
                            {productoToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                        </h3>
                        <button onClick={onClose} className="hover:text-secondary transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna Izquierda: Datos Básicos */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej. Torta de Chocolate"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary bg-white"
                                            value={formData.id_categoria}
                                            onChange={e => setFormData({ ...formData, id_categoria: Number(e.target.value) })}
                                        >
                                            <option value={0} disabled>Seleccione una categoría</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoriaModal(true)}
                                            className="bg-secondary text-white p-2 rounded hover:bg-secondary/90"
                                            title="Crear Categoría"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base (S/)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                            value={formData.precio_base}
                                            onChange={e => setFormData({ ...formData, precio_base: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Vitrina</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                            value={formData.stock_vitrina}
                                            onChange={e => setFormData({ ...formData, stock_vitrina: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="personalizable"
                                        className="w-4 h-4 text-secondary rounded focus:ring-secondary"
                                        checked={formData.es_personalizable}
                                        onChange={e => setFormData({ ...formData, es_personalizable: e.target.checked })}
                                    />
                                    <label htmlFor="personalizable" className="text-sm text-gray-700">¿Es un producto personalizable?</label>
                                </div>
                            </div>

                            {/* Columna Derecha: Multimedia y Descripción */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                            value={formData.imagen_url || ''}
                                            onChange={e => setFormData({ ...formData, imagen_url: e.target.value })}
                                            placeholder="https://ejemplo.com/foto.jpg"
                                        />
                                    </div>
                                    <div className="mt-2 h-40 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                        {formData.imagen_url ? (
                                            <img src={formData.imagen_url} alt="Vista previa" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = '')} />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center">
                                                <ImageIcon size={32} />
                                                <span className="text-xs mt-1">Vista previa</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary h-24 resize-none"
                                        value={formData.descripcion || ''}
                                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                        placeholder="Detalles sobre el producto..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 flex items-center gap-2"
                            >
                                {loading ? 'Guardando...' : <><Save size={18} /> Guardar Producto</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <CategoriaModal
                isOpen={showCategoriaModal}
                onClose={() => setShowCategoriaModal(false)}
                onSave={handleCategoriaCreated}
            />
        </>
    );
};

export default ProductoModal;
