import React, { useEffect, useState, useRef } from 'react';
import { Spinner, Alert, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import api from '../utils/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const statCardStyles = [
  { background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', color: '#fff' },
];

// Add a helper function to determine if a color is dark
function isColorDark(hex) {
  if (!hex) return false;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  // Perceived brightness formula
  return (r*0.299 + g*0.587 + b*0.114) < 160;
}

// Helper function to get contrasting text color
function getContrastingTextColor(bg) {
  if (!bg) return '#23232a';
  bg = bg.replace('#', '');
  if (bg.length === 3) bg = bg.split('').map(x => x + x).join('');
  const r = parseInt(bg.substr(0,2),16);
  const g = parseInt(bg.substr(2,2),16);
  const b = parseInt(bg.substr(4,2),16);
  return (r*0.299 + g*0.587 + b*0.114) < 160 ? '#fff' : '#23232a';
}

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAgents, setShowAgents] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const agentsRef = useRef(null);
  const categoriesRef = useRef(null);

  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const listBg = '#23232a';
  const listTextColor = getContrastingTextColor(listBg);
  const listMutedColor = listTextColor === '#fff' ? '#cbd5e1' : '#6b7280';
  const listContainerStyle = {
    background: listBg,
    color: listTextColor,
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
    border: '1px solid #33343a',
    maxHeight: 260,
    overflowY: 'auto',
    marginBottom: 32,
    padding: 24,
    transition: 'background 0.2s, color 0.2s',
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const statsRes = await api.get('/api/tickets/stats');
        const ticketsRes = await api.get('/api/tickets/list');
        setStats(statsRes.data);
        setTickets(ticketsRes.data);
        api.get('/api/users').then(res => setAgents(res.data.filter(u => u.role === 'Agent')));
        api.get('/api/categories').then(res => setCategories(res.data));
      } catch (err) {
        setError('Failed to load dashboard data: ' + (err?.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusCounts = stats?.byStatus?.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}) || {};
  const categoryCounts = tickets.reduce((acc, t) => {
    const cat = t.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const agentCounts = tickets.reduce((acc, t) => {
    if (t.assignedTo?.name) {
      acc[t.assignedTo.name] = (acc[t.assignedTo.name] || 0) + 1;
    }
    return acc;
  }, {});
  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csvRows = [
      ['Title', 'Status', 'Category', 'Created By', 'Assigned To', 'Created At'],
      ...tickets.map(t => [
        t.title,
        t.status,
        t.category?.name || '-',
        t.createdBy?.name || '-',
        t.assignedTo?.name || '-',
        new Date(t.createdAt).toLocaleString()
      ])
    ];
    const csv = csvRows.map(row => row.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tickets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // For Recent Activity card, get its background color
  const activityBg = '#f4f5fa'; // match your light mode bg, or get from CSS if dynamic
  const activityTextColor = isColorDark(activityBg) ? '#fff' : '#23232a';
  const activityMutedColor = isColorDark(activityBg) ? '#cbd5e1' : '#6b7280';

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5fa', fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', padding: '40px 20px' }}>
      <div className="container-fluid" style={{ maxWidth: 1400 }}>
        <div className="d-flex align-items-center justify-content-between mb-5">
          <h2 className="fw-bold dashboard-title mb-0">Admin Dashboard</h2>
          <div className="d-flex gap-3">
            <Button size="md" style={{ background: '#2563eb', border: 'none', borderRadius: 16, fontWeight: 500, fontSize: '1.15rem', padding: '0.5em 1.6em' }} onClick={() => setShowAgents(s => !s)}>
              All Agents
            </Button>
            <Button size="md" style={{ background: '#22a06b', border: 'none', borderRadius: 16, fontWeight: 500, fontSize: '1.15rem', padding: '0.5em 1.6em' }} onClick={() => setShowCategories(s => !s)}>
              All Categories
            </Button>
          </div>
        </div>

        {/* Agents List */}
        {showAgents && (
          <div ref={agentsRef} style={listContainerStyle}>
            <h5 className="fw-bold mb-3" style={{ color: listTextColor }}>All Agents</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {agents.map(agent => (
                <li key={agent._id} style={{ padding: '0.5em 0', borderBottom: '1px solid #33343a', color: listTextColor, fontWeight: 600 }}>
                  {agent.name} <span className="text-muted" style={{ fontSize: '0.98em', color: listMutedColor }}>({agent.email})</span>
                </li>
              ))}
              {agents.length === 0 && <li className="text-muted" style={{ color: listTextColor }}>No agents found.</li>}
            </ul>
          </div>
        )}

        {/* Categories List */}
        {showCategories && (
          <div ref={categoriesRef} style={listContainerStyle}>
            <h5 className="fw-bold mb-3" style={{ color: listTextColor }}>All Categories</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {categories.map(cat => (
                <li key={cat._id} style={{ padding: '0.5em 0', borderBottom: '1px solid #33343a', color: listTextColor, fontWeight: 600 }}>
                  {cat.name}
                </li>
              ))}
              {categories.length === 0 && <li className="text-muted" style={{ color: listTextColor }}>No categories found.</li>}
            </ul>
          </div>
        )}

        {/* STAT CARDS */}
        <Row className="g-4 mb-5">
          {[{
            label: 'Total Tickets',
            value: stats?.total ?? '-',
            style: statCardStyles[0],
          }, {
            label: 'Open Tickets',
            value: stats?.open ?? '-',
            style: statCardStyles[1],
          }, {
            label: 'Resolved Tickets',
            value: stats?.resolved ?? '-',
            style: statCardStyles[2],
          }, {
            label: 'Categories',
            value: Object.keys(categoryCounts).length,
            style: statCardStyles[3],
          }].map((stat, i) => (
            <Col key={i} xs={12} sm={6} md={3}>
              <Card
                className="shadow border-0 h-100"
                style={{ ...stat.style, color: '#fff', borderRadius: 20, cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <Card.Body className="text-center py-4 d-flex flex-column justify-content-center align-items-center">
                  <Card.Title style={{ fontSize: '1.2rem', fontWeight: 600 }}>{stat.label}</Card.Title>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stat.value}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ANALYTICS SECTION */}
        <Row className="g-4 mb-5">
          <Col md={6}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20 }}>
              <Card.Body>
                <Card.Title className="fw-bold mb-4" style={{ fontSize: '1.3rem' }}> Tickets by Status</Card.Title>
                <Bar
                  data={{
                    labels: Object.keys(statusCounts),
                    datasets: [{
                      label: 'Tickets',
                      data: Object.values(statusCounts),
                      backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d'],
                    }]
                  }}
                  options={{ responsive: true, plugins: { legend: { display: false } } }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20 }}>
              <Card.Body>
                <Card.Title className="fw-bold mb-4" style={{ fontSize: '1.3rem' }}> Tickets by Category</Card.Title>
                <Pie
                  data={{
                    labels: Object.keys(categoryCounts),
                    datasets: [{
                      data: Object.values(categoryCounts),
                      backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d', '#6610f2', '#fd7e14'],
                    }]
                  }}
                  options={{ responsive: true }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20 }}>
              <Card.Body>
                <Card.Title className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}> Tickets per Agent</Card.Title>
                <Bar
                  data={{
                    labels: Object.keys(agentCounts),
                    datasets: [{
                      label: 'Tickets',
                      data: Object.values(agentCounts),
                      backgroundColor: '#0d6efd',
                    }]
                  }}
                  options={{ responsive: true, plugins: { legend: { display: false } } }}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20 }}>
              <Card.Body>
                <Card.Title className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}> Recent Activity</Card.Title>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <ul className="list-group list-group-flush">
                    {tickets.slice(0, 8).map(t => (
                      <li key={t._id} className="list-group-item px-0" style={{ background: 'transparent' }}>
                        <strong style={{ color: activityTextColor }}>{t.title}</strong> <span className="text-muted" style={{ color: activityMutedColor }}>({t.status})</span><br />
                        <span className="text-secondary small" style={{ color: activityMutedColor }}>{new Date(t.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* TICKETS TABLE */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Card className="shadow-sm border-0 mb-5" style={{ borderRadius: 20, marginTop: 64, width: '80vw', maxWidth: '1200px' }}>
            <Card.Body>
              <Row className="align-items-center mb-4">
                <Col><Card.Title className="fw-bold fs-5"> All Tickets</Card.Title></Col>
                <Col xs="auto">
                  <Button variant="outline-primary" onClick={handleExport} style={{ borderRadius: 8 }}>Export CSV</Button>
                </Col>
                <Col xs={12} md={4} className="mt-3 mt-md-0">
                  <Form.Control
                    type="text"
                    placeholder="Search tickets..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ borderRadius: 10 }}
                  />
                </Col>
              </Row>
              <div style={{ height: '600px', overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
                <Table bordered hover className="mb-0" style={{ width: '100%' }}>
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Created By</th>
                      <th>Assigned To</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => (
                      <tr key={t._id}>
                        <td>{t.title}</td>
                        <td>{t.status}</td>
                        <td>{t.category?.name || '-'}</td>
                        <td>{t.createdBy?.name || '-'}</td>
                        <td>{t.assignedTo?.name || '-'}</td>
                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
