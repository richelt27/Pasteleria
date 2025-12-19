
import { useState, useEffect } from 'react';
import { Package, Calendar, Truck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductoDetalle {
    nombre: string;
    imagen_url: string;
}

interface Detalle {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    producto?: ProductoDetalle; // Puede ser opcional si el include falla
}

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    fecha_entrega_programada: string;
    total_pagar: number;
    estado: string;
    tipo_entrega: string;
    detalles: Detalle[];
}

const ClientPedidosPage = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPedidos = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Agregar un timestamp para evitar cache
                const res = await fetch(`http://localhost:3000/api/pedidos/mis-pedidos?t=${Date.now()}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setPedidos(data);
                    } else {
                        console.error("La respuesta no es un array:", data);
                        setPedidos([]);
                        setError("Formato de respuesta inválido.");
                    }
                } else if (res.status === 401) {
                    localStorage.removeItem('token'); // Limpiar token inválido
                    navigate('/login');
                } else {
                    setError(`Error del servidor: ${res.status}`);
                }
            } catch (err) {
                console.error("Error fetching pedidos:", err);
                setError("Error de conexión al cargar pedidos.");
            } finally {
                setLoading(false);
            }
        };
        fetchPedidos();
    }, [navigate]);

    const getEstadoBadge = (estado: string) => {
        const styles: Record<string, string> = {
            'PENDIENTE_PAGO': 'bg-yellow-100 text-yellow-800',
            'CONFIRMADO': 'bg-blue-100 text-blue-800',
            'EN_PREPARACION': 'bg-purple-100 text-purple-800',
            'EN_RUTA': 'bg-indigo-100 text-indigo-800',
            'ENTREGADO': 'bg-green-100 text-green-800',
            'CANCELADO': 'bg-red-100 text-red-800',
        };
        const label = estado ? estado.replace(/_/g, ' ') : 'Desconocido';
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>{label}</span>;
    };

    const formatCurrency = (amount: any) => {
        const num = Number(amount);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Fecha inválida';
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-primary font-bold animate-pulse">Cargando tus pedidos...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="text-red-500 font-bold mb-4">Algo salió mal: {error}</div>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-2 rounded-lg">Reintentar</button>
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
                    <Package /> Mis Pedidos
                </h1>

                {pedidos.length === 0 ? (
                    <div className="bg-white p-10 rounded-xl shadow text-center">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-6 text-lg">Aún no has realizado ningún pedido.</p>
                        <button onClick={() => navigate('/catalogo')} className="bg-secondary text-white px-8 py-3 rounded-full font-bold hover:bg-secondary-dark transition-colors inline-flex items-center gap-2">
                            Ir al Catálogo <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map(pedido => (
                            <div key={pedido.id_pedido} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Header del Pedido */}
                                <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 gap-4">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase block font-bold">Pedido #</span>
                                            <span className="font-bold text-gray-800 text-lg">{String(pedido.id_pedido).padStart(6, '0')}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase block font-bold">Fecha</span>
                                            <span className="text-sm text-gray-700">{formatDate(pedido.fecha_pedido)}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase block font-bold">Entrega</span>
                                            <span className="text-sm text-secondary font-bold flex items-center gap-1">
                                                <Calendar size={14} /> {formatDate(pedido.fecha_entrega_programada)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right w-full sm:w-auto flex justify-between sm:block items-center">
                                        <div className="mb-1">{getEstadoBadge(pedido.estado)}</div>
                                        <div className="text-xs text-gray-500 font-bold">{pedido.tipo_entrega}</div>
                                    </div>
                                </div>

                                {/* Detalles */}
                                <div className="p-4">
                                    {(pedido.detalles && Array.isArray(pedido.detalles)) ? pedido.detalles.map((det, idx) => (
                                        <div key={idx} className="flex items-center gap-4 mb-4 last:mb-0 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                <img
                                                    src={det.producto?.imagen_url || 'https://via.placeholder.com/150?text=No+Img'}
                                                    alt={det.producto?.nombre || 'Producto'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate">{det.producto?.nombre || 'Producto no disponible'}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Cant: {det.cantidad || 0} x S/ {formatCurrency(det.precio_unitario)}
                                                </p>
                                            </div>
                                            <div className="font-bold text-gray-800 whitespace-nowrap">
                                                S/ {formatCurrency((det.cantidad || 0) * (det.precio_unitario || 0))}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-gray-400 text-sm italic py-2">No hay detalles disponibles para este pedido.</div>
                                    )}

                                    <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            <span className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
                                                <Truck size={16} /> Ver Seguimiento
                                            </span>
                                        </div>
                                        <div className="text-xl font-bold text-primary">
                                            Total: S/ {formatCurrency(pedido.total_pagar)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPedidosPage;
