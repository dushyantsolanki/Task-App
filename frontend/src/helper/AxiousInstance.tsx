import { getCookie } from '@/lib/utils';
import axios from 'axios';

const AxiousInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://task-mate-full-stack.onrender.com/api/v1',
    withCredentials: true
});

let isRefreshing = false;
let requestQueue: {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
    requestQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    requestQueue = [];
};

AxiousInstance.interceptors.request.use((config) => {
    const token = getCookie('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

AxiousInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getCookie('refreshToken');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            refreshToken
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    requestQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(AxiousInstance(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                await axios.post(
                    `${AxiousInstance.defaults.baseURL}/auth/refresh-token`, null,
                    { withCredentials: true }
                );

                return AxiousInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default AxiousInstance;
