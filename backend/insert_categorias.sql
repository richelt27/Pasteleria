INSERT INTO categorias (nombre, imagen_url, activo) VALUES 
('Tortas Temáticas', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000', TRUE),
('Bollería y Panes', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000', TRUE),
('Postres Individuales', 'https://images.unsplash.com/photo-1563729768-3980346f0460?q=80&w=1000', TRUE),
('Bocaditos Salados', 'https://images.unsplash.com/photo-1626021795551-24b953d6f0c6?q=80&w=1000', TRUE),
('Personalizados', 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1000', TRUE)
ON CONFLICT (id_categoria) DO NOTHING;
