import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    DollarSign, ShoppingBag, Package, AlertTriangle,
    TrendingUp, Calendar
} from 'lucide-react';

interface Stats {
    ventasHoy: number;
    pedidosActivos: number;
    productosActivos: number;
    insumosAlerta: number;
}

interface VentaData {
    fecha: string;
    total: number;
}

interface TopProducto {
    nombre: string;
    cantidad: number;
    [key: string]: string | number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [ventasData, setVentasData] = useState<VentaData[]>([]);
    const [topProductos, setTopProductos] = useState<TopProducto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [resStats, resVentas, resTop] = await Promise.all([
                    fetch('http://localhost:3000/api/reportes/stats', { headers }),
                    fetch('http://localhost:3000/api/reportes/ventas', { headers }),
                    fetch('http://localhost:3000/api/reportes/top-productos', { headers })
                ]);

                if (resStats.ok) setStats(await resStats.json());
                if (resVentas.ok) setVentasData(await resVentas.json());
                if (resTop.ok) setTopProductos(await resTop.json());

            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-10 text-center">Cargando Tablero...</div>;
    if (!stats) return <div className="p-10 text-center text-red-500">Error al cargar datos.</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl font-bold font-serif text-gray-800">Panel Principal</h2>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Ventas Hoy */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Ventas de Hoy</p>
                        <h3 className="text-2xl font-bold text-gray-800">S/ {Number(stats.ventasHoy).toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <DollarSign size={24} />
                    </div>
                </div>

                {/* Pedidos Activos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Pedidos Activos</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.pedidosActivos}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                </div>

                {/* Productos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Productos Activos</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.productosActivos}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Package size={24} />
                    </div>
                </div>

                {/* Alerta Stock */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-500 mb-1">Alerta Insumos</p>
                        <h3 className={`text-2xl font-bold ${stats.insumosAlerta > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                            {stats.insumosAlerta}
                        </h3>
                        {stats.insumosAlerta > 0 && <span className="text-xs text-red-500 font-bold">Bajo Stock Mínimo</span>}
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.insumosAlerta > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                        <AlertTriangle size={24} />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Ventas Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Ventas (Últimos 7 días)
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ventasData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="total" fill="#D2691E" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Productos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-secondary" />
                        Productos Más Vendidos
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={topProductos}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="cantidad"
                                >
                                    {topProductos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {topProductos.map((prod, idx) => (
                            <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                {prod.nombre}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
