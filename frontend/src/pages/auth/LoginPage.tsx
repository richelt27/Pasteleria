
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, Lock, Mail } from 'lucide-react';
import { API_URL } from '../../config';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guardar token
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirigir según rol
            // Redirigir según rol
            if (['Admin', 'Pastelero'].includes(data.usuario.rol)) {
                navigate('/admin/dashboard');
            } else if (data.usuario.rol === 'Delivery') {
                navigate('/repartidor');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-secondary/20">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-primary w-16 h-16 rounded-full flex items-center justify-center text-secondary mb-4">
                        <Cake size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-primary font-serif">Bienvenido</h2>
                    <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                placeholder="usuario@pasteleria.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-secondary font-bold py-3 rounded-lg hover:bg-primary/90 transition-all transform active:scale-95 disabled:opacity-70"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
