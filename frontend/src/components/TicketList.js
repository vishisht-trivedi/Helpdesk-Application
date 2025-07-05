import React, { useEffect, useState, forwardRef, useImperativeHandle, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Spinner, Table } from 'react-bootstrap';

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketList = forwardRef((props, ref) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="my-4">
      {tickets.length === 0 ? (
        <div className="text-center py-4 text-muted">
          No tickets submitted yet. Please submit a ticket.
          {user.role === 'User' && (
            <div className="mt-2">
              <Button variant="primary" onClick={() => navigate('/submit')}>Add Ticket</Button>
            </div>
          )}
        </div>
      ) : (
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${ticket._id}`)}>
                <td>{ticket.title}</td>
                <td>{ticket.status}</td>
                <td>{ticket.category?.name || ''}</td>
                <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={e => { e.stopPropagation(); navigate(`/tickets/${ticket._id}`); }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
});

export default TicketList;
