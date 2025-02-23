const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided'});
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || typeof decoded !== 'object') {
            throw new Error('Invalid token payload');
        }

        req.user = {
            userId: decoded.userId,
            username: decoded.username
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

module.exports = authMiddleware;