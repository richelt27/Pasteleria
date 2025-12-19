
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface Rol {
    id_rol: number;
    nombre: string;
}

interface Usuario {
    id_usuario?: number;
    nombre_completo: string;
    email: string;
    password?: string;
    telefono: string;
    direccion?: string;
    id_rol: number;
    estado?: string;
}

interface UsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    usuarioToEdit?: Usuario | null;
}

const UsuarioModal = ({ isOpen, onClose, onSave, usuarioToEdit }: UsuarioModalProps) => {
    const [formData, setFormData] = useState<Usuario>({
        nombre_completo: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        id_rol: 2 // Cliente por defecto
    });
    const [roles, setRoles] = useState<Rol[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cargar roles (podría moverse a un contexto o hook, pero para simplicidad lo hacemos aquí)
    useEffect(() => {
        // En una app real, esto vendría de una API /api/roles. 
        // Por ahora hardcodeamos los IDs basados en el Seed para agilizar, 
        // o idealmente deberíamos hacer fetch('/api/roles').
        // Asumiremos los del seed: 1:Admin, 2:Cliente, 3:Pastelero, 4:Delivery
        setRoles([
            { id_rol: 1, nombre: 'Admin' },
            { id_rol: 2, nombre: 'Cliente' },
            { id_rol: 3, nombre: 'Pastelero' },
            { id_rol: 4, nombre: 'Delivery' }
        ]);
    }, []);

    useEffect(() => {
        if (usuarioToEdit) {
            setFormData({
                ...usuarioToEdit,
                password: '', // No mostrar hash
            });
        } else {
            setFormData({
                nombre_completo: '',
                email: '',
                password: '',
                telefono: '',
                direccion: '',
                id_rol: 2
            });
        }
        setError('');
    }, [usuarioToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const url = usuarioToEdit
                ? `http://localhost:3000/api/usuarios/${usuarioToEdit.id_usuario}`
                : 'http://localhost:3000/api/usuarios';

            const method = usuarioToEdit ? 'PUT' : 'POST';

            // Si editamos y no se puso password, lo quitamos del body para no sobreescribirlo con vacío
            const bodyData = { ...formData };
            if (usuarioToEdit && !bodyData.password) {
                delete bodyData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar usuario');
            }

            onSave();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg font-serif">
                        {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button onClick={onClose} className="hover:text-secondary transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            type="text"
                            required
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                            value={formData.nombre_completo}
                            onChange={e => setFormData({ ...formData, nombre_completo: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                        <select
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary bg-white"
                            value={formData.id_rol}
                            onChange={e => setFormData({ ...formData, id_rol: Number(e.target.value) })}
                        >
                            {roles.map(rol => (
                                <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                                value={formData.telefono || ''}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {usuarioToEdit ? 'Contraseña (Dejar vacío para mantener)' : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            required={!usuarioToEdit}
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary h-20"
                            value={formData.direccion || ''}
                            onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                        />
                    </div>

                    {usuarioToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-secondary bg-white"
                                value={formData.estado || 'ACTIVO'}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                            >
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="SUSPENDIDO">SUSPENDIDO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 flex items-center gap-2"
                        >
                            {loading ? 'Guardando...' : <><Save size={18} /> Guardar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UsuarioModal;
