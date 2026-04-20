import express, { type Request, type Response } from 'express';
import todosRouter from './routes/todos.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

const allowedOrigins = new Set(
    [
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'https://todo-client-sigma-eight.vercel.app'
    ].filter(Boolean) as string[]
);

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests without Origin header.
        if (!origin) {
            callback(null, true);
            return;
        }

        if (allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT;

app.get("/", (req: Request, res: Response) => res.send("OK"));

// API
app.use('/auth', authRouter);
app.use('/todos', todosRouter);
app.use('/users', usersRouter);

app.listen(PORT, () => {
    console.log(`Server listening: http://localhost:${PORT}`);
});