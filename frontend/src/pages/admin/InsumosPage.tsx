
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import InsumoModal from '../../components/modals/InsumoModal';
import { API_URL } from '../../config';

interface Insumo {
    id_insumo: number;
    nombre: string;
    descripcion: string;
    unidad: string;
    stock_actual: number;
    stock_minimo: number;
    costo_promedio: number;
}

const InsumosPage = () => {
    const [insumos, setInsumos] = useState<Insumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);

    const fetchInsumos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/insumos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setInsumos(data);
            }
        } catch (error) {
            console.error('Error al cargar insumos', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsumos();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar este insumo?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/insumos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchInsumos();
            } else {
                const err = await response.json();
                alert(err.error || 'No se pudo eliminar el insumo');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (insumo: Insumo) => {
        setSelectedInsumo(insumo);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedInsumo(null);
        setIsModalOpen(true);
    };

    const filteredInsumos = insumos.filter(i =>
        (i.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary font-serif">Almacén de Insumos</h1>
                <button
                    onClick={handleNew}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Insumo
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar insumo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Nombre</th>
                            <th className="p-4 font-semibold text-gray-600">Stock Actual</th>
                            <th className="p-4 font-semibold text-gray-600">Unidad</th>
                            <th className="p-4 font-semibold text-gray-600">Estado Stock</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando inventario...</td></tr>
                        ) : filteredInsumos.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron insumos.</td></tr>
                        ) : (
                            filteredInsumos.map((insumo) => (
                                <tr key={insumo.id_insumo} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{insumo.id_insumo}</td>
                                    <td className="p-4 font-medium text-gray-800">
                                        {insumo.nombre}
                                        <div className="text-xs text-gray-400 font-normal">{insumo.descripcion}</div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-700">{Number(insumo.stock_actual).toFixed(2)}</td>
                                    <td className="p-4 text-gray-600 text-sm">{insumo.unidad}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(insumo.stock_actual) <= Number(insumo.stock_minimo)
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {Number(insumo.stock_actual) <= Number(insumo.stock_minimo) ? 'BAJO STOCK' : 'OK'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(insumo)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(insumo.id_insumo)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <InsumoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={() => fetchInsumos()}
                insumoToEdit={selectedInsumo}
            />
        </div>
    );
};

export default InsumosPage;
