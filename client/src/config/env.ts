
export function requireEnv(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getEnv(name: string, defaultValue: string): string {
    return import.meta.env[name] || defaultValue;
}

export const env = {
    APP_ENV: requireEnv('VITE_APP_ENV'),
    API_BASE_URL: getEnv('VITE_API_BASE_URL', '/api'),
    FIREBASE_API_KEY: requireEnv('VITE_FIREBASE_API_KEY'),
    FIREBASE_AUTH_DOMAIN: requireEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    FIREBASE_PROJECT_ID: requireEnv('VITE_FIREBASE_PROJECT_ID'),
    FIREBASE_STORAGE_BUCKET: requireEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    FIREBASE_MESSAGING_SENDER_ID: requireEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    FIREBASE_APP_ID: requireEnv('VITE_FIREBASE_APP_ID'),
    RESET_PASSLINK: getEnv('VITE_REACT_RESET_PASSLINK', '#'),
} as const;
