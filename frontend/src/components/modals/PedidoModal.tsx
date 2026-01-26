import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

interface PedidoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const PedidoModal = ({ isOpen, onClose, onSave }: PedidoModalProps) => {
    const [productos, setProductos] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<number>(0);
    const [detalles, setDetalles] = useState<{ id_producto: number, cantidad: number }[]>([]);
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [tipoEntrega, setTipoEntrega] = useState('RETIRO_TIENDA'); // RETIRO_TIENDA, DELIVERY
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            setDetalles([]);
            setSelectedUser(0);
            setFechaEntrega('');
            setTipoEntrega('RETIRO_TIENDA');
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [resProd, resUsers] = await Promise.all([
                fetch(`${API_URL}/api/productos`, { headers }),
                fetch(`${API_URL}/api/usuarios`, { headers })
            ]);

            if (resProd.ok) setProductos(await resProd.json());
            if (resUsers.ok) setUsuarios(await resUsers.json());
        } catch (error) {
            console.error(error);
        }
    };

    const addDetalle = () => {
        setDetalles([...detalles, { id_producto: 0, cantidad: 1 }]);
    };

    const updateDetalle = (index: number, field: string, value: any) => {
        const newDetalles = [...detalles];
        (newDetalles[index] as any)[field] = value;
        setDetalles(newDetalles);
    };

    const removeDetalle = (index: number) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const body = {
                id_usuario: selectedUser,
                fecha_entrega_programada: fechaEntrega,
                tipo_entrega: tipoEntrega,
                detalles
            };

            const res = await fetch(`${API_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                onSave();
                onClose();
            } else {
                alert('Error al crear pedido');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }; const prod = productos.find(p => p.id_producto === Number(selectedProdId));
    if (!prod) return;

    setCart([...cart, {
        id_producto: prod.id_producto,
        nombre: prod.nombre,
        cantidad: Number(qty),
        precio: Number(prod.precio_base)
    }]);
};

const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
};

const envioCalculado = tipoEntrega === 'DELIVERY' ? Number(costoDelivery) : 0;
const total = cart.reduce((sum, item) => sum + (item.cantidad * item.precio), 0) + envioCalculado;

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!fechaEntrega) {
        alert('Por favor selecciona una Fecha de Entrega.');
        return;
    }
    if (tipoEntrega === 'DELIVERY' && !direccion) {
        alert('Por favor ingresa la Dirección de Envío.');
        return;
    }

    try {
        const payload = {
            id_usuario: null, // Anonimo por ahora
            tipo_entrega: tipoEntrega,
            fecha_entrega_programada: fechaEntrega,
            direccion_entrega: direccion,
            referencia_direccion: '',
            costo_envio: envioCalculado, // Enviamos el costo manual
            detalles: cart.map(c => ({
                id_producto: c.id_producto,
                cantidad: c.cantidad,
                precio_unitario: c.precio,
                personalizacion: {}
            })),
            observaciones_generales: observaciones + (clienteNombre ? ` | Cliente: ${clienteNombre}` : ''),
            id_repartidor_asignado: selectedDriverId > 0 ? selectedDriverId : null
        };

        const res = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('¡Pedido generado exitosamente!');
            onSave();
            onClose();
            // Reset básico
            setCart([]);
            setClienteNombre('');
            setFechaEntrega('');
            setDireccion('');
            setObservaciones('');
        } else {
            let errorMsg = res.statusText;
            try {
                const err = await res.json();
                errorMsg = err.error || errorMsg;
            } catch (e) {
                // Response was not JSON (e.g. 404 HTML or text)
                const text = await res.text();
                if (text) errorMsg = text.substring(0, 100); // Prevent huge html alerts
            }
            alert(`Error al crear pedido (${res.status}): ${errorMsg}`);
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión al servidor. Verifica que el backend esté corriendo.');
    }
};

if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-primary p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">Nuevo Pedido</h3>
                <button onClick={onClose}><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto p-6 flex gap-6">
                {/* Left: Form Data */}
                <div className="w-1/2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Cliente / Referencia</label>
                        <div className="flex gap-2">
                            <User className="text-gray-400" />
                            <input className="w-full border rounded px-2 py-1" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Nombre del cliente" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Entrega</label>
                        <input type="datetime-local" className="w-full border rounded px-2 py-1" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo Entrega</label>
                            <select className="w-full border rounded px-2 py-1" value={tipoEntrega} onChange={e => setTipoEntrega(e.target.value)}>
                                <option value="RECOJO_TIENDA">Recojo en Tienda</option>
                                <option value="DELIVERY">Delivery</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Costo Envío (S/)</label>
                            <input
                                type="number"
                                className="w-full border rounded px-2 py-1 bg-gray-50"
                                value={costoDelivery}
                                onChange={e => setCostoDelivery(Number(e.target.value))}
                                disabled={tipoEntrega !== 'DELIVERY'}
                            />
                        </div>
                    </div>

                    {tipoEntrega === 'DELIVERY' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Dirección</label>
                                <textarea className="w-full border rounded px-2 py-1 h-20" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección exacta..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Asignar Repartidor (Opcional)</label>
                                <select
                                    className="w-full border rounded px-2 py-1 bg-white"
                                    value={selectedDriverId}
                                    onChange={e => setSelectedDriverId(Number(e.target.value))}
                                >
                                    <option value="0">-- Sin asignar --</option>
                                    {drivers.map(d => (
                                        <option key={d.id_usuario} value={d.id_usuario}>{d.nombre_completo}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-1">Observaciones</label>
                        <textarea className="w-full border rounded px-2 py-1" value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Dedicatoria, etc." />
                    </div>
                </div>

                {/* Right: Cart */}
                <div className="w-1/2 bg-gray-50 p-4 rounded-lg flex flex-col">
                    <h4 className="font-bold mb-3">Productos</h4>
                    <div className="flex gap-2 mb-4">
                        <select className="flex-1 border rounded px-2 py-1" value={selectedProdId} onChange={e => setSelectedProdId(Number(e.target.value))}>
                            <option value="0">Seleccionar...</option>
                            {productos.map(p => (
                                <option key={p.id_producto} value={p.id_producto} disabled={p.stock_vitrina <= 0}>
                                    {p.nombre} - S/{p.precio_base} (Stock: {p.stock_vitrina}) {p.stock_vitrina <= 0 ? '(Agotado)' : ''}
                                </option>
                            ))}
                        </select>
                        <input type="number" className="w-16 border rounded px-2 py-1" value={qty} onChange={e => setQty(Number(e.target.value))} min="1" />
                        <button onClick={addToCart} className="bg-secondary text-white px-3 rounded hover:bg-secondary/90"><Plus size={18} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 border rounded bg-white">
                        {cart.length === 0 ? (
                            <div className="text-center p-4 text-gray-400 text-sm">Carrito vacío</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 border-b last:border-0 text-sm">
                                    <div>
                                        <div className="font-medium">{item.nombre}</div>
                                        <div className="text-xs text-gray-500">{item.cantidad} x S/{item.precio}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">S/ {item.cantidad * item.precio}</span>
                                        <button onClick={() => removeFromCart(idx)} className="text-red-400"><X size={14} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t pt-2 space-y-1 text-sm bg-gray-100 p-2 rounded">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal Productos</span>
                            <span>S/ {(cart.reduce((s, i) => s + i.cantidad * i.precio, 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Costo de Envío</span>
                            <span>S/ {envioCalculado.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-primary mt-2 border-t border-gray-300 pt-1">
                            <span>Total a Pagar</span>
                            <span>S/ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 font-bold shadow-lg transform hover:scale-105 transition-all">
                    Generar Pedido
                </button>
            </div>
        </div>
    </div>
);
};

export default PedidoModal;
