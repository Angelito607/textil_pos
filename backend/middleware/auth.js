const jwt = require('jsonwebtoken');

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token faltante' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.usuario = payload;
      if (requiredRole && payload.rol !== requiredRole) {
        return res.status(403).json({ message: 'Acceso denegado' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token inválido' });
    }
  };
}

module.exports = authMiddleware;
