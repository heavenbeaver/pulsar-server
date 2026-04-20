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

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    let token = req.cookies.token;

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = {
            id: payload.sub,
            login: payload.login ?? payload.username ?? ''
        };

        // Проверяем, что установили id
        if (!req.user.id) {
            console.error('No user ID in token payload:', payload);
            res.status(401).json({ error: 'Invalid token structure' });
            return;
        }
        next();
    } catch (err) {
        console.error('JWT verification error:', err);
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
}