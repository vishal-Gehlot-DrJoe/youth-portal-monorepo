import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiException } from '../types/api';
import { getToken } from '../auth/tokenStorage';
import { auth } from '../auth/firebase.auth';

const BASE_URL = '/api';
const TIMEOUT = 30000;

const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});


httpClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        let token = getToken();

        if (auth.currentUser) {
            try {
                token = await auth.currentUser.getIdToken();
            } catch (error) {
                console.error('Failed to get fresh token', error);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse<unknown>>) => {
        if (error.response?.data?.error) {
            const { code, message } = error.response.data.error;
            throw new ApiException(code, message, error.response.status);
        }

        if (error.code === 'ECONNABORTED') {
            throw new ApiException('TIMEOUT', 'Request timed out', 408);
        }

        if (!error.response) {
            throw new ApiException('NETWORK_ERROR', 'Network error', 0);
        }

        throw new ApiException(
            'UNKNOWN_ERROR',
            error.message || 'An unexpected error occurred',
            error.response?.status || 500
        );
    }
);

export default httpClient;
