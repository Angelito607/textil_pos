USE textil_pos;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','invitado') NOT NULL DEFAULT 'invitado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (usuario, password_hash, rol) VALUES
('admin', '$2b$10$wNNnC40tSXFxiMl4.17daOkP0m5nCRCG73OOfMohply9xMI81iDvu', 'admin'),
('invitado', '$2b$10$qDXVlOAYF/U825/wOgM7uOGp4rr88abljXUnVJA6sEXyvMpVYivQ.', 'invitado');
