import 'dotenv/config';
import app from './src/app';
import { connectToDatabase, closeDatabaseConnection } from './src/lib/db';
import { validateEnv, env } from './src/config/env';
import { youthEmailService } from './src/services/youth-email.service';

validateEnv();

let server: ReturnType<typeof app.listen>;

async function startServer() {
    try {
        await connectToDatabase();
        await youthEmailService.ensureIndexes();
        server = app.listen(env.PORT, () => {
            console.log(`Youth Portal API running on port ${env.PORT} [${env.NODE_ENV}]`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

async function shutdown() {
    console.log('Shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            closeDatabaseConnection().then(() => process.exit(0));
        });
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
