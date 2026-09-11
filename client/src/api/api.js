import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://rfq-marketplace.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized request - session may have expired');
        }
        return Promise.reject(error);
    }
);

export default API;