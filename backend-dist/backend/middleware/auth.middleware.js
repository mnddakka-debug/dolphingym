import jwt from 'jsonwebtoken';
// 1. Verify JWT and Account Status
export const authenticate = async (req, res, next) => {
    // Accessing headers from the correctly typed request object
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // In production, fetch user from DB to ensure they aren't 'blocked'
        // const user = await UserRepository.findById(decoded.id);
        // if (user.status === 'blocked') return res.status(403).json({ error: 'Account is blocked' });
        req.user = decoded;
        next();
    }
    catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
// 2. Authorize based on Roles
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden: You do not have permission to access this resource.'
            });
        }
        next();
    };
};
