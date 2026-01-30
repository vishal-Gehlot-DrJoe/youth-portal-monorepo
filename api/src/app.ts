import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import tilesRouter from './routes/tiles';
import layoutsRouter from './routes/layouts';
import mediaRouter from './routes/media';
import youthEmailRouter from './routes/youth-email';
import { errorHandler } from './middlewares';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tiles', tilesRouter);
app.use('/api/layouts', layoutsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/youth-emails', youthEmailRouter);

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(publicPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'Not Found' });
    }
});

app.use(errorHandler);

export default app;
