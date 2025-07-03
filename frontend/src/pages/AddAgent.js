import React, { useState } from 'react';
import api from '../utils/api';
import { Card, Button, Form, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddAgent = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/api/users/register', { ...form, role: 'Agent' });
      setSuccess('Agent added successfully!');
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/admin'), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add agent');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Card className="shadow-lg p-4" style={{ minWidth: 400, background: '#fff', borderRadius: 16 }}>
        <Card.Title className="mb-3 text-center fw-bold" style={{ fontSize: '1.5rem', letterSpacing: 1 }}>Add Agent</Card.Title>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter agent name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ fontSize: '1.1rem', borderRadius: 8 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter agent email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ fontSize: '1.1rem', borderRadius: 8 }}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{ fontSize: '1.1rem', borderRadius: 8 }}
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 fw-bold" style={{ fontSize: '1.1rem', borderRadius: 8 }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Agent'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AddAgent; 