import { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatSessionForm = ({ isOpen, onClose, onSubmit, initialTitle = '', mode = 'create' }) => {
    const [title, setTitle] = useState(initialTitle);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        onSubmit(title.trim());
        setTitle('');
        setError('');
    };

    const handleClose = () => {
        setTitle(initialTitle);
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content"
            >
                <div className="modal-header">
                    <h3>{mode === 'create' ? 'New Chat' : 'Edit Chat'}</h3>
                    <button onClick={handleClose} className="icon-btn-close" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="title">Chat Title</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setError('');
                            }}
                            placeholder="What's this chat about?"
                            className="input-field"
                            autoFocus
                        />
                        {error && <span className="form-error">{error}</span>}
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={handleClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ChatSessionForm;

