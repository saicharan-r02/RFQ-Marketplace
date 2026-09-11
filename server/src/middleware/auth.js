import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    try {
        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_rfq_marketplace_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};
// Optional auth: populates req.user if token present, but does NOT block if missing
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();
    try {
        const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_rfq_marketplace_2026';
        req.user = jwt.verify(token, secret);
        next();
    } catch (err) {
        next(); // Invalid token => just skip, don't block
    }
};
