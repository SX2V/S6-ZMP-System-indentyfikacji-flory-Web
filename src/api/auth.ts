import api from './axiosConfig';
import type { LoginResponse, RegisterResponse, RefreshResponse } from '../types/auth';

export const authApi = {
    login: (login: string, password: string) =>
        api.post<LoginResponse>('/users/login', { login, password }),

    register: (username: string, email: string, password: string) =>
        api.post<RegisterResponse>('/users/register', { username, email, password }),

    logout: (refreshToken: string) => api.post('/users/logout', { refreshToken }),

    refresh: (refreshToken: string) =>
        api.post<RefreshResponse>('/users/refresh', { refreshToken }),

    forgotPassword: (email: string) => api.post('/users/forgot-password', { email }),

    resetPassword: (token: string, newPassword: string) =>
        api.post('/users/reset-password', { token, newPassword }),

    resendVerification: (email: string) =>
        api.post(`/users/resend-verification?email=${encodeURIComponent(email)}`),
};
