// src/pages/Support.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Support() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [formData, setFormData] = useState({ subject: '', message: '', priority: 'medium' });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState('');

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [response, setResponse] = useState('');
    const [responding, setResponding] = useState(false);

    const isAdmin = user?.role === 'admin' || user?.role === 'accountant';

    const fetchTickets = async () => {
        try {
            const endpoint = isAdmin
                ? 'http://localhost:5000/api/support'
                : 'http://localhost:5000/api/support/my-tickets';
            const res = await axios.get(endpoint);
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        try {
            await axios.post('http://localhost:5000/api/support', formData);
            setSuccess('Your ticket has been created! Our team will get back to you soon.');
            setFormData({ subject: '', message: '', priority: 'medium' });
            fetchTickets();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResponseSubmit = async (e) => {
        e.preventDefault();
        setResponding(true);
        try {
            await axios.put(`http://localhost:5000/api/support/${selectedTicket._id}`, {
                status: 'resolved',
                response: response
            });
            setSuccess('Response sent and ticket marked as resolved!');
            setResponse('');
            setSelectedTicket(null);
            fetchTickets();
        } catch (err) {
            console.error(err);
        } finally {
            setResponding(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-primary';
            case 'in-progress': return 'bg-warning';
            case 'resolved': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container-fluid py-4 px-md-5">
            <style>{`
                .support-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .support-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
                .ticket-item { transition: all 0.2s; border-left: 4px solid transparent; }
                .ticket-item:hover { background: #f8fafc; border-left-color: #2563eb; }
                .form-control:focus { box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); border-color: #2563eb; }
            `}</style>

            <header className="mb-5 animate-fade-in">
                <h5 className="text-primary fw-bold mb-1 small text-uppercase ls-1">Help Desk</h5>
                <h1 className="fw-black text-dark mb-0 display-6">Support Center</h1>
                <p className="text-muted">Need help? Submit a ticket and our administrative team will assist you.</p>
            </header>

            <div className="row g-5">
                {/* Form Section */}
                {!isAdmin && (
                    <div className="col-lg-5 animate-fade-in delay-1">
                        <div className="card support-card border-0 shadow-sm rounded-5 p-4 p-md-5">
                            <h4 className="fw-bold mb-4">New Support Request</h4>
                            {success && <div className="alert alert-success rounded-4 border-0 p-3 mb-4"><i className="bi bi-check-circle-fill me-2"></i>{success}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Subject</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg rounded-4 border-light bg-light"
                                        placeholder="Brief summary of your issue"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Priority</label>
                                    <select
                                        className="form-select form-select-lg rounded-4 border-light bg-light"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option value="low">Low - General Inquiry</option>
                                        <option value="medium">Medium - Functional Issue</option>
                                        <option value="high">High - Critical / Urgent</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Describe your Issue</label>
                                    <textarea
                                        className="form-control form-control-lg rounded-4 border-light bg-light"
                                        rows="5"
                                        placeholder="Provide as much detail as possible..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg" disabled={loading}>
                                    {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</> : 'Send Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Content Section */}
                <div className={isAdmin ? "col-12" : "col-lg-7"}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">{isAdmin ? 'Ticket Management' : 'My Tickets'}</h4>
                        <span className="badge bg-light text-dark border rounded-pill px-3 py-2">{tickets.length} Total</span>
                    </div>

                    {fetchLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary opacity-25"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="card support-card border-0 shadow-sm rounded-5 p-5 text-center">
                            <i className="bi bi-chat-dots fs-1 text-muted opacity-25 mb-3"></i>
                            <h5 className="text-muted">No active support tickets</h5>
                            <p className="text-muted small">Once {isAdmin ? 'users submit requests' : 'you submit a request'}, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="card support-card border-0 shadow-sm rounded-5 overflow-hidden">
                            <div className="list-group list-group-flush">
                                {tickets.map(ticket => (
                                    <div key={ticket._id} className="list-group-item p-4 ticket-item bg-transparent">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                {isAdmin && (
                                                    <div className="small text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
                                                        {ticket.user?.name} ({ticket.user?.role})
                                                    </div>
                                                )}
                                                <h6 className="fw-bold text-dark mb-0">{ticket.subject}</h6>
                                            </div>
                                            <span className={`badge ${getStatusColor(ticket.status)} text-uppercase small ls-1`}>{ticket.status}</span>
                                        </div>
                                        <p className="text-dark small mb-3">{ticket.message}</p>

                                        {ticket.response && (
                                            <div className="bg-light rounded-4 p-3 mb-3 border-start border-4 border-success">
                                                <div className="small fw-bold text-success text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Admin Response</div>
                                                <p className="small text-muted mb-0">{ticket.response}</p>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex gap-2">
                                                <span className={`badge ${ticket.priority === 'high' ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'} border small fw-medium`}>
                                                    Priority: {ticket.priority}
                                                </span>
                                                <span className="small text-muted">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {isAdmin && ticket.status !== 'resolved' && (
                                                <button
                                                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                                                    style={{ fontSize: '0.7rem' }}
                                                    onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setResponse(ticket.response || '');
                                                    }}
                                                >
                                                    <i className="bi bi-reply-fill me-1"></i> Respond
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Response Modal */}
            {selectedTicket && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-primary text-white rounded-top-4 p-4">
                                <h5 className="modal-title fw-bold">Respond to Ticket</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTicket(null)}></button>
                            </div>
                            <form onSubmit={handleResponseSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">User Question</label>
                                        <div className="p-3 bg-light rounded-3 small">{selectedTicket.message}</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Your Technical Response</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            required
                                            placeholder="Enter your resolution or reply..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setSelectedTicket(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={responding}>
                                        {responding ? 'Sending...' : 'Send & Resolve'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
