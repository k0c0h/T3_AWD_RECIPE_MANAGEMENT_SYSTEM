const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Intentar obtener token del header Authorization (método principal)
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // Si no hay token en header, intentar obtenerlo del query parameter (para OAuth redirects)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
