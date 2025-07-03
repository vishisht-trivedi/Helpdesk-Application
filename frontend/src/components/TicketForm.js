import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from './Notification';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const TicketForm = ({ onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!title.trim() || !description.trim() || !category) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (attachment) formData.append('attachment', attachment);
      await api.post('/api/tickets/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setAttachment(null);
      setMessage('Ticket submitted successfully!');
      showNotification('Ticket submitted successfully!', 'success');
      setTimeout(() => navigate('/tickets'), 1200);
      if (onTicketCreated) onTicketCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
      showNotification('Failed to submit ticket', 'danger');
    }
    setSubmitting(false);
  };

  return (
    <Card className="p-4 shadow-lg rounded-4 mx-auto" style={{ maxWidth: 500, width: '100%' }}>
      <h2 className="fw-bold text-danger mb-4 text-center">Submit a Ticket</h2>
      {message && <Alert variant="success" className="mb-2">{message}</Alert>}
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Form.Group className="mb-3" controlId="ticketTitle">
          <Form.Label>Title *</Form.Label>
          <Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} minLength={4} maxLength={100} required placeholder="Brief summary of your issue" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="ticketDescription">
          <Form.Label>Description *</Form.Label>
          <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} minLength={10} maxLength={1000} required placeholder="Describe your issue in detail" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="ticketCategory">
          <Form.Label>Category *</Form.Label>
          <Form.Select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3" controlId="ticketAttachment">
          <Form.Label>Attachment</Form.Label>
          <Form.Control type="file" onChange={e => setAttachment(e.target.files[0])} />
        </Form.Group>
        <Button type="submit" variant="success" className="w-100 fw-bold" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </Form>
    </Card>
  );
};

export default TicketForm;
