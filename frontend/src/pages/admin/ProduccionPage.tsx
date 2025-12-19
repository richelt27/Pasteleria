
import { useState, useEffect } from 'react';
import { Plus, Clock, ChefHat, CheckCircle, Package } from 'lucide-react';
import ProduccionModal from '../../components/modals/ProduccionModal';

interface OrdenProduccion {
    id_produccion: number;
    id_producto: number;
    cantidad_a_producir: number;
    fecha_inicio: string;
    estado: string; // PENDIENTE, EN_PRODUCCION, HORNEADO, DECORADO, TERMINADO
    producto: {
        nombre: string;
    };
    pastelero?: {
        nombre_completo: string;
    };
}

const ESTADOS = ['PENDIENTE', 'EN_PRODUCCION', 'HORNEADO', 'DECORADO', 'TERMINADO'];

const ProduccionPage = () => {
    const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchOrdenes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/produccion', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setOrdenes(await response.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const handleEstadoChange = async (id: number, nuevoEstado: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/produccion/${id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                fetchOrdenes();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'EN_PRODUCCION': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'HORNEADO': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'DECORADO': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'TERMINADO': return 'bg-green-50 text-green-600 border-green-200';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary font-serif">Plan de Producción</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} /> Nueva Orden
                </button>
            </div>

            {/* TABLERO KANBAN */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-[1000px] h-full">
                    {ESTADOS.map(estado => (
                        <div key={estado} className="flex-1 bg-gray-50 rounded-lg flex flex-col min-w-[250px]">
                            <div className={`p-3 border-b-2 font-bold text-sm uppercase tracking-wider ${getEstadoColor(estado).split(' ')[1]}`}>
                                {estado.replace('_', ' ')}
                            </div>
                            <div className="p-2 flex-1 overflow-y-auto space-y-3">
                                {ordenes.filter(o => o.estado === estado).map(orden => (
                                    <div key={orden.id_produccion} className="bg-white p-4 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-gray-800">{orden.producto?.nombre}</span>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">x{orden.cantidad_a_producir}</span>
                                        </div>

                                        <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                                            <ChefHat size={14} />
                                            {orden.pastelero?.nombre_completo || 'Sin asignar'}
                                        </div>

                                        {/* ACCIONES DE ESTADO */}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400">{new Date(orden.fecha_inicio).toLocaleDateString()}</span>

                                            <div className="flex gap-1">
                                                {/* Botón para avanzar estado */}
                                                {estado !== 'TERMINADO' && (
                                                    <button
                                                        onClick={() => handleEstadoChange(orden.id_produccion, ESTADOS[ESTADOS.indexOf(estado) + 1])}
                                                        className="p-1 hover:bg-green-100 text-green-600 rounded bg-gray-50 transition-colors"
                                                        title="Avanzar etapa"
                                                    >
                                                        <Clock size={16} /> →
                                                    </button>
                                                )}
                                                {/* Botón para completar (si es el paso anterior) */}
                                                {/* Se simplifico para usar solo el boton de avanzar */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {ordenes.filter(o => o.estado === estado).length === 0 && (
                                    <div className="text-center text-gray-300 py-8 text-sm">Sin órdenes</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ProduccionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchOrdenes}
            />
        </div>
    );
};

export default ProduccionPage;
