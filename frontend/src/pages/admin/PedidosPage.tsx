
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import PedidoModal from '../../components/modals/PedidoModal';
import { API_URL } from '../../config';

interface Pedido {
    id_pedido: number;
    fecha_entrega_programada: string;
    total_pagar: number;
    estado: string;
    tipo_entrega: string;
    observaciones_generales: string;
    detalles: any[];
}

const PedidosPage = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPedidos = async () => {
        try {
            const res = await fetch(`${API_URL}/api/pedidos`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setPedidos(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPedidos(); }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDIENTE_PAGO': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMADO': return 'bg-blue-100 text-blue-800';
            case 'ENTREGADO': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ estado: newStatus })
        });
        fetchPedidos();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 font-serif">Gestión de Pedidos</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-md"
                >
                    <Plus size={20} /> Nuevo Pedido
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">Ref / Cliente</th>
                            <th className="px-6 py-3 text-left">Fecha Entrega</th>
                            <th className="px-6 py-3 text-left">Items</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-center">Tipo</th>
                            <th className="px-6 py-3 text-center">Estado</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pedidos.map(pedido => (
                            <tr key={pedido.id_pedido} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">#{pedido.id_pedido}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{pedido.observaciones_generales || 'Sin obs'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(pedido.fecha_entrega_programada).toLocaleDateString()}
                                    <span className="text-xs text-gray-500 block">{new Date(pedido.fecha_entrega_programada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {pedido.detalles.length} productos
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                    S/ {Number(pedido.total_pagar).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${pedido.tipo_entrega === 'DELIVERY' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {pedido.tipo_entrega}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(pedido.estado)}`}>
                                        {pedido.estado.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <select
                                        className="text-xs border rounded p-1"
                                        value={pedido.estado}
                                        onChange={(e) => handleStatusChange(pedido.id_pedido, e.target.value)}
                                    >
                                        <option value="PENDIENTE_PAGO">PENDIENTE</option>
                                        <option value="CONFIRMADO">CONFIRMADO</option>
                                        <option value="EN_PREPARACION">PREPARANDO</option>
                                        <option value="EN_RUTA">EN RUTA</option>
                                        <option value="ENTREGADO">ENTREGADO</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {pedidos.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No hay pedidos registrados.</div>
                )}
            </div>

            <PedidoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchPedidos} />
        </div>
    );
};

export default PedidosPage;
