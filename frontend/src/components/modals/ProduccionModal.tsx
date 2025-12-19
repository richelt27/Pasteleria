
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface Producto {
    id_producto: number;
    nombre: string;
}

interface Usuario {
    id_usuario: number;
    nombre_completo: string;
    rol: { nombre: string }
}

interface ProduccionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const ProduccionModal = ({ isOpen, onClose, onSave }: ProduccionModalProps) => {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [pasteleros, setPasteleros] = useState<Usuario[]>([]);

    const [formData, setFormData] = useState({
        id_producto: 0,
        cantidad_a_producir: 1,
        id_pastelero_asignado: 0,
        fecha_fin_estimada: '',
        lote_interno: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Cargar productos y pasteleros
            const loadData = async () => {
                const token = localStorage.getItem('token');
                try {
                    const [resProd, resUsers] = await Promise.all([
                        fetch('http://localhost:3000/api/productos', { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch('http://localhost:3000/api/usuarios', { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);

                    if (resProd.ok) setProductos(await resProd.json());
                    if (resUsers.ok) {
                        const allUsers: Usuario[] = await resUsers.json();
                        // Filtrar usuarios que son Pastelero o Admin
                        setPasteleros(allUsers.filter(u => u.rol.nombre === 'Pastelero' || u.rol.nombre === 'Admin'));
                    }
                } catch (error) {
                    console.error("Error loading data", error);
                }
            };
            loadData();
            // Reset form
            setFormData({
                id_producto: 0,
                cantidad_a_producir: 1,
                id_pastelero_asignado: 0,
                fecha_fin_estimada: '',
                lote_interno: ''
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/produccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    id_producto: Number(formData.id_producto),
                    cantidad_a_producir: Number(formData.cantidad_a_producir),
                    id_pastelero_asignado: Number(formData.id_pastelero_asignado) || null
                })
            });

            if (response.ok) {
                onSave();
                onClose();
            } else {
                alert('Error al crear orden');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-white rounded-t-lg">
                    <h3 className="font-bold text-lg">Nueva Orden de Producción</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Producto a Producir</label>
                        <select
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={formData.id_producto}
                            onChange={e => setFormData({ ...formData, id_producto: Number(e.target.value) })}
                            required
                        >
                            <option value={0} disabled>Seleccione un producto</option>
                            {productos.map(p => (
                                <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={formData.cantidad_a_producir}
                                onChange={e => setFormData({ ...formData, cantidad_a_producir: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lote (Opcional)</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={formData.lote_interno}
                                onChange={e => setFormData({ ...formData, lote_interno: e.target.value })}
                                placeholder="Ej: L-2023-001"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pastelero Asignado</label>
                        <select
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={formData.id_pastelero_asignado}
                            onChange={e => setFormData({ ...formData, id_pastelero_asignado: Number(e.target.value) })}
                        >
                            <option value={0}>Sin asignar (Pendiente)</option>
                            {pasteleros.map(u => (
                                <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2">
                            <Save size={18} /> Crear Orden
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProduccionModal;
