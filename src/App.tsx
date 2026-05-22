import './App.css';
import { useIdleLogout } from './hooks/useIdleLogout';
import { useTranslation, setLang, getLang } from './hooks/useTranslation';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPassword } from './pages/PasswordReset';
import { PublicHerbaria } from './pages/PublicHerbaria';
import { FriendsPage } from './pages/FriendsPage';
import { UserHerbarium } from './pages/UserHerbarium';
import { PlantDetail } from './pages/PlantDetail';
import { FriendHerbaria } from './pages/FriendHerbaria';
import { FriendHerbariumDetail } from './pages/FriendHerbariumDetail';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotificationBell } from './components/NotificationBell';
import { authApi } from './api/auth';
import { useState } from 'react';

const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

    :root {
      --moss:       #2d4a2d;
      --forest:     #3a6b35;
      --fern:       #5a8f4f;
      --sage:       #8cb98a;
      --mist:       #d6e8d4;
      --cream:      #f5f2eb;
      --bark:       #7a5c3e;
      --soil:       #3d2b1e;
      --gold:       #c8a84b;
      --dew:        #e8f4e6;
      --shadow:     rgba(45,74,45,0.15);
      --radius-sm:  6px;
      --radius-md:  12px;
      --radius-lg:  24px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--cream);
      color: var(--soil);
    }

    h1, h2, h3, h4 { font-family: 'Playfair Display', serif; }

    input, select, textarea {
      font-family: 'DM Sans', sans-serif;
      border: 1.5px solid #d0dece;
      border-radius: var(--radius-sm);
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, select:focus { border-color: var(--fern); }

    .btn-primary {
      background: var(--forest);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      padding: 10px 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }
    .btn-primary:hover { background: var(--moss); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .btn-outline {
      background: transparent;
      color: var(--forest);
      border: 1.5px solid var(--fern);
      border-radius: var(--radius-sm);
      padding: 9px 18px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }
    .btn-outline:hover { background: var(--dew); }

    .card {
      background: #fff;
      border-radius: var(--radius-md);
      box-shadow: 0 2px 12px var(--shadow);
      overflow: hidden;
      padding: 20px;
    }

    .tag {
      display: inline-block;
      background: var(--mist);
      color: var(--moss);
      border-radius: 100px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 500;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.4s ease both; }

    /* ===== RESPONSYWNOŚĆ ===== */
    .navbar-links { display: flex; gap: 4px; }
    .navbar-actions { display: flex; gap: 10px; align-items: center; }

    /* Mobile menu overlay */
    .mobile-menu {
      display: none;
      position: fixed;
      top: 60px; left: 0; right: 0; bottom: 0;
      background: rgba(245,242,235,0.98);
      z-index: 99;
      flex-direction: column;
      padding: 24px 20px;
      gap: 12px;
      overflow-y: auto;
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a, .mobile-menu button {
      width: 100%;
      text-align: left;
      font-size: 16px;
      padding: 12px 16px;
    }

    .hamburger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 5px;
      padding: 4px;
    }
    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--moss);
      border-radius: 2px;
      transition: all 0.2s;
    }

    @media (max-width: 768px) {
      .navbar-links { display: none; }
      .navbar-actions { display: none; }
      .hamburger { display: flex; }

      .hero-title { font-size: 2.2rem !important; }
      .hero-buttons { flex-direction: column; align-items: center; }
      .hero-buttons a { width: 100%; max-width: 280px; text-align: center; }

      .page-content { padding: 24px 16px !important; }
    }

    @media (max-width: 480px) {
      .hero-title { font-size: 1.8rem !important; }
    }
  `}</style>
);

const Navbar = () => {
    const navigate = useNavigate();
    const { t, lang } = useTranslation();
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const username = localStorage.getItem('username');
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            if (refreshToken) await authApi.logout(refreshToken);
        } catch {}
        localStorage.clear();
        setMobileOpen(false);
        navigate('/login');
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <>
            <nav
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    background: 'rgba(245,242,235,0.95)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #dde8db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    height: 60,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link
                        to="/"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textDecoration: 'none',
                        }}
                        onClick={closeMobile}
                    >
                        <span style={{ fontSize: 22 }}>🌿</span>
                        <span
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 20,
                                color: 'var(--moss)',
                                fontWeight: 700,
                            }}
                        >
                            eZielnik
                        </span>
                    </Link>
                    <div className="navbar-links">
                        <Link
                            to="/public"
                            className="btn-outline"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: '6px 12px',
                            }}
                        >
                            {t('herbaria')}
                        </Link>
                        {token && (
                            <Link
                                to="/friends"
                                className="btn-outline"
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '6px 12px',
                                }}
                            >
                                {t('friends')}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Desktop actions */}
                <div className="navbar-actions">
                    <div
                        style={{
                            display: 'flex',
                            background: 'var(--mist)',
                            borderRadius: 6,
                            overflow: 'hidden',
                        }}
                    >
                        {(['pl', 'en'] as const).map((l) => (
                            <button
                                key={l}
                                onClick={() => setLang(l)}
                                style={{
                                    border: 'none',
                                    padding: '5px 10px',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    background: lang === l ? 'var(--forest)' : 'transparent',
                                    color: lang === l ? 'white' : 'var(--moss)',
                                    transition: 'all 0.15s',
                                }}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {token ? (
                        <>
                            <NotificationBell />
                            <Link
                                to="/dashboard"
                                className="btn-outline"
                                style={{ border: 'none', padding: '6px 12px' }}
                            >
                                {t('myHerbarium')}
                            </Link>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="tag"
                                    style={{
                                        background: 'var(--gold)',
                                        color: 'var(--soil)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {t('admin')}
                                </Link>
                            )}
                            <span
                                style={{ fontSize: 13, color: 'var(--moss)', whiteSpace: 'nowrap' }}
                            >
                                👤 <b>{username}</b>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn-primary"
                                style={{ background: '#7a3e3e', fontSize: 12, padding: '6px 14px' }}
                            >
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="btn-outline"
                                style={{ padding: '7px 16px', fontSize: 13 }}
                            >
                                {t('loginNav')}
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary"
                                style={{ padding: '7px 16px', fontSize: 13 }}
                            >
                                {t('register')}
                            </Link>
                        </>
                    )}
                </div>

                <button
                    className="hamburger"
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-label="Menu"
                >
                    <span
                        style={{
                            transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                        }}
                    />
                    <span style={{ opacity: mobileOpen ? 0 : 1 }} />
                    <span
                        style={{
                            transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                        }}
                    />
                </button>
            </nav>

            <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {(['pl', 'en'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => {
                                setLang(l);
                            }}
                            className={lang === l ? 'btn-primary' : 'btn-outline'}
                            style={{ flex: 1, padding: '8px', fontSize: 13 }}
                        >
                            {l.toUpperCase()}
                        </button>
                    ))}
                </div>

                <Link to="/public" className="btn-outline" onClick={closeMobile}>
                    {t('herbaria')}
                </Link>

                {token ? (
                    <>
                        <Link to="/dashboard" className="btn-outline" onClick={closeMobile}>
                            {t('myHerbarium')}
                        </Link>
                        <Link to="/friends" className="btn-outline" onClick={closeMobile}>
                            {t('friends')}
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className="btn-outline" onClick={closeMobile}>
                                {t('admin')}
                            </Link>
                        )}
                        <div style={{ padding: '8px 16px', fontSize: 13, color: 'var(--moss)' }}>
                            👤 <b>{username}</b>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-primary"
                            style={{ background: '#7a3e3e' }}
                        >
                            {t('logout')}
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-outline" onClick={closeMobile}>
                            {t('loginNav')}
                        </Link>
                        <Link to="/register" className="btn-primary" onClick={closeMobile}>
                            {t('register')}
                        </Link>
                    </>
                )}
            </div>
        </>
    );
};

const LandingPage = () => {
    const { t } = useTranslation();
    return (
        <div
            style={{
                padding: '90px 24px',
                textAlign: 'center',
                background: 'linear-gradient(160deg, #eaf4e7 0%, var(--cream) 60%)',
                minHeight: '80vh',
            }}
        >
            <div className="fade-up" style={{ maxWidth: 700, margin: '0 auto' }}>
                <h1
                    className="hero-title"
                    style={{
                        fontSize: '3.5rem',
                        lineHeight: 1.15,
                        color: 'var(--moss)',
                        marginBottom: 20,
                    }}
                >
                    {t('heroTitle')}
                </h1>
                <p style={{ fontSize: 18, color: '#5a7055', marginBottom: 36 }}>
                    {t('heroSubtitle')}
                </p>
                <div
                    className="hero-buttons"
                    style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <Link
                        to="/register"
                        className="btn-primary"
                        style={{ padding: '13px 30px', fontSize: 16 }}
                    >
                        {t('startFree')}
                    </Link>
                    <Link
                        to="/public"
                        className="btn-outline"
                        style={{ padding: '13px 30px', fontSize: 16 }}
                    >
                        {t('browseHerbaria')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

const AdminPanel = () => (
    <div style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ color: 'var(--bark)' }}>Panel Administratora</h1>
        <div className="card" style={{ border: '2px solid var(--gold)', marginTop: 20 }}>
            <h3>Statystyki Systemu</h3>
        </div>
    </div>
);

const AppContent = () => {
    useIdleLogout(15 * 60 * 1000);

    return (
        <div className="page-wrapper">
            <GlobalStyle />
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/public" element={<PublicHerbaria />} />

                <Route path="/herbarium/:id" element={<UserHerbarium />} />
                <Route path="/herbarium/:herbariumId/plant/:plantId" element={<PlantDetail />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/friends" element={<FriendsPage />} />
                    <Route path="/friend/:friendId/herbaria" element={<FriendHerbaria />} />
                    <Route
                        path="/friend/:friendId/herbarium/:herbariumId"
                        element={<FriendHerbariumDetail />}
                    />
                    <Route
                        path="/friend/:friendId/herbarium/:herbariumId/plant/:plantId"
                        element={<PlantDetail />}
                    />
                </Route>

                <Route element={<ProtectedRoute adminOnly={true} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
