
import './App.css'
import { useIdleLogout } from './hooks/useIdleLogout';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/ProtectedRoute';

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
  `}</style>
);

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "rgba(245,242,235,0.92)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid #dde8db",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 32px", height: 60
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: 'none' }}>
                    <span style={{ fontSize: 22 }}>🌿</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: "var(--moss)", fontWeight: 700 }}>
            eZielnik
          </span>
                </Link>
                <div style={{ display: "flex", gap: 10 }}>
                    <Link to="/public" className="btn-outline" style={{ border: 'none', background: 'transparent' }}>Zielniki</Link>
                    {token && <Link to="/friends" className="btn-outline" style={{ border: 'none', background: 'transparent' }}>Znajomi</Link>}
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Języki */}
                <select style={{ border: 'none', background: 'var(--mist)', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
                    <option>PL</option>
                    <option>EN</option>
                </select>

                {token ? (
                    <>
                        <Link to="/dashboard" className="btn-outline" style={{ border: 'none' }}>Mój Zielnik</Link>
                        {isAdmin && <Link to="/admin" className="tag" style={{ background: 'var(--gold)', color: 'var(--soil)', textDecoration: 'none' }}>ADMIN</Link>}
                        <span style={{ fontSize: 13, color: 'var(--moss)' }}>Witaj, <b>{username}</b></span>
                        <button onClick={handleLogout} className="btn-primary" style={{ background: '#7a3e3e', fontSize: 12, padding: '6px 12px' }}>Wyloguj</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-outline" style={{ padding: "7px 16px", fontSize: 13 }}>Zaloguj się</Link>
                        <Link to="/register" className="btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}>Rejestracja</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const LandingPage = () => (
    <div style={{ padding: "90px 40px", textAlign: "center", background: "linear-gradient(160deg, #eaf4e7 0%, var(--cream) 60%)", minHeight: '80vh' }}>
        <div className="fade-up" style={{ maxWidth: 700, margin: "0 auto" }}>
            <span className="tag" style={{ marginBottom: 16 }}>🌱 Nowe — AI rozpoznawanie gatunków</span>
            <h1 style={{ fontSize: "3.5rem", lineHeight: 1.15, color: "var(--moss)", marginBottom: 20 }}>
                Twój wirtualny <br /> <em style={{ color: "var(--forest)" }}>zielnik w kieszeni</em>
            </h1>
            <p style={{ fontSize: 18, color: "#5a7055", marginBottom: 36 }}>
                Odkrywaj polską florę, identyfikuj rośliny aparatem i twórz niepowtarzalne kolekcje botaniczne.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Link to="/register" className="btn-primary" style={{ padding: "13px 30px", fontSize: 16 }}>Zacznij za darmo →</Link>
                <Link to="/public" className="btn-outline" style={{ padding: "13px 30px", fontSize: 16 }}>Przeglądaj zielniki</Link>
            </div>
        </div>
    </div>
);

const Dashboard = () => (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 20 }}>Mój Wirtualny Zielnik</h1>
        <div className="card">
            <p>Nie masz jeszcze żadnych roślin w swoim zielniku. Użyj aplikacji mobilnej, aby dodać pierwsze znalezisko!</p>
            <br />
            <button className="btn-primary">Dodaj roślinę ręcznie</button>
        </div>
    </div>
);

const PublicHerbaria = () => (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 10 }}>Publiczne zielniki</h1>
        <p style={{ color: '#7a9e75', marginBottom: 30 }}>Odkrywaj kolekcje botaniczne polskiej społeczności</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
                <div key={i} className="card">
                    <div style={{ height: 100, background: 'var(--mist)', borderRadius: 8, marginBottom: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🌿</div>
                    <h3>Zielnik Mazowiecki #{i}</h3>
                    <p style={{ fontSize: 13, color: '#666', margin: '10px 0' }}>Kolekcja roślin zebranych w dorzeczu Wisły.</p>
                    <button className="btn-outline" style={{ width: '100%' }}>Zobacz zbiory</button>
                </div>
            ))}
        </div>
    </div>
);

const FriendsPage = () => (
    <div style={{ padding: "40px", maxWidth: 800, margin: "0 auto" }}>
        <h1>Znajomi</h1>
        <div className="card" style={{ marginTop: 20 }}>
            <input type="text" placeholder="Szukaj znajomych..." style={{ width: '100%', marginBottom: 15 }} />
            <p style={{ color: '#888' }}>Nie masz jeszcze nikogo na liście znajomych.</p>
        </div>
    </div>
);

const PasswordReset = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ width: 400, textAlign: 'center' }}>
            <h2>Resetowanie hasła</h2>
            <p style={{ fontSize: 13, color: '#666', margin: '15px 0' }}>Wprowadź swój e-mail, aby otrzymać instrukcje.</p>
            <input type="email" placeholder="Twój e-mail" style={{ width: '100%', marginBottom: 15 }} />
            <button className="btn-primary" style={{ width: '100%' }}>Wyślij link</button>
        </div>
    </div>
);

const AdminPanel = () => (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: 'var(--bark)' }}>Panel Administratora</h1>
        <div className="card" style={{ border: '2px solid var(--gold)', marginTop: 20 }}>
            <h3>Statystyki Systemu</h3>
            <p>Użytkownicy: 1,240 | Zdjęcia: 5,670 | API Usage: 45%</p>
        </div>
    </div>
);


const AppContent = () => {
    useIdleLogout(15 * 60 * 10);

    return (
        <div className="page-wrapper">
            <GlobalStyle />
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<PasswordReset />} />
                <Route path="/public" element={<PublicHerbaria />} />

                {/* Chronione dla Użytkownika */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/friends" element={<FriendsPage />} />
                </Route>

                {/* Chronione dla Admina */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    )
}

export default App;