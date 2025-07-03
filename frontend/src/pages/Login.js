import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'User') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Card className="p-4 shadow-lg rounded-4" style={{ maxWidth: 400, width: '100%', background: 'linear-gradient(135deg, #e0eafc 0%, #f4f5fa 100%)' }}>
        <Card.Header className="bg-white text-center rounded-4 mb-3 border-0">
          <img src="/acompworld-logo.png" alt="Acompworld Logo" width={64} height={64} className="mb-2 rounded-3 bg-white" />
          <h2 className="fw-bold text-primary mb-1">Acompworld Helpdesk</h2>
          <div className="text-muted mb-2" style={{ fontSize: '1em' }}>
            Empowering Businesses with Cutting-Edge Application Development,<br />
            Data Analytics, AI and Automation Solutions
          </div>
        </Card.Header>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus placeholder="Enter your email" isInvalid={!!error} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" autoComplete="current-password" isInvalid={!!error} />
            <Form.Text className="text-muted">Password must be at least 6 characters.</Form.Text>
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 fw-bold mb-2">Login</Button>
        </Form>
        <div className="text-center mt-2">
          <span className="text-muted">Don't have an account? </span>
          <Button variant="link" className="p-0 align-baseline fw-semibold text-primary" onClick={() => navigate('/register')}>Register</Button>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
