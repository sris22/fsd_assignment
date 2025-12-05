import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bot, LogOut, User as UserIcon } from 'lucide-react';

const Header = ({ showAuth = false }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <Bot size={24} />
                    </div>
                    <span>buddyyAI</span>
                </Link>

                <nav className="nav-links">
                    {user ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/chat">Chat</Link>
                            <div className="user-menu">
                                <span className="user-name">
                                    <UserIcon size={16} />
                                    {user.username}
                                </span>
                                <button onClick={handleLogout} className="logout-btn" aria-label="Logout">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : showAuth ? (
                        <>
                            <Link to="/login" className="btn-link">Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register" className="btn-primary">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;

