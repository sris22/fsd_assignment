import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Send, LogOut, Bot, User as UserIcon, ArrowLeft, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';

const Chat = () => {
    const { sessionId } = useParams();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [sessionTitle, setSessionTitle] = useState('Chat');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState('');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (sessionId) {
            fetchSession();
        } else {
            // If no sessionId, redirect to dashboard
            navigate('/dashboard');
        }
    }, [sessionId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSession = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chat/sessions/${sessionId}`, {
                headers: { 'auth-token': token }
            });
            setMessages(res.data.messages || []);
            setSessionTitle(res.data.title || 'Chat');
            setEditTitleValue(res.data.title || 'Chat');
        } catch (err) {
            console.error('Failed to fetch session', err);
            navigate('/dashboard');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !sessionId) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/chat/message', 
                { sessionId, message: currentInput },
                { headers: { 'auth-token': token } }
            );

            const botMessage = { role: 'model', content: res.data.reply };
            setMessages(prev => [...prev, botMessage]);
            
            // Update title if it changed
            if (res.data.session && res.data.session.title !== sessionTitle) {
                setSessionTitle(res.data.session.title);
                setEditTitleValue(res.data.session.title);
            }
        } catch (err) {
            console.error('Failed to send message', err);
            setMessages(prev => [...prev, { role: 'model', content: 'Error: Could not get response.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTitle = async () => {
        if (!editTitleValue.trim()) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/chat/sessions/${sessionId}`, 
                { title: editTitleValue },
                { headers: { 'auth-token': token } }
            );
            setSessionTitle(editTitleValue);
            setIsEditingTitle(false);
        } catch (err) {
            console.error('Failed to update title', err);
        }
    };

    return (
        <div className="chat-shell">
            <Header />
            <div className="chat-container">
                <div className="chat-header-bar">
                    <Link to="/dashboard" className="back-btn">
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <div className="chat-title-section">
                        {isEditingTitle ? (
                            <div className="title-edit-form">
                                <input
                                    type="text"
                                    value={editTitleValue}
                                    onChange={(e) => setEditTitleValue(e.target.value)}
                                    className="title-input"
                                    autoFocus
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateTitle();
                                        if (e.key === 'Escape') setIsEditingTitle(false);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="chat-title-wrapper">
                                <h2 className="chat-title">{sessionTitle}</h2>
                                <button 
                                    onClick={() => setIsEditingTitle(true)}
                                    className="icon-btn-small"
                                    aria-label="Edit title"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="messages">
                    {messages.length === 0 && (
                        <div className="empty-chat">
                            <Bot size={48} />
                            <h3>Start chatting</h3>
                            <p>Type a message below to begin</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`message-row ${msg.role === 'user' ? 'user' : ''}`}
                    >
                        <div
                            className="message-block"
                            style={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
                        >
                            <div className={`avatar ${msg.role === 'user' ? 'user' : ''}`}>
                                {msg.role === 'user' ? <UserIcon size={18} color="white" /> : <Bot size={18} color="white" />}
                            </div>
                            <div className={`bubble ${msg.role === 'user' ? 'user' : ''}`}>
                                {msg.content}
                            </div>
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="message-row">
                        <div className="message-block">
                            <div className="avatar">
                                <Bot size={18} color="white" />
                            </div>
                            <div className="bubble loading-bubble">
                                <span className="dot" />
                                <span className="dot" />
                                <span className="dot" />
                            </div>
                        </div>
                    </div>
                )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="composer">
                    <form onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="text-input"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()} className="btn send-btn">
                            <Send size={20} />
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
