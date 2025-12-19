-- 1. LIMPIEZA INICIAL (Cuidado: Borra tablas si existen)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. DEFINICIÓN DE TIPOS ENUM (Estados fijos)
CREATE TYPE estado_usuario AS ENUM ('ACTIVO', 'SUSPENDIDO', 'INACTIVO');
CREATE TYPE unidad_medida AS ENUM ('KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO');
CREATE TYPE tipo_movimiento AS ENUM ('COMPRA', 'USO_PRODUCCION', 'MERMA', 'AJUSTE', 'VENTA_DIRECTA');
CREATE TYPE estado_orden AS ENUM ('PENDIENTE', 'EN_PRODUCCION', 'HORNEADO', 'DECORADO', 'TERMINADO');
CREATE TYPE tipo_entrega AS ENUM ('DELIVERY', 'RECOJO_TIENDA');
CREATE TYPE estado_pedido AS ENUM ('PENDIENTE_PAGO', 'CONFIRMADO', 'EN_PREPARACION', 'EN_RUTA', 'ENTREGADO', 'CANCELADO');
CREATE TYPE metodo_pago AS ENUM ('TARJETA_CREDITO', 'TARJETA_DEBITO', 'YAPE_PLIN', 'EFECTIVO', 'TRANSFERENCIA');

-- ---------------------------------------------------------
-- MÓDULO 1: SEGURIDAD Y USUARIOS
-- ---------------------------------------------------------

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- Admin, Cliente, Pastelero, Delivery
    descripcion TEXT
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion_default TEXT,
    estado estado_usuario DEFAULT 'ACTIVO',
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- MÓDULO 2: ALMACÉN E INSUMOS (LOGÍSTICA)
-- ---------------------------------------------------------

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    ruc VARCHAR(20) UNIQUE,
    contacto_nombre VARCHAR(100),
    telefono VARCHAR(20),
    email_contacto VARCHAR(100)
);

CREATE TABLE insumos (
    id_insumo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL, -- Ej: Harina Pastelera, Chocolate 70%
    descripcion TEXT,
    unidad unidad_medida NOT NULL,
    stock_actual NUMERIC(12, 3) DEFAULT 0 CHECK (stock_actual >= 0), -- Soporta 3 decimales (gramos)
    stock_minimo NUMERIC(12, 3) DEFAULT 5, -- Alerta si baja de esto
    costo_promedio NUMERIC(10, 2), -- Costo promedio ponderado para reportes
    id_proveedor_preferido INT REFERENCES proveedores(id_proveedor)
);

-- Historial de movimientos (Kardex)
CREATE TABLE movimientos_almacen (
    id_movimiento BIGSERIAL PRIMARY KEY,
    id_insumo INT NOT NULL REFERENCES insumos(id_insumo),
    tipo tipo_movimiento NOT NULL,
    cantidad NUMERIC(12, 3) NOT NULL, -- Positivo entra, Negativo sale
    costo_unitario NUMERIC(10, 2), -- Solo relevante en COMPRAS
    fecha_movimiento TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    id_usuario_responsable INT REFERENCES usuarios(id_usuario),
    observacion TEXT
);

-- ---------------------------------------------------------
-- MÓDULO 3: CATÁLOGO, RECETAS Y COSTOS
-- ---------------------------------------------------------

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- Tortas Temáticas, Bollería, Postres
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base NUMERIC(10, 2) NOT NULL,
    id_categoria INT REFERENCES categorias(id_categoria),
    imagen_url TEXT,
    es_personalizable BOOLEAN DEFAULT FALSE, -- Si es TRUE, el cliente puede elegir relleno, frase, etc.
    stock_vitrina INT DEFAULT 0, -- Para productos listos (ej: cupcakes del día)
    activo BOOLEAN DEFAULT TRUE
);

-- La Receta Maestra (BOM - Bill of Materials)
CREATE TABLE recetas (
    id_receta SERIAL PRIMARY KEY,
    id_producto INT NOT NULL REFERENCES productos(id_producto),
    id_insumo INT NOT NULL REFERENCES insumos(id_insumo),
    cantidad_requerida NUMERIC(12, 3) NOT NULL, -- Cuánto insumo usa 1 unidad de producto
    unidad_uso unidad_medida -- Solo referencia visual, debe coincidir con insumo
);

-- ---------------------------------------------------------
-- MÓDULO 4: PRODUCCIÓN (BACKOFFICE PASTELERÍA)
-- ---------------------------------------------------------

-- Órdenes internas para stock o pedidos especiales
CREATE TABLE ordenes_produccion (
    id_produccion SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto),
    cantidad_a_producir INT NOT NULL,
    fecha_inicio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_fin_estimada TIMESTAMPTZ,
    id_pastelero_asignado INT REFERENCES usuarios(id_usuario),
    estado estado_orden DEFAULT 'PENDIENTE',
    lote_interno VARCHAR(50), -- Código para trazabilidad
    fecha_vencimiento DATE -- Cuándo caduca este lote de tortas
);

-- ---------------------------------------------------------
-- MÓDULO 5: VENTAS Y PEDIDOS (CLIENTE)
-- ---------------------------------------------------------

CREATE TABLE pedidos (
    id_pedido SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    fecha_pedido TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_programada TIMESTAMPTZ NOT NULL, -- Vital para cumpleaños
    tipo_entrega tipo_entrega NOT NULL,
    direccion_entrega TEXT, -- Puede ser NULL si es RECOJO
    referencia_direccion TEXT,
    total_productos NUMERIC(10, 2),
    costo_envio NUMERIC(10, 2) DEFAULT 0,
    total_pagar NUMERIC(10, 2),
    estado estado_pedido DEFAULT 'PENDIENTE_PAGO',
    observaciones_generales TEXT
);

CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido),
    id_producto INT NOT NULL REFERENCES productos(id_producto),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    
    -- AQUÍ USAMOS LA MAGIA DE POSTGRESQL: JSONB
    -- En lugar de crear 20 columnas para "sabor", "relleno", "color", "frase"
    -- Guardamos un objeto JSON: {"sabor": "vainilla", "relleno": "fudge", "frase": "Feliz día"}
    personalizacion JSONB DEFAULT NULL 
);

-- ---------------------------------------------------------
-- MÓDULO 6: FINANZAS Y DELIVERY
-- ---------------------------------------------------------

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL REFERENCES pedidos(id_pedido),
    metodo metodo_pago NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    fecha_pago TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    codigo_transaccion_pasarela VARCHAR(100), -- ID de Stripe/Culqi/Niubiz
    comprobante_url TEXT, -- Foto del Yape o PDF de factura
    estado VARCHAR(20) DEFAULT 'COMPLETADO'
);

CREATE TABLE entregas (
    id_entrega SERIAL PRIMARY KEY,
    id_pedido INT UNIQUE REFERENCES pedidos(id_pedido),
    id_repartidor INT REFERENCES usuarios(id_usuario),
    fecha_salida TIMESTAMPTZ,
    fecha_entrega_real TIMESTAMPTZ,
    evidencia_foto_url TEXT, -- Foto de la entrega (prueba)
    estado_delivery VARCHAR(50) DEFAULT 'EN_PREPARACION'
);
