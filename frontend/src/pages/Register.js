import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/users/register', { name, email, password, role: 'User' });
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Card className="p-4 shadow-lg rounded-4" style={{ maxWidth: 400, width: '100%', background: 'linear-gradient(135deg, #e0eafc 0%, #f4f5fa 100%)' }}>
        <Card.Header className="bg-white text-center rounded-4 mb-3 border-0">
          <img src="/acompworld-logo.png" alt="Acompworld Logo" width={64} height={64} className="mb-2 rounded-3 bg-white" />
          <h2 className="fw-bold text-primary mb-1">Register</h2>
        </Card.Header>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        {success && <Alert variant="success" className="mb-3">{success}</Alert>}
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="mb-3" controlId="registerName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={50} required placeholder="Enter your name" isInvalid={!!error} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="registerEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" isInvalid={!!error} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required placeholder="Enter your password" isInvalid={!!error} />
            <Form.Text className="text-muted">Password must be at least 6 characters.</Form.Text>
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 fw-bold mb-2" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Form>
        <div className="text-center mt-2">
          <span className="text-muted">Already have an account? </span>
          <Button variant="link" className="p-0 align-baseline fw-semibold text-primary" onClick={() => navigate('/login')}>Login</Button>
        </div>
      </Card>
    </Container>
  );
};

export default Register; 