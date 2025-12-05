import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Header from '../components/Header';
import Card from '../components/Card';
import ChatSessionForm from '../components/ChatSessionForm';
import { Plus, MessageSquare, Trash2, Edit2, Bot, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState({ totalSessions: 0, activeSessions: 0, totalMessages: 0 });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSession, setEditingSession] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [sessionsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/chat/sessions', {
                    headers: { 'auth-token': token }
                }),
                axios.get('http://localhost:5000/api/chat/stats', {
                    headers: { 'auth-token': token }
                })
            ]);
            setSessions(sessionsRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (title) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/chat/sessions', 
                { title: title || 'New Chat' },
                { headers: { 'auth-token': token } }
            );
            setShowCreateForm(false);
            fetchData();
            navigate(`/chat/${res.data._id}`);
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const handleEditSession = (session) => {
        setEditingSession(session);
    };

    const handleUpdateSession = async (title) => {
        if (!editingSession) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/chat/sessions/${editingSession._id}`, 
                { title },
                { headers: { 'auth-token': token } }
            );
            setEditingSession(null);
            fetchData();
        } catch (err) {
            console.error('Failed to update session', err);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to delete this chat session?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/chat/sessions/${sessionId}`, {
                headers: { 'auth-token': token }
            });
            fetchData();
        } catch (err) {
            console.error('Failed to delete session', err);
        }
    };

    const handleEditStart = (session) => {
        setEditingId(session._id);
        setEditTitle(session.title);
    };

    const handleEditSave = async (sessionId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/chat/sessions/${sessionId}`, 
                { title: editTitle },
                { headers: { 'auth-token': token } }
            );
            setEditingId(null);
            setEditTitle('');
            fetchData();
        } catch (err) {
            console.error('Failed to update session', err);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditTitle('');
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Header />
                <div className="loading-state">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <Header />
            <main className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1>Your Chats</h1>
                        <p>Manage your conversations</p>
                    </div>
                    <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                        <Plus size={20} />
                        New Chat
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                        <Card className="stat-card">
                            <div className="stat-icon">
                                <MessageSquare size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalSessions}</h3>
                                <p>Chat Sessions</p>
                            </div>
                        </Card>
                        
                        <Card className="stat-card">
                            <div className="stat-icon">
                                <Bot size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.activeSessions}</h3>
                                <p>Active</p>
                            </div>
                        </Card>
                        
                        <Card className="stat-card">
                            <div className="stat-icon">
                                <BarChart3 size={24} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalMessages}</h3>
                                <p>Messages</p>
                            </div>
                        </Card>
                </div>

                {/* Chat Sessions */}
                <div className="sessions-section">
                    <h2>Chat Sessions</h2>
                    {sessions.length === 0 ? (
                        <Card className="empty-state">
                            <MessageSquare size={48} />
                            <h3>No chats yet</h3>
                            <p>Create your first chat to get started</p>
                            <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                                <Plus size={20} />
                                New Chat
                            </button>
                        </Card>
                    ) : (
                        <div className="sessions-grid">
                            {sessions.map((session) => (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="session-card"
                                >
                                    <div 
                                        className="session-content"
                                        onClick={() => navigate(`/chat/${session._id}`)}
                                    >
                                        <div className="session-header">
                                            {editingId === session._id ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="edit-input"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h3>{session.title}</h3>
                                            )}
                                        </div>
                                        <p className="session-preview">
                                            {session.lastMessage || 'No messages yet'}
                                        </p>
                                        <div className="session-meta">
                                            <span>
                                                <MessageSquare size={14} />
                                                {session.messageCount} messages
                                            </span>
                                            <span>
                                                <Calendar size={14} />
                                                {new Date(session.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="session-actions">
                                        {editingId === session._id ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditSave(session._id);
                                                    }}
                                                    className="icon-btn success"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCancel();
                                                    }}
                                                    className="icon-btn"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditSession(session);
                                                    }}
                                                    className="icon-btn"
                                                    aria-label="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(session._id);
                                                    }}
                                                    className="icon-btn danger"
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <ChatSessionForm
                isOpen={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateSession}
                mode="create"
            />

            <ChatSessionForm
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                onSubmit={handleUpdateSession}
                initialTitle={editingSession?.title || ''}
                mode="edit"
            />
        </div>
    );
};

export default Dashboard;

