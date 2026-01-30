export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getEnv(name: string, defaultValue: string): string {
    return process.env[name] || defaultValue;
}


export function validateEnv(): void {
    const required = ['MONGODB_URI'];
    const missing = required.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

export const env = {
    NODE_ENV: getEnv('NODE_ENV', 'development'),
    PORT: parseInt(getEnv('PORT', '5001'), 10),
    MONGODB_URI: requireEnv('MONGODB_URI'),
    JWT_SECRET: process.env.JWT_SECRET,
} as const;
