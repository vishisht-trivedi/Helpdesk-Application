import React, { useRef, useState, useContext, useEffect } from 'react';
import TicketList from '../components/TicketList';
import TicketForm from '../components/TicketForm';
import { AuthContext } from '../contexts/AuthContext';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate, Routes, Route } from 'react-router-dom';
import TicketDetail from '../components/TicketDetail';

const Tickets = () => {
  const ticketListRef = useRef();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState(user.role === 'Admin' ? 'all' : 'mine');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) window.location = '/login';
  }, [user]);

  const handleTicketCreated = () => {
    if (ticketListRef.current && ticketListRef.current.fetchTickets) {
      ticketListRef.current.fetchTickets();
    }
  };

  const showForm = user.role === 'User' && (window.location.pathname === '/submit');

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2 className="fw-bold">{user.role === 'User' ? 'My Tickets' : 'Tickets'}</h2>
        </Col>
        {/* For agents, no tab buttons. Only show tickets assigned to them. */}
      </Row>
      {/* Add Ticket button for User */}
      {user.role === 'User' && (
        <div className="mb-3 text-end">
          <Button variant="success" onClick={() => navigate('/submit')}>Add Ticket</Button>
        </div>
      )}
      {showForm && <TicketForm onTicketCreated={handleTicketCreated} />}
      <hr className="my-4" />
      <TicketList ref={ticketListRef} tab={tab} />
    </Container>
  );
};

export default Tickets;
