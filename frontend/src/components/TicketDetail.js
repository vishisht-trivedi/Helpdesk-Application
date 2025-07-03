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

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const chatEndRef = useRef(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      setError('Failed to fetch ticket details');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket]);

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

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!ticket) return null;

  return (
    <div className="my-4 d-flex justify-content-center">
      <Card className="shadow-sm w-100" style={{ maxWidth: 600 }}>
        <Card.Body>
          <Card.Title className="mb-2 text-primary fw-bold" style={{ fontSize: '1.3rem' }}>{ticket.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">Status: {ticket.status}</Card.Subtitle>
          <div className="mb-2"><strong>Description:</strong> {ticket.description}</div>
          <div className="mb-2"><strong>Category:</strong> {ticket.category?.name}</div>
          <div className="mb-2"><strong>Created By:</strong> {ticket.createdBy?.name} ({ticket.createdBy?.email})</div>
          <div className="mb-2"><strong>Assigned To:</strong> {ticket.assignedTo?.name || '-'}</div>
          <div className="mb-2"><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
          {ticket.attachment && (
            <div className="mb-2"><strong>Attachment:</strong> <a href={ticket.attachment} target="_blank" rel="noopener noreferrer">Download</a></div>
          )}
        </Card.Body>
        <Card.Header className="bg-white border-bottom-0"><strong>Comments</strong></Card.Header>
        <div style={{ maxHeight: 350, overflowY: 'auto', background: '#f9f9f9', padding: 16 }}>
          {ticket.comments && ticket.comments.length > 0 ? (
            <div>
              {ticket.comments.map((c, idx) => {
                const isMe = c.author?._id === user._id;
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
                      <div className={`p-2 rounded-3 ${isMe ? 'bg-primary text-white' : 'bg-light border'}`} style={{ wordBreak: 'break-word', borderRadius: 18 }}>
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