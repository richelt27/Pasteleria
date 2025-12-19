
import { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ProveedorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (nuevoProveedorId?: number) => void;
}

const ProveedorModal = ({ isOpen, onClose, onSave }: ProveedorModalProps) => {
    const [formData, setFormData] = useState({
        razon_social: '',
        ruc: '',
        contacto_nombre: '',
        telefono: '',
        email_contacto: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/proveedores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                onSave(data.id_proveedor);
                setFormData({
                    razon_social: '',
                    ruc: '',
                    contacto_nombre: '',
                    telefono: '',
                    email_contacto: ''
                });
                onClose();
            } else {
                alert('Error al crear proveedor');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="bg-secondary px-6 py-4 flex justify-between items-center text-secondary-contrast rounded-t-lg">
                    <h3 className="font-bold text-lg">Nuevo Proveedor</h3>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Razón Social</label>
                        <input
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={formData.razon_social}
                            onChange={e => setFormData({ ...formData, razon_social: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">RUC</label>
                            <input
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={formData.ruc}
                                onChange={e => setFormData({ ...formData, ruc: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contacto</label>
                        <input
                            className="w-full border rounded px-3 py-2 mt-1"
                            value={formData.contacto_nombre}
                            onChange={e => setFormData({ ...formData, contacto_nombre: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-secondary text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-secondary/90">
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProveedorModal;
