import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../api/auth';

vi.mock('../api/axiosConfig', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

import api from '../api/axiosConfig';

describe('Auth API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('login calls POST /users/login with correct payload', async () => {
        (api.post as any).mockResolvedValueOnce({ data: { token: 'abc' } });

        await authApi.login('jan', 'haslo123');

        expect(api.post).toHaveBeenCalledWith('/users/login', {
            login: 'jan',
            password: 'haslo123',
        });
    });

    it('register calls POST /users/register with correct payload', async () => {
        (api.post as any).mockResolvedValueOnce({ data: { id: '1' } });

        await authApi.register('jan', 'jan@example.com', 'Haslo123!');

        expect(api.post).toHaveBeenCalledWith('/users/register', {
            username: 'jan',
            email: 'jan@example.com',
            password: 'Haslo123!',
        });
    });

    it('logout calls POST /users/logout with refreshToken', async () => {
        (api.post as any).mockResolvedValueOnce({ data: {} });

        await authApi.logout('refresh-token-xyz');

        expect(api.post).toHaveBeenCalledWith('/users/logout', {
            refreshToken: 'refresh-token-xyz',
        });
    });

    it('forgotPassword calls POST /users/forgot-password with email', async () => {
        (api.post as any).mockResolvedValueOnce({ data: {} });

        await authApi.forgotPassword('jan@example.com');

        expect(api.post).toHaveBeenCalledWith('/users/forgot-password', {
            email: 'jan@example.com',
        });
    });

    it('resetPassword calls POST /users/reset-password with token and new password', async () => {
        (api.post as any).mockResolvedValueOnce({ data: {} });

        await authApi.resetPassword('reset-token', 'NoweHaslo123!');

        expect(api.post).toHaveBeenCalledWith('/users/reset-password', {
            token: 'reset-token',
            newPassword: 'NoweHaslo123!',
        });
    });

    it('login returns data from API response', async () => {
        const mockResponse = { data: { token: 'abc123', username: 'jan' } };
        (api.post as any).mockResolvedValueOnce(mockResponse);

        const result = await authApi.login('jan', 'haslo123');

        expect(result.data.token).toBe('abc123');
        expect(result.data.username).toBe('jan');
    });

    it('login throws when API returns error', async () => {
        (api.post as any).mockRejectedValueOnce(new Error('Network error'));

        await expect(authApi.login('jan', 'haslo123')).rejects.toThrow('Network error');
    });
});
