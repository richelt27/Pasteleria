
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Interfaces
export interface CartItem {
    id_producto: number;
    nombre: string;
    precio: number;
    imagen_url: string;
    cantidad: number;
}

interface ProductInput {
    id_producto: number;
    nombre: string;
    precio_base?: number;
    precio?: number;
    imagen_url: string;
}


interface CartContextType {
    items: CartItem[];
    addToCart: (product: ProductInput) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse cart from local storage", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: ProductInput) => {
        setItems(prev => {
            const existing = prev.find(i => i.id_producto === product.id_producto);
            if (existing) {
                return prev.map(i =>
                    i.id_producto === product.id_producto
                        ? { ...i, cantidad: i.cantidad + 1 }
                        : i
                );
            }
            return [...prev, {
                id_producto: product.id_producto,
                nombre: product.nombre,
                precio: Number(product.precio_base || product.precio || 0),
                imagen_url: product.imagen_url,
                cantidad: 1
            }];
        });
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(i => i.id_producto !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems(prev => prev.map(i => i.id_producto === id ? { ...i, cantidad: quantity } : i));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart'); // Forzar limpieza inmediata
    };

    const total = items.reduce((sum, item) => sum + ((item.precio || 0) * (item.cantidad || 1)), 0);
    const itemCount = items.reduce((sum, item) => sum + (item.cantidad || 0), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};
