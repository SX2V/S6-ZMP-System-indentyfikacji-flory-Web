import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal<typeof axios>();

    const mockInstance = {
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
        post: vi.fn(),
        get: vi.fn(),
        defaults: { headers: { common: {} } },
    };

    return {
        default: {
            ...actual.default,
            create: vi.fn(() => mockInstance),
            post: vi.fn(),
        },
    };
});

const BASE_URL = 'https://ezielnik-production.up.railway.app';

const makeError = (status: number, url = '/herbaria', retry = false) => ({
    response: { status },
    config: { url, _retry: retry, headers: {} },
});

const buildRequestInterceptor = () => (cfg: any) => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
};

const buildResponseInterceptor = (axiosPost: typeof axios.post, apiCall?: (cfg: any) => any) => {
    return async (error: any) => {
        const original = error.config;
        const isAuthEndpoint =
            original.url?.includes('/users/login') || original.url?.includes('/users/register');

        if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
            original._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const res = await axiosPost(`${BASE_URL}/users/refresh`, { refreshToken });
                    const { token, refreshToken: newRefresh } = (res as any).data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('refreshToken', newRefresh);
                    original.headers.Authorization = `Bearer ${token}`;
                    if (apiCall) return apiCall(original);
                    return { retried: true, config: original };
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    };
};

describe('axiosConfig — request interceptor', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('dodaje nagłówek Authorization gdy token istnieje', () => {
        localStorage.setItem('token', 'my-token');
        const config: any = { headers: {} };
        const result = buildRequestInterceptor()(config);
        expect(result.headers.Authorization).toBe('Bearer my-token');
    });

    it('nie dodaje nagłówka Authorization gdy brak tokenu', () => {
        const config: any = { headers: {} };
        const result = buildRequestInterceptor()(config);
        expect(result.headers.Authorization).toBeUndefined();
    });

    it('zwraca config bez mutacji innych pól', () => {
        localStorage.setItem('token', 'tok');
        const config: any = { headers: {}, url: '/test', method: 'get' };
        const result = buildRequestInterceptor()(config);
        expect(result.url).toBe('/test');
        expect(result.method).toBe('get');
    });

    it('zastępuje stary token nowym gdy token się zmieni', () => {
        localStorage.setItem('token', 'first-token');
        const config1: any = { headers: {} };
        buildRequestInterceptor()(config1);
        expect(config1.headers.Authorization).toBe('Bearer first-token');

        localStorage.setItem('token', 'second-token');
        const config2: any = { headers: {} };
        buildRequestInterceptor()(config2);
        expect(config2.headers.Authorization).toBe('Bearer second-token');
    });
});

describe('axiosConfig — response interceptor (401 handling)', () => {
    const mockAxiosPost = vi.mocked(axios.post);

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        Object.defineProperty(window, 'location', {
            value: { href: '' },
            writable: true,
        });
    });

    it('przy 401 próbuje odświeżyć token z refreshToken', async () => {
        localStorage.setItem('refreshToken', 'old-refresh');
        mockAxiosPost.mockResolvedValueOnce({
            data: { token: 'new-token', refreshToken: 'new-refresh' },
        });

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        const result = await interceptor(makeError(401));

        expect(axios.post).toHaveBeenCalledWith(`${BASE_URL}/users/refresh`, {
            refreshToken: 'old-refresh',
        });
        expect(result.retried).toBe(true);
    });

    it('po udanym refreshu zapisuje nowy token i refreshToken do localStorage', async () => {
        localStorage.setItem('refreshToken', 'old-refresh');
        mockAxiosPost.mockResolvedValueOnce({
            data: { token: 'new-token', refreshToken: 'new-refresh' },
        });

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401));

        expect(localStorage.getItem('token')).toBe('new-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    it('gdy refresh się nie powiedzie — czyści localStorage i przekierowuje', async () => {
        localStorage.setItem('token', 'old');
        localStorage.setItem('refreshToken', 'old-refresh');
        mockAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401)).catch(() => {});

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(window.location.href).toBe('/login');
    });

    it('gdy brak refreshToken — czyści localStorage i przekierowuje', async () => {
        localStorage.setItem('token', 'old');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401)).catch(() => {});

        expect(localStorage.getItem('token')).toBeNull();
        expect(window.location.href).toBe('/login');
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('nie próbuje refresha gdy _retry już ustawione (zapobiega pętli)', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(401, '/herbaria', true))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('nie próbuje refresha dla endpointów auth (/users/login)', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(401, '/users/login'))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('nie próbuje refresha dla endpointów auth (/users/register)', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(401, '/users/register'))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('przepuszcza błędy inne niż 401 bez próby refresha', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(403))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('przepuszcza błąd 500 bez próby refresha', async () => {
        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(500))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('po udanym refreshu ustawia nowy Bearer token w nagłówku oryginalnego requestu', async () => {
        localStorage.setItem('refreshToken', 'old-refresh');
        mockAxiosPost.mockResolvedValueOnce({
            data: { token: 'new-token', refreshToken: 'new-refresh' },
        });

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        const result = await interceptor(makeError(401));

        expect(result.config.headers.Authorization).toBe('Bearer new-token');
    });

    it('ustawia _retry=true przed próbą refresha — zapobiega rekurencji', async () => {
        localStorage.setItem('refreshToken', 'refresh');
        mockAxiosPost.mockResolvedValueOnce({
            data: { token: 'new-token', refreshToken: 'new-refresh' },
        });

        const error = makeError(401);
        expect(error.config._retry).toBe(false);

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(error);

        expect(error.config._retry).toBe(true);
    });

    it('przy nieudanym refreshie czyści WSZYSTKIE klucze z localStorage', async () => {
        localStorage.setItem('token', 'tok');
        localStorage.setItem('refreshToken', 'ref');
        localStorage.setItem('username', 'jan');
        localStorage.setItem('userId', '42');
        localStorage.setItem('isAdmin', 'false');
        mockAxiosPost.mockRejectedValueOnce(new Error('fail'));

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401)).catch(() => {});

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
        expect(localStorage.getItem('userId')).toBeNull();
        expect(localStorage.getItem('isAdmin')).toBeNull();
    });

    it('przy braku refreshToken czyści wszystkie klucze z localStorage', async () => {
        localStorage.setItem('token', 'tok');
        localStorage.setItem('username', 'jan');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401)).catch(() => {});

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('username')).toBeNull();
    });

    it('wywołuje api z oryginalnym configiem po udanym refreshie', async () => {
        localStorage.setItem('refreshToken', 'ref');
        mockAxiosPost.mockResolvedValueOnce({
            data: { token: 'new-token', refreshToken: 'new-refresh' },
        });

        const mockApiCall = vi.fn().mockResolvedValue({ data: 'retried response' });
        const interceptor = buildResponseInterceptor(mockAxiosPost, mockApiCall);

        await interceptor(makeError(401, '/herbaria/123'));

        expect(mockApiCall).toHaveBeenCalledWith(
            expect.objectContaining({ url: '/herbaria/123', _retry: true })
        );
    });

    it('przepuszcza błąd 404 bez próby refresha', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(404))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('przepuszcza błąd 400 bez próby refresha', async () => {
        localStorage.setItem('refreshToken', 'refresh');

        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await expect(interceptor(makeError(400))).rejects.toBeDefined();
        expect(axios.post).not.toHaveBeenCalled();
    });

    it('przy braku refreshToken axios.post nie jest wywoływany ani razu', async () => {
        const interceptor = buildResponseInterceptor(mockAxiosPost);
        await interceptor(makeError(401)).catch(() => {});

        expect(mockAxiosPost).not.toHaveBeenCalled();
    });
});
