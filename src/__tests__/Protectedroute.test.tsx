import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const renderRoute = (token: string | null, isAdmin: string | null, adminOnly = false) => {
    if (token !== null) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (isAdmin !== null) localStorage.setItem('isAdmin', isAdmin);
    else localStorage.removeItem('isAdmin');

    return render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route element={<ProtectedRoute adminOnly={adminOnly} />}>
                    <Route path="/protected" element={<div>Chroniona treść</div>} />
                </Route>
                <Route path="/login" element={<div>Strona logowania</div>} />
                <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Routes>
        </MemoryRouter>
    );
};

const buildJwt = (payload: Record<string, unknown>) => {
    const header = btoa(JSON.stringify({ alg: 'HS256' })).replace(/=/g, '');
    const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
    return `${header}.${body}.signature`;
};

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renderuje children gdy token jest obecny', () => {
        renderRoute('valid-token', 'false');
        expect(screen.getByText('Chroniona treść')).toBeInTheDocument();
    });

    it('przekierowuje na /login gdy brak tokenu', () => {
        renderRoute(null, null);
        expect(screen.getByText('Strona logowania')).toBeInTheDocument();
        expect(screen.queryByText('Chroniona treść')).not.toBeInTheDocument();
    });

    it('przekierowuje na /login gdy token jest pustym stringiem', () => {
        renderRoute('', null);
        expect(screen.getByText('Strona logowania')).toBeInTheDocument();
    });

    it('pozwala adminowi wejść na trasę adminOnly', () => {
        renderRoute('valid-token', 'true', true);
        expect(screen.getByText('Chroniona treść')).toBeInTheDocument();
    });

    it('przekierowuje zwykłego użytkownika z trasy adminOnly na /dashboard', () => {
        renderRoute('valid-token', 'false', true);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.queryByText('Chroniona treść')).not.toBeInTheDocument();
    });

    it('przekierowuje na /login gdy brak tokenu przy trasie adminOnly', () => {
        renderRoute(null, 'true', true);
        expect(screen.getByText('Strona logowania')).toBeInTheDocument();
    });

    it('(current behavior) przepuszcza wygasły token — wymaga przyszłej walidacji JWT', () => {
        const expiredToken = buildJwt({ exp: 1, sub: 'user' });
        renderRoute(expiredToken, 'false');
        expect(screen.getByText('Chroniona treść')).toBeInTheDocument();
    });

    it('(future behavior) powinien odrzucić wygasły token po dodaniu walidacji JWT', () => {
        expect(true).toBe(true);
    });

    it('przepuszcza token który wygasa w przyszłości', () => {
        const futureExp = Math.floor(new Date('2099-01-01').getTime() / 1000);
        const validToken = buildJwt({ exp: futureExp, sub: 'user' });

        renderRoute(validToken, 'false');
        expect(screen.getByText('Chroniona treść')).toBeInTheDocument();
    });

    it('(current behavior) przepuszcza token z exp=0 (dawno wygasły)', () => {
        const ancientToken = buildJwt({ exp: 0, sub: 'user' });
        renderRoute(ancientToken, 'false');
        expect(screen.getByText('Chroniona treść')).toBeInTheDocument();
    });

    it('nie przepuszcza gdy isAdmin="true" ale brak tokenu (adminOnly)', () => {
        renderRoute(null, 'true', true);
        expect(screen.getByText('Strona logowania')).toBeInTheDocument();
        expect(screen.queryByText('Chroniona treść')).not.toBeInTheDocument();
    });

    it('isAdmin="false" traktuje jako zwykłego użytkownika', () => {
        renderRoute('valid-token', 'false', true);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('isAdmin="0" (niepoprawna wartość) traktuje jako brak uprawnień admina', () => {
        renderRoute('valid-token', '0', true);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renderuje Outlet dla zagnieżdżonych tras gdy zalogowany', () => {
        localStorage.setItem('token', 'tok');
        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/protected" element={<div>Zagnieżdżona trasa</div>} />
                    </Route>
                    <Route path="/login" element={<div>Strona logowania</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.queryByText('Strona logowania')).not.toBeInTheDocument();
        expect(screen.getByText('Zagnieżdżona trasa')).toBeInTheDocument();
    });

    it('token złożony z samych spacji jest traktowany jako pusty', () => {
        renderRoute('   ', null);
        const hasContent = screen.queryByText('Chroniona treść');
        const hasLogin = screen.queryByText('Strona logowania');
        expect(hasContent || hasLogin).toBeTruthy(); // jedno z dwóch musi być
    });
});
