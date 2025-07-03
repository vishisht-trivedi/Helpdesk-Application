import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Card className="p-4 shadow-lg rounded-4 text-center" style={{ maxWidth: 400, width: '100%', background: 'linear-gradient(135deg, #e0eafc 0%, #f4f5fa 100%)' }}>
        <Card.Header className="bg-white rounded-4 mb-3 border-0">
          <img src="/acompworld-logo.png" alt="Acompworld Logo" width={80} height={80} className="mb-3 rounded-4 bg-white" />
          <h1 className="mb-2 fw-bold text-primary">Acompworld Helpdesk</h1>
        </Card.Header>
        <p className="text-muted mb-4" style={{ fontSize: '1.1em' }}>
          Empowering Businesses with Cutting-Edge Application Development,<br />
          Data Analytics, AI and Automation Solutions
        </p>
        <div className="d-grid gap-2 mb-2">
          <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Login</Button>
          <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>Register</Button>
        </div>
        <div className="mt-3 text-muted" style={{ fontSize: '0.95em' }}>
          &copy; {new Date().getFullYear()} Acompworld. All rights reserved.<br />
          <a href="https://www.acompworld.com" target="_blank" rel="noopener noreferrer" className="fw-semibold text-primary">www.acompworld.com</a>
        </div>
      </Card>
    </Container>
  );
};

export default Welcome; 