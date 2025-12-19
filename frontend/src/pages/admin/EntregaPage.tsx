
import { useState, useEffect } from 'react';
import { Search, MapPin, Truck, Calendar, User, CheckCircle, Camera, Eye, Filter } from 'lucide-react';

interface Repartidor {
    id_usuario: number;
    nombre_completo: string;
}

interface Entrega {
    id_entrega: number;
    estado_delivery: string;
    evidencia_foto_url: string | null;
    repartidor: { nombre_completo: string } | null;
    pedido: {
        id_pedido: number;
        fecha_entrega_programada: string;
        direccion_entrega: string;
        tipo_entrega: string;
        usuario: { nombre_completo: string; email: string; telefono: string };
    };
}

const EntregaPage = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, COMPLETED
    const [dateRange, setDateRange] = useState('HOY'); // HOY, SEMANA, MES, TODOS

    // Modal Asignar
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedEntregaId, setSelectedEntregaId] = useState<number | null>(null);

    // Modal Evidencia
    const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

    const fetchEntregas = async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let query = '';

            // Usar objetos Date independientes para evitar mutaciones erróneas
            const now = new Date();
            const inicio = new Date(now);
            const fin = new Date(now);

            if (dateRange === 'HOY') {
                inicio.setHours(0, 0, 0, 0);
                fin.setHours(23, 59, 59, 999);
            } else if (dateRange === 'SEMANA') {
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Lunes
                inicio.setDate(diff);
                inicio.setHours(0, 0, 0, 0);

                // Calcular fin basado en el inicio calculado
                fin.setTime(inicio.getTime());
                fin.setDate(inicio.getDate() + 6); // Domingo
                fin.setHours(23, 59, 59, 999);
            } else if (dateRange === 'MES') {
                inicio.setDate(1);
                inicio.setHours(0, 0, 0, 0);

                fin.setMonth(inicio.getMonth() + 1);
                fin.setDate(0); // Último día del mes actual
                fin.setHours(23, 59, 59, 999);
            }

            if (dateRange !== 'TODOS') {
                query = `?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`;
            }

            console.log(`Fetching: ${dateRange}`, query); // Debug

            const res = await fetch(`http://localhost:3000/api/entregas${query}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal // Abort signal
            });

            if (res.ok) {
                const data = await res.json();
                setEntregas(data);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching entregas:', error);
            }
        } finally {
            if (!signal || !signal.aborted) setLoading(false);
        }
    };

    const fetchRepartidores = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const users: any[] = await res.json();
                const drivers = users.filter(u => u.rol?.nombre === 'Delivery' && u.estado === 'ACTIVO');
                setRepartidores(drivers);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchEntregas(controller.signal);
        fetchRepartidores();
        return () => controller.abort();
    }, [dateRange]);

    const handleAssign = async (id_repartidor: number) => {
        if (!selectedEntregaId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/entregas/asignar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_pedido: selectedEntregaId, id_repartidor })
            });

            if (res.ok) {
                setIsAssignModalOpen(false);
                fetchEntregas();
            } else {
                alert('Error al asignar');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openAssignModal = (id_pedido: number) => {
        setSelectedEntregaId(id_pedido);
        setIsAssignModalOpen(true);
    };

    // Client-side status filter
    const filteredEntregas = entregas.filter(e => {
        if (statusFilter === 'PENDING') return e.estado_delivery !== 'ENTREGADO';
        if (statusFilter === 'COMPLETED') return e.estado_delivery === 'ENTREGADO';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 font-serif">Reporte de Despachos</h2>

                <div className="flex gap-4 items-center flex-wrap">
                    {/* Date Filters */}
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        {['HOY', 'SEMANA', 'MES', 'TODOS'].map(r => (
                            <button
                                key={r}
                                onClick={() => setDateRange(r)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${dateRange === r ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Status Filters */}
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        <button onClick={() => setStatusFilter('ALL')} className={`px-3 py-1 rounded-md text-xs font-bold ${statusFilter === 'ALL' ? 'bg-gray-100 text-gray-800' : 'text-gray-500'}`}>Todos</button>
                        <button onClick={() => setStatusFilter('PENDING')} className={`px-3 py-1 rounded-md text-xs font-bold ${statusFilter === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}`}>Pendientes</button>
                        <button onClick={() => setStatusFilter('COMPLETED')} className={`px-3 py-1 rounded-md text-xs font-bold ${statusFilter === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'text-gray-500'}`}>Completados</button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-left">Pedido</th>
                            <th className="px-6 py-3 text-left">Fecha Prog.</th>
                            <th className="px-6 py-3 text-left">Repartidor</th>
                            <th className="px-6 py-3 text-center">Estado</th>
                            <th className="px-6 py-3 text-center">Evidencia</th>
                            <th className="px-6 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredEntregas.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay entregas con estos filtros.</td></tr>
                        ) : (
                            filteredEntregas.map(entrega => (
                                <tr key={entrega.id_entrega} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">#{entrega.pedido.id_pedido}</div>
                                        <div className="text-sm text-gray-600">{entrega.pedido.usuario?.nombre_completo || 'Cliente General'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Calendar size={16} className="text-gray-400" />
                                            {new Date(entrega.pedido.fecha_entrega_programada).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {entrega.repartidor ? (
                                            <span className="text-sm font-bold text-gray-700">{entrega.repartidor.nombre_completo}</span>
                                        ) : (
                                            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full border border-orange-100 italic">Por Asignar</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${entrega.estado_delivery === 'ENTREGADO' ? 'bg-green-50 text-green-700 border-green-200' :
                                            entrega.estado_delivery === 'EN_RUTA' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {entrega.estado_delivery.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {entrega.evidencia_foto_url ? (
                                            <button
                                                onClick={() => setEvidenceUrl(entrega.evidencia_foto_url ? `http://localhost:3000/${entrega.evidencia_foto_url}` : null)}
                                                className="text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                            >
                                                <Camera size={14} /> Ver Foto
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {entrega.estado_delivery !== 'ENTREGADO' && (
                                            <button
                                                onClick={() => openAssignModal(entrega.pedido.id_pedido)}
                                                className="text-primary hover:text-primary-dark font-bold text-xs border border-primary px-3 py-1 rounded-full hover:bg-primary/5 transition-colors"
                                            >
                                                {entrega.repartidor ? 'Reasignar' : 'Asignar'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Asignacion */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
                        <h3 className="text-xl font-bold mb-4 font-serif text-gray-800">Seleccionar Repartidor</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                            {repartidores.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No hay repartidores activos.</p>
                            ) : (
                                repartidores.map(r => (
                                    <button
                                        key={r.id_usuario}
                                        onClick={() => handleAssign(r.id_usuario)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                            {r.nombre_completo.substring(0, 1)}
                                        </div>
                                        <span className="font-bold text-gray-700">{r.nombre_completo}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <button onClick={() => setIsAssignModalOpen(false)} className="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Evidencia */}
            {evidenceUrl && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setEvidenceUrl(null)}>
                    <div className="bg-white p-2 rounded-2xl max-w-2xl w-full relative animate-scale-in" onClick={e => e.stopPropagation()}>
                        <img src={evidenceUrl} alt="Evidencia" className="w-full h-auto rounded-xl max-h-[80vh] object-contain" />
                        <button
                            onClick={() => setEvidenceUrl(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                            <span className="sr-only">Cerrar</span>
                            ✖
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntregaPage;
