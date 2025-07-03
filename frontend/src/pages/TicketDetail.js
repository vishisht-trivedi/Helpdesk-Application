import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { Card, Button, Form, Spinner, Alert, Image } from 'react-bootstrap';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[1][0];
}

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const chatEndRef = useRef(null);
  const [pendingStatus, setPendingStatus] = useState('');
  const [pendingAssignedTo, setPendingAssignedTo] = useState('');

  const fetchTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/tickets/${id}`);
      setTicket(res.data);
      setStatus(res.data.status);
      setAssignedTo(res.data.assignedTo?._id || '');
    } catch (err) {
      setError('Failed to fetch ticket details');
    }
    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/api/users');
      setAgents(res.data.filter(u => u.role === 'Agent'));
    } catch {}
  };

  useEffect(() => {
    fetchTicket();
    if (user.role === 'Admin') fetchAgents();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket]);

  useEffect(() => {
    setPendingStatus(status);
    setPendingAssignedTo(assignedTo);
  }, [status, assignedTo]);

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.put(`/api/tickets/update/${id}`, { comment });
      setComment('');
      await fetchTicket();
    } catch (err) {
      setError('Failed to post comment');
    }
    setPosting(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/api/tickets/update/${id}`, { status: pendingStatus, assignedTo: pendingAssignedTo });
      await fetchTicket();
    } catch (err) {
      setError('Failed to update ticket');
    }
    setLoading(false);
  };

  const agentId = user && (user._id || user.id);
  const assignedId = ticket?.assignedTo && (ticket.assignedTo._id || ticket.assignedTo.id);
  const isAgentAssigned = user.role === 'Agent' && agentId && assignedId && String(agentId) === String(assignedId);

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!ticket) return null;

  return (
    <div className="my-4 d-flex justify-content-center">
      <Card className="shadow-sm w-100" style={{ maxWidth: 600 }}>
        <Card.Body>
          <Card.Title className="mb-2 text-primary fw-bold" style={{ fontSize: '1.3rem' }}>{ticket.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Status: <span className="fw-semibold">{ticket.status}</span>
          </Card.Subtitle>
          {/* Status/Update row for admin and agent (directly below title/status) */}
          {user.role === 'Admin' && (
            <div className="mb-3 d-flex flex-row align-items-center gap-3" style={{ marginTop: 8 }}>
              <Form.Select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)} style={{ width: 180, maxWidth: 220, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Form.Select>
              <Button
                variant="success"
                onClick={handleUpdate}
                disabled={loading}
                style={{ minWidth: 110, borderRadius: 8, fontWeight: 600, fontSize: '1.05rem' }}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          )}
          {isAgentAssigned && (
            <div className="mb-3 d-flex flex-row align-items-center gap-3" style={{ marginTop: 8 }}>
              <Form.Select value={pendingStatus} onChange={e => setPendingStatus(e.target.value)} style={{ width: 180, maxWidth: 220, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Form.Select>
              <Button
                variant="success"
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    await api.put(`/api/tickets/update/${id}`, { status: pendingStatus });
                    await fetchTicket();
                  } catch (err) {
                    setError('Failed to update ticket');
                  }
                  setLoading(false);
                }}
                disabled={loading}
                style={{ minWidth: 110, borderRadius: 8, fontWeight: 600, fontSize: '1.05rem' }}
              >
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          )}
          {user.role === 'Agent' && agentId && assignedId && String(agentId) !== String(assignedId) && (
            <Alert variant="info" className="mb-3">You are not assigned to this ticket, so you cannot change its status.</Alert>
          )}
          <div className="mb-2"><strong>Assigned To:</strong> {user.role === 'Admin' ? (
            <>
              <Form.Select value={pendingAssignedTo} onChange={e => setPendingAssignedTo(e.target.value)} style={{ display: 'inline-block', width: 180, marginLeft: 8 }}>
                <option value="">Unassigned</option>
                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </Form.Select>
            </>
          ) : (ticket.assignedTo?.name || '-')}
          </div>
          <div className="mb-2"><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          {ticket.attachment && (
            <div className="mb-2"><strong>Attachment:</strong> <a href={ticket.attachment} target="_blank" rel="noopener noreferrer">Download</a></div>
          )}
        </Card.Body>
        <Card.Header className="bg-white border-bottom-0"><strong>Comments</strong></Card.Header>
        <div style={{ maxHeight: 350, overflowY: 'auto', background: 'linear-gradient(135deg, #f4f5fa 0%, #e0eafc 100%)', padding: 16, transition: 'background 0.3s' }}>
          {ticket.comments && ticket.comments.length > 0 ? (
            <div>
              {ticket.comments.map((c, idx) => {
                const isMe = c.author?._id === user._id;
                const isAdmin = c.author?.role === 'Admin';
                const isAgent = c.author?.role === 'Agent';
                return (
                  <div key={idx} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                    {!isMe && (
                      <div className="me-2">
                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontWeight: 600, fontSize: 18 }}>
                          {getInitials(c.author?.name)}
                        </div>
                      </div>
                    )}
                    <div style={{ maxWidth: '70%' }}>
                      <div className={`p-2 rounded-3 comment-bubble ${isAdmin ? 'admin-bubble' : isAgent ? 'agent-bubble' : isMe ? 'user-bubble' : ''}`}
                        style={{ wordBreak: 'break-word', borderRadius: 18 }}>
                        <div className="small fw-bold mb-1">{c.author?.name || 'Unknown'} <span className="text-muted small">({c.author?.role || 'User'})</span></div>
                        <div>{c.text}</div>
                        <div className="text-end small text-muted mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {isMe && (
                      <div className="ms-2">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, fontWeight: 600, fontSize: 18 }}>
                          {getInitials(user.name)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
          ) : (
            <div className="text-muted">No comments yet.</div>
          )}
        </div>
        <div className="p-3 border-top bg-white" style={{ position: 'sticky', bottom: 0, zIndex: 2 }}>
          <Form className="d-flex gap-2" onSubmit={e => { e.preventDefault(); handlePostComment(); }}>
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              disabled={posting}
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={posting || !comment.trim()} style={{ minWidth: 80 }}>
              {posting ? <Spinner size="sm" animation="border" /> : 'Send'}
            </Button>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default TicketDetail; 