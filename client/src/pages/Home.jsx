import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';
import { ArrowRight } from 'lucide-react';

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-page">
            <Header showAuth={true} />
            
            <main className="home-content">
                <section className="hero">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Chat with AI.<br />
                            <span className="gradient-text">Keep it organized.</span>
                        </h1>
                        <p className="hero-description">
                            Create chat sessions, talk to AI, and save your conversations.
                        </p>
                        <div className="hero-actions">
                            {user ? (
                                <Link to="/dashboard" className="btn btn-large">
                                    Go to Dashboard
                                    <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-large">
                                        Get Started
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/login" className="btn btn-outline btn-large">
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;

