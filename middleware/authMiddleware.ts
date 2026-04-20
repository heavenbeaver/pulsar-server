import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                login: string;
            }
        }
    }
}

interface JwtPayload {
    sub: string;
    login?: string;
    username?: string;
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Декодируем токен - обратите внимание на 'sub'
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; login: string };

        // Устанавливаем req.user с id из sub
        req.user = { id: decoded.sub, login: decoded.login };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.clearCookie('token');
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export default requireAuth;