
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard, Banknote, MapPin, Calendar, ArrowLeft, Truck, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successId, setSuccessId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [tipoEntrega, setTipoEntrega] = useState('RECOJO_TIENDA'); // RECOJO_TIENDA | DELIVERY
    const [direccion, setDireccion] = useState('');
    const [referencia, setReferencia] = useState('');
    const [fechaEntrega, setFechaEntrega] = useState('');
    const [metodoPago, setMetodoPago] = useState('EFECTIVO'); // EFECTIVO | YAPE_PLIN | TARJETA

    // Mock Delivery Cost (podría ser dinámico)
    const costoEnvio = tipoEntrega === 'DELIVERY' ? 10 : 0;
    const granTotal = total + costoEnvio;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (items.length === 0) return;

        setLoading(true);
        try {
            const detalles = items.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                personalizacion: null
            }));

            const payload = {
                tipo_entrega: tipoEntrega,
                fecha_entrega_programada: new Date(fechaEntrega).toISOString(),
                direccion_entrega: tipoEntrega === 'DELIVERY' ? direccion : 'Recojo en Tienda',
                referencia_direccion: referencia,
                detalles,
                observaciones_generales: `Pago con: ${metodoPago}`,
                costo_envio: costoEnvio
            };

            const res = await fetch(`${API_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                clearCart();
                setSuccessId(data.id_pedido);
                // Navegación suave después de 2.5 segundos
                setTimeout(() => {
                    navigate('/mis-pedidos');
                }, 2500);
            } else {
                const err = await res.json();
                setError(err.error || 'Error desconocido al procesar el pedido');
            }
        } catch (error) {
            console.error(error);
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (successId) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-md w-full animate-bounce-in border border-green-100">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">¡Pedido Recibido!</h2>
                    <p className="text-gray-500 mb-6">Tu orden <span className="font-bold text-gray-800">#{String(successId).padStart(6, '0')}</span> ha sido creada exitosamente.</p>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-loading-bar w-full origin-left transition-all duration-[2500ms]"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Redirigiendo a tus pedidos...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-3xl font-serif font-bold text-primary mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-500 mb-8">¡Agrega algunas delicias para continuar!</p>
                    <button onClick={() => navigate('/catalogo')} className="bg-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                        Ir al Catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4">
                <button onClick={() => navigate('/catalogo')} className="flex items-center text-gray-500 hover:text-primary mb-6">
                    <ArrowLeft size={20} className="mr-2" /> Volver al catálogo
                </button>

                <h1 className="text-4xl font-serif font-bold text-primary mb-8">Finalizar Compra</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Form */}
                    <div className="space-y-8">
                        {/* Delivery Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <Truck className="text-secondary" /> Método de Entrega
                            </h2>
                            <div className="flex gap-4 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setTipoEntrega('RECOJO_TIENDA')}
                                    className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${tipoEntrega === 'RECOJO_TIENDA' ? 'border-secondary bg-secondary/5 text-secondary shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <MapPin size={24} />
                                    Recojo en Tienda
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipoEntrega('DELIVERY')}
                                    className={`flex-1 py-4 px-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${tipoEntrega === 'DELIVERY' ? 'border-primary bg-primary/5 text-primary shadow-md' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Truck size={24} />
                                    Delivery (+S/ 10)
                                </button>
                            </div>

                            {/* Address Fields */}
                            {/* Address Fields - Using CSS visibility to prevent DOM insertBefore errors */}
                            <div className={`mt-4 space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200 ${tipoEntrega === 'DELIVERY' ? 'block' : 'hidden'}`}>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección de Entrega <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={direccion}
                                            onChange={e => setDireccion(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none"
                                            placeholder="Calle, Número, Distrito..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Referencia</label>
                                    <input
                                        type="text"
                                        value={referencia}
                                        onChange={e => setReferencia(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none"
                                        placeholder="Ej: Frente al parque..."
                                    />
                                </div>
                            </div>

                            {/* Date Field */}
                            <div className="mt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega Deseada <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="datetime-local"
                                        value={fechaEntrega}
                                        onChange={e => setFechaEntrega(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary/50 outline-none"
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Sujeto a confirmación por el pastelero.</p>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <CreditCard className="text-secondary" /> Método de Pago
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['EFECTIVO', 'YAPE_PLIN', 'TRANSFERENCIA'].map(m => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMetodoPago(m)}
                                        className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${metodoPago === m ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {m.replace('_', ' / ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg h-fit border border-gray-100 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Resumen del Pedido</h2>
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id_producto} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={item.imagen_url || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{item.nombre}</div>
                                            <div className="text-xs text-gray-500">
                                                S/ {(item.precio || 0).toFixed(2)} x
                                                <select
                                                    value={item.cantidad}
                                                    onChange={(e) => updateQuantity(item.id_producto, parseInt(e.target.value))}
                                                    className="ml-1 bg-gray-50 rounded px-1 outline-none text-gray-800 font-bold border border-gray-200 focus:border-secondary"
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800">S/ {((item.precio || 0) * (item.cantidad || 1)).toFixed(2)}</span>
                                        <button onClick={() => removeFromCart(item.id_producto)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2 text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>S/ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Costo de Envío ({tipoEntrega === 'DELIVERY' ? 'Domicilio' : 'Tienda'})</span>
                                <span className={tipoEntrega === 'DELIVERY' ? 'text-gray-800' : 'text-green-600'}>
                                    {tipoEntrega === 'DELIVERY' ? `S/ ${costoEnvio.toFixed(2)}` : 'GRATIS'}
                                </span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold text-primary pt-4 border-t mt-4">
                                <span>Total a Pagar</span>
                                <span>S/ {granTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !fechaEntrega || (tipoEntrega === 'DELIVERY' && !direccion)}
                            className="w-full mt-8 bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
                        >
                            {loading ? 'Procesando...' : (
                                <>
                                    <Banknote size={24} className="group-hover:scale-110 transition-transform" /> Confirmar Pedido
                                </>
                            )}
                        </button>
                        {(!fechaEntrega || (tipoEntrega === 'DELIVERY' && !direccion)) && (
                            <p className="text-red-500 text-xs text-center mt-3 animate-pulse">
                                * Completa {tipoEntrega === 'DELIVERY' && !direccion ? 'la dirección y ' : ''}la fecha de entrega
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
