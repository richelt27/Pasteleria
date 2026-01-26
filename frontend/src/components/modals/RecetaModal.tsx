
import { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

interface RecetaItem {
    id_receta: number;
    id_insumo: number;
    cantidad_requerida: number;
    unidad_uso: string;
    insumo: {
        nombre: string;
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

interface RecetaModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number | null;
    productName: string;
}

const RecetaModal = ({ isOpen, onClose, productId, productName }: RecetaModalProps) => {
    const [insumos, setInsumos] = useState<any[]>([]);
    const [recetaDetalles, setRecetaDetalles] = useState<{ id: number, id_insumo: number, cantidad_necesaria: number }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && productId) {
            fetchData();
        }
    }, [isOpen, productId]);

    const fetchData = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // 1. Cargar receta existente
            const resReceta = await fetch(`${API_URL}/api/recetas/producto/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resReceta.ok) {
                const data = await resReceta.json();
                if (data && data.detalles) {
                    setRecetaDetalles(data.detalles.map((d: any) => ({
                        id: d.id_detalle_receta,
                        id_insumo: d.id_insumo,
                        cantidad_necesaria: d.cantidad_necesaria
                    })));
                } else {
                    setRecetaDetalles([]);
                }
            }

            // 2. Cargar insumos disponibles
            const resInsumos = await fetch(`${API_URL}/api/insumos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resInsumos.ok) setInsumos(await resInsumos.json());

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!productId) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/recetas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_producto: productId,
                    detalles: recetaDetalles.map(d => ({
                        id_insumo: d.id_insumo,
                        cantidad_necesaria: d.cantidad_necesaria
                    }))
                })
            });

            if (res.ok) {
                alert('Receta guardada con éxito');
                onClose();
            } else {
                alert('Error al guardar receta');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addDetalle = () => {
        setRecetaDetalles([...recetaDetalles, { id: 0, id_insumo: 0, cantidad_necesaria: 0 }]);
    };

    const removeDetalle = async (index: number, id_detalle: number) => {
        if (id_detalle > 0) {
            // Eliminar bd si existe
            try {
                await fetch(`${API_URL}/api/recetas/${id_detalle}`, { // Este endpoint eliminaria el detalle especifico
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
            } catch (e) {
                console.error(e);
            }
        }
        setRecetaDetalles(recetaDetalles.filter((_, i) => i !== index));
    };

    const handleDetalleChange = (index: number, field: string, value: any) => {
        const newDetalles = [...recetaDetalles];
        newDetalles[index] = { ...newDetalles[index], [field]: value };
        setRecetaDetalles(newDetalles);
    };

    // Calcular costo total estimado
    const costoTotal = recetaDetalles.reduce((sum, detalle) => {
        const insumo = insumos.find(i => i.id_insumo === detalle.id_insumo);
        const costo = Number(insumo?.costo_promedio || 0);
        return sum + (costo * detalle.cantidad_necesaria);
    }, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h3 className="font-bold text-lg font-serif">Receta (Ficha Técnica)</h3>
                        <p className="text-sm opacity-90">{productName}</p>
                    </div>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {/* Formulario de agregar */}
                    <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-3 items-end border border-gray-200">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Insumo</label>
                            <select
                                className="w-full border rounded px-3 py-2 bg-white"
                                value={selectedInsumo}
                                onChange={e => setSelectedInsumo(Number(e.target.value))}
                            >
                                <option value={0}>Seleccionar insumo...</option>
                                {insumos.map(i => (
                                    <option key={i.id_insumo} value={i.id_insumo}>
                                        {i.nombre} ({i.unidad})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cantidad</label>
                            <input
                                type="number"
                                step="any"
                                className="w-full border rounded px-3 py-2"
                                placeholder="0.00"
                                value={cantidad}
                                onChange={e => setCantidad(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !selectedInsumo}
                            className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary/90 flex items-center gap-2 h-[42px]"
                        >
                            <Plus size={18} /> Agregar
                        </button>
                    </form>

                    {/* Tabla de ingredientes */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="px-4 py-3 text-left">Insumo</th>
                                    <th className="px-4 py-3 text-right">Cantidad</th>
                                    <th className="px-4 py-3 text-center">Unidad</th>
                                    <th className="px-4 py-3 text-right">Costo Est.</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                                            No hay insumos asignados a esta receta.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map(item => {
                                        const c = Number(item.insumo.costo_promedio || 0);
                                        const subtotal = c * item.cantidad_requerida;
                                        return (
                                            <tr key={item.id_receta} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{item.insumo.nombre}</td>
                                                <td className="px-4 py-3 text-right">{Number(item.cantidad_requerida).toFixed(3)}</td>
                                                <td className="px-4 py-3 text-center text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 w-fit mx-auto">{item.unidad_uso}</td>
                                                <td className="px-4 py-3 text-right text-gray-600">S/ {subtotal.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleDelete(item.id_receta)}
                                                        className="text-red-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold text-gray-700">
                                <tr>
                                    <td colSpan={3} className="px-4 py-3 text-right">Costo Total Estimado:</td>
                                    <td className="px-4 py-3 text-right text-secondary">S/ {costoTotal.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecetaModal;
