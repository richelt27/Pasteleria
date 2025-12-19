INSERT INTO roles (nombre, descripcion) VALUES 
('Admin', 'Administrador total del sistema'),
('Cliente', 'Cliente que realiza pedidos web'),
('Pastelero', 'Encargado de la producción'),
('Delivery', 'Repartidor de pedidos')
ON CONFLICT (nombre) DO NOTHING;
