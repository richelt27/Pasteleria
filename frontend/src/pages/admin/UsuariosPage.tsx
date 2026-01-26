
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import UsuarioModal from '../../components/modals/UsuarioModal';
import { API_URL } from '../../config';

interface Usuario {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    telefono: string;
    estado: string;
    id_rol: number;
    direccion_default?: string;
    rol: {
        id_rol: number;
        nombre: string;
    };
}

const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados del Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Usuarios data:', data); // Debugging Log
                setUsuarios(data);
            }
        } catch (error) {
            console.error('Error al cargar usuarios', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de desactivar este usuario?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchUsuarios(); // Recargar lista
            } else {
                alert('Error al desactivar usuario');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (usuario: Usuario) => {
        // Mapear al formato que espera el modal (aplanar estructura si es necesario)
        const usuarioForEdit = {
            ...usuario,
            // Safety check for rol
            id_rol: usuario.rol?.id_rol ?? 2,
            direccion: usuario.direccion_default
        };
        setSelectedUsuario(usuarioForEdit as any);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setSelectedUsuario(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        fetchUsuarios(); // Recargar tabla después de guardar
    };

    // Filter with null checks
    const filteredUsuarios = usuarios.filter(u =>
        (u.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary font-serif">Gestión de Usuarios</h1>
                <button
                    onClick={handleNew}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">ID</th>
                            <th className="p-4 font-semibold text-gray-600">Nombre</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Rol</th>
                            <th className="p-4 font-semibold text-gray-600">Estado</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando usuarios...</td></tr>
                        ) : filteredUsuarios.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                        ) : (
                            filteredUsuarios.map((usuario) => (
                                <tr key={usuario.id_usuario} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-500">#{usuario.id_usuario}</td>
                                    <td className="p-4 font-medium text-primary">{usuario.nombre_completo || 'Sin nombre'}</td>
                                    <td className="p-4 text-gray-600">{usuario.email || 'Sin email'}</td>
                                    <td className="p-4">
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-bold
                                            ${usuario.rol?.nombre === 'Admin' ? 'bg-purple-100 text-purple-700' : ''}
                                            ${usuario.rol?.nombre === 'Pastelero' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${usuario.rol?.nombre === 'Cliente' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${usuario.rol?.nombre === 'Delivery' ? 'bg-green-100 text-green-700' : ''}
                                            ${!usuario.rol?.nombre ? 'bg-gray-100 text-gray-500' : ''}
                                        `}>
                                            {usuario.rol?.nombre || 'Sin Rol'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-bold
                                            ${usuario.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                        `}>
                                            {usuario.estado || 'DESCONOCIDO'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario.id_usuario)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                title="Desactivar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <UsuarioModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                usuarioToEdit={selectedUsuario}
            />
        </div>
    );
};

export default UsuariosPage;
