
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado: Token requerido' });
    }

    try {
        const user = verifyToken(token);
        (req as any).user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !allowedRoles.includes(user.rol)) {
            return res.status(403).json({ error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}` });
        }
        next();
    };
};
