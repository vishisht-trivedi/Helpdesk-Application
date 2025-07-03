import React, { useEffect, useState, forwardRef, useImperativeHandle, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketList = forwardRef((props, ref) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [comment, setComment] = useState({});
  const [statusUpdate, setStatusUpdate] = useState({});
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/tickets/list';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (user.role === 'Agent') params.push('assigned=me');
      if (user.role === 'User') params.push('mine=true');
      if (params.length) url += '?' + params.join('&');
      const res = await api.get(url);
      setTickets(res.data);
    } catch (err) {
      setError('Failed to fetch tickets');
    }
    setLoading(false);
  };

  useImperativeHandle(ref, () => ({ fetchTickets }));

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleStatusChange = (id, value) => {
    setStatusUpdate({ ...statusUpdate, [id]: value });
  };

  const handleCommentChange = (id, value) => {
    setComment({ ...comment, [id]: value });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/tickets/update/${id}`, {
        status: statusUpdate[id],
        comment: comment[id],
      });
      setComment({ ...comment, [id]: '' });
      fetchTickets();
    } catch (err) {
      alert('Failed to update ticket');
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="my-4">
      <Row className="g-4">
        {tickets.length === 0 ? (
          <Col xs={12} className="text-center py-4 text-muted">
            No tickets submitted yet. Please submit a ticket.
            {user.role === 'User' && (
              <div className="mt-2">
                <Button variant="primary" onClick={() => navigate('/submit')}>Add Ticket</Button>
              </div>
            )}
          </Col>
        ) : (
          tickets.map(ticket => (
            <Col xs={12} md={6} lg={4} key={ticket._id}>
              <Card
                className="shadow-sm h-100 border-0 rounded-4 hover-shadow"
                style={{ cursor: 'pointer', transition: 'box-shadow 0.2s', minHeight: 180 }}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
              >
                <Card.Body className="d-flex flex-column justify-content-between">
                  <div>
                    <Card.Title className="mb-2 text-primary fw-bold" style={{ fontSize: '1.2rem' }}>{ticket.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted" style={{ fontSize: '1rem' }}>Status: {ticket.status}</Card.Subtitle>
                    <div className="mb-1"><strong>Category:</strong> {ticket.category?.name || ''}</div>
                    <div className="mb-1"><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
});

export default TicketList;
