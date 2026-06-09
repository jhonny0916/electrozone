CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  characteristics TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255),
  category VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  article_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cart_article FOREIGN KEY (article_id) REFERENCES articles(id),
  CONSTRAINT uq_cart_user_article_paid UNIQUE (user_id, article_id, paid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO articles (name, description, characteristics, price, stock, image_url, category)
SELECT * FROM (
  SELECT 'Aire acondicionado portátil 12000 BTU', 'Enfría habitaciones medianas con bajo consumo energético y operación silenciosa.', 'Control remoto; temporizador 24 horas; modo deshumidificación; gas ecológico', 1899000.00, 12, 'aireacondicionado.jpg', 'Climatización'
  UNION ALL SELECT 'Arrocera eléctrica 1.8L', 'Prepara arroz suelto y uniforme con función de mantener caliente automáticamente.', 'Capacidad 1.8 litros; tapa de vidrio; olla antiadherente; cuchara y taza medidora', 199900.00, 25, 'arrocera.png', 'Cocina'
  UNION ALL SELECT 'Aspiradora ciclónica sin bolsa', 'Limpieza profunda para pisos duros y alfombras con depósito lavable.', 'Filtro HEPA; cable retráctil; potencia 1600W; boquilla multifunción', 549900.00, 10, 'aspiradora.jpg', 'Aseo del hogar'
  UNION ALL SELECT 'Batidora de mano 5 velocidades', 'Ideal para mezclar masas ligeras, cremas y preparaciones diarias.', '5 velocidades; función turbo; incluye ganchos para amasar; 300W', 119900.00, 30, 'batidora.jpg', 'Cocina'
  UNION ALL SELECT 'Cafetera de goteo 12 tazas', 'Café recién hecho para toda la familia con sistema antigoteo.', 'Capacidad 12 tazas; filtro removible; placa térmica; apagado automático', 159900.00, 22, 'cafetera.jpg', 'Cocina'
  UNION ALL SELECT 'Calentador de agua a gas 10L', 'Suministro continuo de agua caliente para ducha y lavaplatos.', 'Encendido automático; perillas de temperatura y caudal; sistema de seguridad', 789900.00, 8, 'calentadoragua.jpg', 'Baño'
  UNION ALL SELECT 'Deshumidificador portátil 20L/día', 'Reduce humedad y malos olores para mejorar el ambiente en interiores.', 'Capacidad 20L por día; tanque removible; indicador de llenado; ruedas', 699900.00, 9, 'deshumidificador.jpg', 'Climatización'
  UNION ALL SELECT 'Estufa a gas de 4 puestos', 'Cocción rápida y uniforme con horno amplio para preparaciones familiares.', '4 quemadores; encendido eléctrico; horno con luz; parrillas esmaltadas', 1299900.00, 7, 'estufagas.jpg', 'Cocina'
  UNION ALL SELECT 'Extractor de jugos 800W', 'Extrae jugos naturales de frutas y verduras en segundos.', '2 velocidades; boca ancha; recipiente para pulpa; jarra recolectora', 289900.00, 14, 'extractorjugos.jpg', 'Cocina'
  UNION ALL SELECT 'Freidora de aire digital 5L', 'Cocina más saludable con poco o nada de aceite.', 'Capacidad 5 litros; panel táctil; 8 programas; apagado automático', 429900.00, 16, 'freidora.jpg', 'Cocina'
  UNION ALL SELECT 'Horno eléctrico 45L', 'Horneado parejo para pizzas, carnes y repostería.', 'Capacidad 45 litros; timer 60 min; bandeja y rejilla; 2000W', 559900.00, 11, 'hornoelectrico.png', 'Cocina'
  UNION ALL SELECT 'Lavadora automática carga superior 18kg', 'Lavado eficiente con múltiples ciclos para todo tipo de prendas.', 'Capacidad 18kg; panel digital; ahorro de agua; centrifugado potente', 1699900.00, 6, 'lavadora.jpg', 'Lavandería'
  UNION ALL SELECT 'Licuadora de alta potencia 2L', 'Perfecta para batidos, salsas y preparaciones frías o calientes.', 'Vaso 2 litros; cuchillas de acero; 10 velocidades; pulso', 239900.00, 20, 'licuadora.jpg', 'Cocina'
  UNION ALL SELECT 'Microondas digital 0.9 pies cúbicos', 'Calienta y descongela alimentos rápidamente para el día a día.', 'Panel digital; 10 niveles de potencia; función descongelar; timer', 419900.00, 13, 'microondas.jpg', 'Cocina'
  UNION ALL SELECT 'Nevera no frost 420L', 'Conservación óptima de alimentos con distribución uniforme del frío.', 'Capacidad 420 litros; sistema no frost; dispensador de agua; luz LED', 2799900.00, 5, 'nevera.png', 'Refrigeración'
  UNION ALL SELECT 'Parrilla eléctrica antiadherente', 'Asa carnes, verduras y sándwiches de forma rápida y uniforme.', 'Superficie antiadherente; control de temperatura; 1500W; bandeja de grasa', 189900.00, 18, 'parrillaelectrica.jpg', 'Cocina'
  UNION ALL SELECT 'Plancha a vapor cerámica', 'Elimina arrugas con deslizamiento suave y vapor continuo.', 'Suela cerámica; golpe de vapor; rociador; control de temperatura', 99900.00, 35, 'planchavapor.jpg', 'Cuidado de ropa'
  UNION ALL SELECT 'Sanduchera eléctrica compacta', 'Prepara sándwiches tostados de manera práctica y rápida.', 'Placas antiadherentes; luz indicadora; cierre de seguridad; 750W', 89900.00, 28, 'sanducheraelectrica.jpg', 'Cocina'
  UNION ALL SELECT 'Secador de cabello iónico 2200W', 'Secado rápido con menor frizz para un acabado profesional.', 'Tecnología iónica; 3 temperaturas; 2 velocidades; incluye difusor', 139900.00, 24, 'secadorcabello.jpg', 'Cuidado personal'
  UNION ALL SELECT 'Ventilador de pedestal 16 pulgadas', 'Refresca espacios con flujo de aire constante y silencioso.', '3 velocidades; altura ajustable; oscilación automática; base estable', 149900.00, 19, 'ventilador.jpg', 'Climatización'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM articles LIMIT 1);
