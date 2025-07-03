import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) window.location = '/login';
  }, [user]);

  useEffect(() => {
    api.get('/api/tickets/list?mine=true').then(res => {
      setTickets(res.data);
      setLoading(false);
    });
  }, []);

  const openTickets = tickets.filter(t => t.status === 'Open');
  const recentTickets = tickets.slice(0, 3);

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <img src="/acompworld-logo.png" alt="Acompworld Logo" width={72} height={72} className="mb-3 rounded-4 bg-white shadow-sm" />
        <h2 className="fw-bold text-primary mb-2">Welcome, {user.name}!</h2>
        <p className="text-muted mb-0">Empowering Businesses with Cutting-Edge Application Development, Data Analytics, AI and Automation Solutions</p>
      </div>
      <Row className="g-4 mb-5 justify-content-center">
        <Col xs={10} md={5} lg={4}>
          <Card className="text-center shadow-sm rounded-4">
            <Card.Body>
              <Card.Title>Open Tickets</Card.Title>
              <Card.Text className="display-6 fw-bold">{openTickets.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={10} md={5} lg={4}>
          <Card className="text-center shadow-sm rounded-4">
            <Card.Body>
              <Card.Title>Total Tickets</Card.Title>
              <Card.Text className="display-6 fw-bold">{tickets.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="mb-5">
        <h4 className="mb-3 fw-semibold">Recent Tickets</h4>
        {loading ? (
          <Alert variant="info">Loading...</Alert>
        ) : recentTickets.length === 0 ? (
          <Alert variant="info">No tickets submitted yet.</Alert>
        ) : (
          <ListGroup className="shadow-sm rounded-4">
            {recentTickets.map(ticket => (
              <ListGroup.Item key={ticket._id} className="d-flex justify-content-between align-items-center">
                <span>
                  <b>{ticket.title}</b> <span className="badge bg-primary ms-2">{ticket.status}</span>
                </span>
                <span className="text-muted small">{new Date(ticket.createdAt).toLocaleString()}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button variant="primary" size="lg" onClick={() => navigate('/tickets')}>View All Tickets</Button>
        <Button variant="success" size="lg" onClick={() => navigate('/submit')}>Submit Ticket</Button>
      </div>
    </Container>
  );
};

export default UserDashboard; 