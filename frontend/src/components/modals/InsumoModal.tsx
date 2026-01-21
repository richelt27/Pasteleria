import { useState, useEffect } from 'react';
import { X, Save, Plus, Search } from 'lucide-react';
import ProveedorModal from './ProveedorModal';

interface Insumo {
    id_insumo?: number;
    nombre: string;
    descripcion: string;
    unidad: string;
    stock_minimo: number;
    stock_actual: number;
    costo_promedio: number;
    id_proveedor_preferido?: number | null;
}

interface Proveedor {
    id_proveedor: number;
    razon_social: string;
}

interface InsumoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    insumoToEdit?: Insumo | null;
}

const UNIDADES = ['KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO'];

const InsumoModal = ({ isOpen, onClose, onSave, insumoToEdit }: InsumoModalProps) => {
    const [formData, setFormData] = useState<Insumo>({
        nombre: '',
        descripcion: '',
        unidad: 'KG',
        stock_minimo: 5,
        stock_actual: 0,
        costo_promedio: 0,
        id_proveedor_preferido: null
    });

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [showProveedorModal, setShowProveedorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProveedores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/proveedores', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setProveedores(await response.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProveedores();
            if (insumoToEdit) {
                setFormData({
                    ...insumoToEdit,
                    stock_actual: insumoToEdit.stock_actual ?? 0,
                    costo_promedio: insumoToEdit.costo_promedio ?? 0
                });
            } else {
                setFormData({
                    nombre: '',
                    descripcion: '',
                    unidad: 'KG',
                    stock_minimo: 5,
                    stock_actual: 0,
                    costo_promedio: 0,
                    id_proveedor_preferido: null
                });
            }
            setError('');
        }
    }, [insumoToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = insumoToEdit
                ? `http://localhost:3000/api/insumos/${insumoToEdit.id_insumo}`
                : 'http://localhost:3000/api/insumos';

            const method = insumoToEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar insumo');
            }

            onSave();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProveedorCreated = (newId?: number) => {
        fetchProveedores();
        if (newId) {
            setFormData(prev => ({ ...prev, id_proveedor_preferido: newId }));
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                        <h3 className="font-bold text-lg font-serif">
                            {insumoToEdit ? 'Editar Insumo' : 'Nuevo Insumo'}
                        </h3>
                        <button onClick={onClose} className="hover:text-secondary transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej. Harina Pastelera"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                            <select
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary bg-white"
                                value={formData.unidad}
                                onChange={e => setFormData({ ...formData, unidad: e.target.value })}
                            >
                                {UNIDADES.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual (Inicial)</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                    value={formData.stock_actual}
                                    onChange={e => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                    value={formData.stock_minimo}
                                    onChange={e => setFormData({ ...formData, stock_minimo: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Costo Promedio (S/)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                    value={formData.costo_promedio}
                                    onChange={e => setFormData({ ...formData, costo_promedio: Number(e.target.value) })}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor Principal</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary bg-white text-sm"
                                        value={formData.id_proveedor_preferido || "0"}
                                        onChange={e => setFormData({ ...formData, id_proveedor_preferido: Number(e.target.value) || null })}
                                    >
                                        <option value="0">Seleccionar...</option>
                                        {proveedores.map(p => (
                                            <option key={p.id_proveedor} value={p.id_proveedor}>{p.razon_social}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowProveedorModal(true)}
                                        className="bg-secondary text-white p-2 rounded hover:bg-secondary/90"
                                        title="Crear Proveedor"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary h-20 resize-none"
                                value={formData.descripcion || ''}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
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
                                {loading ? 'Guardando...' : <><Save size={18} /> Guardar Insumo</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ProveedorModal
                isOpen={showProveedorModal}
                onClose={() => setShowProveedorModal(false)}
                onSave={handleProveedorCreated}
            />
        </>
    );
};

export default InsumoModal;
