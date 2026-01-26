
import { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import { MapPin, Phone, Clock, Truck, Camera, ShoppingBag } from 'lucide-react';

// Tipos básicos (se podrían mover a un archivo types.ts)
interface Entrega {
    id_entrega: number;
    estado_delivery: string;
    pedido: {
        id_pedido: number;
        fecha_entrega_programada: string;
        direccion_entrega: string;
        referencia_direccion: string;
        usuario: {
            nombre_completo: string;
            telefono: string;
        };
        detalles: Array<{
            producto: { nombre: string; imagen_url: string };
            cantidad: number;
        }>;
    };
}

const DriverDashboard = () => {
    const [entregas, setEntregas] = useState<Entrega[]>([]);
    const [disponibles, setDisponibles] = useState<Entrega[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('PENDIENTES'); // DISPONIBLES | PENDIENTES | COMPLETADOS

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Mis Entregas
            const res1 = await fetch(`${API_URL}/api/entregas/mis-entregas`, { headers });
            if (res1.ok) setEntregas(await res1.json());

            // 2. Disponibles (Bolsa)
            const res2 = await fetch(`${API_URL}/api/entregas/disponibles`, { headers });
            if (res2.ok) setDisponibles(await res2.json());

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
        // Polling más rápido para la bolsa (cada 5s) para ver competencia en tiempo real
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id_entrega: number, newStatus: string, file?: File) => {
        try {
            const token = localStorage.getItem('token');
            const headers: any = { 'Authorization': `Bearer ${token}` };

            let body;
            if (file) {
                const formData = new FormData();
                formData.append('estado', newStatus);
                formData.append('evidencia', file);
                body = formData;
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify({ estado: newStatus });
            }

            const res = await fetch(`${API_URL}/api/entregas/${id_entrega}/estado`, {
                method: 'PUT',
                headers,
                body
            });

            if (res.ok) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const tomarPedido = async (id_entrega: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/entregas/tomar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_entrega })
            });

            if (res.ok) {
                alert('¡Pedido asignado! Ahora está en tu lista de Pendientes.');
                fetchData();
                setActiveTab('PENDIENTES');
            } else {
                const err = await res.json();
                alert(err.error || 'No se pudo tomar el pedido.');
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const activeDeliveries = entregas.filter(e => e.estado_delivery !== 'ENTREGADO');
    const historyDeliveries = entregas.filter(e => e.estado_delivery === 'ENTREGADO');

    let renderList: Entrega[] = [];
    if (activeTab === 'DISPONIBLES') renderList = disponibles;
    else if (activeTab === 'PENDIENTES') renderList = activeDeliveries;
    else renderList = historyDeliveries;

    if (loading && entregas.length === 0 && disponibles.length === 0) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-20">
            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                <button onClick={() => setActiveTab('DISPONIBLES')} className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeTab === 'DISPONIBLES' ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                    Bolsa ({disponibles.length})
                </button>
                <button onClick={() => setActiveTab('PENDIENTES')} className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeTab === 'PENDIENTES' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                    Míos ({activeDeliveries.length})
                </button>
                <button onClick={() => setActiveTab('COMPLETADOS')} className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-lg transition-colors ${activeTab === 'COMPLETADOS' ? 'bg-green-500 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
                    Historial
                </button>
            </div>

            <div className="space-y-4">
                {renderList.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No hay entregas en esta sección.</p>
                    </div>
                ) : (
                    renderList.map(item => (
                        <div key={item.id_entrega} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden animate-fade-in">
                            <div className={`absolute top-0 left-0 w-2 h-full ${item.estado_delivery === 'EN_RUTA' ? 'bg-blue-500' :
                                item.estado_delivery === 'ENTREGADO' ? 'bg-green-500' :
                                    activeTab === 'DISPONIBLES' ? 'bg-orange-400' : 'bg-yellow-400'
                                }`}></div>

                            <div className="flex justify-between items-start mb-4 pl-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800 text-lg">#{item.pedido.id_pedido}</h3>
                                        <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">{item.pedido.usuario?.nombre_completo || 'Cliente'}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Clock size={14} />
                                        {new Date(item.pedido.fecha_entrega_programada).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="pl-4 space-y-3 mb-6">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <MapPin className="text-primary mt-1 shrink-0" size={20} />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{item.pedido.direccion_entrega || 'Sin Dirección'}</p>
                                        <p className="text-xs text-gray-500">{item.pedido.referencia_direccion}</p>
                                    </div>
                                </div>
                                {activeTab !== 'DISPONIBLES' && item.pedido.usuario?.telefono && (
                                    <a href={`tel:${item.pedido.usuario.telefono}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                                        <Phone className="text-green-600" size={20} />
                                        <span className="font-bold text-gray-700">{item.pedido.usuario.telefono}</span>
                                    </a>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="pl-4 pt-4 border-t border-gray-100">
                                {activeTab === 'DISPONIBLES' ? (
                                    <button
                                        key="btn-take"
                                        onClick={() => tomarPedido(item.id_entrega)}
                                        className="w-full bg-orange-500 active:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 animate-pulse"
                                    >
                                        <ShoppingBag /> ¡Tomar Pedido!
                                    </button>
                                ) : (
                                    activeTab === 'PENDIENTES' && (
                                        item.estado_delivery === 'EN_RUTA' ? (
                                            <div className="w-full">
                                                <input
                                                    type="file"
                                                    id={`file-${item.id_entrega}`}
                                                    className="hidden"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            updateStatus(item.id_entrega, 'ENTREGADO', e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    key="btn-finish"
                                                    onClick={() => document.getElementById(`file-${item.id_entrega}`)?.click()}
                                                    className="w-full bg-green-600 active:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                                                >
                                                    <Camera /> <span>Confirmar Entrega (Foto)</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                key="btn-start"
                                                onClick={() => updateStatus(item.id_entrega, 'EN_RUTA')}
                                                className="w-full bg-blue-600 active:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                            >
                                                <Truck /> <span>Iniciar Ruta</span>
                                            </button>
                                        )
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
