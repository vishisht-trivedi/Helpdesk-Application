import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNotification } from '../components/Notification';
import { Card, Form, Button, Spinner, Row, Col, Image } from 'react-bootstrap';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    api.get('/api/users/me').then(res => {
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email, avatar: res.data.avatar || '' });
      setLoading(false);
    });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setForm({ ...form, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      let avatarUrl = form.avatar;
      if (avatarFile) {
        // Upload avatar to /api/upload (implement if needed)
        const data = new FormData();
        data.append('file', avatarFile);
        const res = await api.post('/api/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        avatarUrl = res.data.url;
      }
      await api.put('/api/users/me', { name: form.name, email: form.email, avatar: avatarUrl });
      showNotification('Profile updated!', 'success');
      setEdit(false);
      setUser({ ...user, name: form.name, email: form.email, avatar: avatarUrl });
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update profile', 'danger');
    }
  };

  const handleChangePassword = async e => {
    e.preventDefault();
    if (pw.new !== pw.confirm) {
      showNotification('Passwords do not match', 'danger');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/api/users/me/password', { currentPassword: pw.current, newPassword: pw.new });
      showNotification('Password changed!', 'success');
      setPw({ current: '', new: '', confirm: '' });
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to change password', 'danger');
    }
    setPwLoading(false);
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;

  return (
    <Row className="justify-content-center py-5">
      <Col xs={12} md={8} lg={6}>
        <Card className="p-4 shadow-lg rounded-4">
          <div className="d-flex align-items-center mb-4 gap-3">
            <Image
              src={form.avatar || '/acompworld-logo.png'}
              roundedCircle
              width={72}
              height={72}
              style={{ objectFit: 'cover', border: '2px solid var(--accent, #2563eb)' }}
              alt="Avatar"
            />
            <div>
              <h3 className="fw-bold mb-1">{user.name}</h3>
              <div className="text-muted">{user.role}</div>
            </div>
          </div>
          <Form onSubmit={handleSave} autoComplete="off">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={form.name} onChange={handleChange} disabled={!edit} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" value={form.email} onChange={handleChange} disabled={!edit} required type="email" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Avatar</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} disabled={!edit} />
              {!edit && <div className="text-muted small mt-1">Click 'Edit Profile' to change your avatar.</div>}
            </Form.Group>
            {edit && (
              <div className="d-flex gap-2">
                <Button type="submit" variant="success">Save</Button>
                <Button variant="secondary" onClick={() => { setEdit(false); setForm({ name: user.name, email: user.email, avatar: user.avatar || '' }); setAvatarFile(null); }}>Cancel</Button>
              </div>
            )}
          </Form>
          {!edit && (
            <Button variant="primary" className="mt-2" onClick={() => setEdit(true)}>Edit Profile</Button>
          )}
          {/* Only show change password for non-admins */}
          {user.role !== 'Admin' && <>
          <hr className="my-4" />
          <h5 className="fw-semibold mb-3">Change Password</h5>
          <Form onSubmit={handleChangePassword} autoComplete="off">
            <Form.Group className="mb-2">
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} required autoComplete="current-password" />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={pw.new} onChange={e => setPw({ ...pw, new: e.target.value })} required autoComplete="new-password" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} required autoComplete="new-password" />
            </Form.Group>
            <Button type="submit" variant="warning" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</Button>
          </Form>
          </>}
        </Card>
      </Col>
    </Row>
  );
};

export default Profile; 