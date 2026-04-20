import express, { type Request, type Response } from 'express';
import todosRouter from './routes/todos.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
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