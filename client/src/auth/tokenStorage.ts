let idToken: string | null = null;

export function setToken(token: string | null): void {
    idToken = token;
}

export function getToken(): string | null {
    return idToken;
}

export function clearToken(): void {
    idToken = null;
}
