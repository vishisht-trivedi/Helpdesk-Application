import React, { useState } from 'react';
import api from '../utils/api';
import { Card, Button, Form, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.post('/api/categories', { name });
      setSuccess('Category added successfully!');
      setName('');
      setTimeout(() => navigate('/admin'), 1000);
    } catch (err) {
      setError('Failed to add category');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <Card className="shadow-lg p-4" style={{ minWidth: 400, background: '#fff', borderRadius: 16 }}>
        <Card.Title className="mb-3 text-center fw-bold" style={{ fontSize: '1.5rem', letterSpacing: 1 }}>Add Category</Card.Title>
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ fontSize: '1.1rem', borderRadius: 8 }}
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 fw-bold" style={{ fontSize: '1.1rem', borderRadius: 8 }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Category'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default AddCategory; 