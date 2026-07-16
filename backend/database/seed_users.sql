USE textil_pos;

INSERT INTO usuarios (usuario, password_hash, rol) VALUES
('admin', '$2b$10$z.yourAdminHashHere', 'admin'),
('invitado', '$2b$10$z.yourGuestHashHere', 'invitado');
