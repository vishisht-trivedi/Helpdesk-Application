import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Alert, Button, Form, Table, Spinner } from 'react-bootstrap';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { user: authUser } = useContext(AuthContext);

  useEffect(() => {
    api.get('/api/users/me').then(res => {
      setUser(res.data);
    });
  }, []);

  useEffect(() => {
    if (authUser && authUser.role === 'Agent') {
      api.get('/api/tickets/list?assigned=me').then(res => {
        setTickets(res.data);
        setLoading(false);
      });
    } else if (authUser && authUser.role === 'Admin') {
      api.get('/api/tickets/list').then(res => {
        setTickets(res.data);
        setLoading(false);
      });
    }
  }, [authUser]);

  if (authUser && authUser.role === 'User') {
    window.location = '/tickets';
    return null;
  }

  // Stats for agent (assigned tickets only)
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const byStatus = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const byCategory = tickets.reduce((acc, t) => {
    const cat = t.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const recent = tickets.slice(0, 8);

  const chartDataStatus = {
    labels: Object.keys(byStatus),
    datasets: [
      {
        label: 'Tickets by Status',
        data: Object.values(byStatus),
        backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#dc3545'],
      },
    ],
  };
  const chartDataCategory = {
    labels: Object.keys(byCategory),
    datasets: [
      {
        data: Object.values(byCategory),
        backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#6c757d', '#6610f2', '#fd7e14'],
      },
    ],
  };

  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col xs="auto">
          <img src="/acompworld-logo.png" alt="Acompworld Logo" width={56} height={56} className="rounded-3 bg-white p-1" />
        </Col>
        <Col>
          <h2 className="fw-bold dashboard-title mb-1">Acompworld Helpdesk Dashboard</h2>
          <div className="text-muted" style={{ fontSize: '1.1em' }}>
            Empowering Businesses with Cutting-Edge Application Development, Data Analytics, AI and Automation Solutions<br />
            Welcome, <b>{user?.name}</b> ({user?.role})
          </div>
        </Col>
      </Row>
      {loading ? (
        <Alert variant="info">Loading stats...</Alert>
      ) : (
        <>
          <Row className="g-4 mb-4">
            <Col md={4}>
              <Card className="text-center shadow-sm rounded-4 stat-card">
                <Card.Body>
                  <Card.Title>Total Assigned Tickets</Card.Title>
                  <Card.Text className="display-6 fw-bold">{total}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center shadow-sm rounded-4 stat-card">
                <Card.Body>
                  <Card.Title>Open Tickets</Card.Title>
                  <Card.Text className="display-6 fw-bold">{open}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center shadow-sm rounded-4 stat-card">
                <Card.Body>
                  <Card.Title>Resolved Tickets</Card.Title>
                  <Card.Text className="display-6 fw-bold">{resolved}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="g-4 mb-4">
            <Col md={6}>
              <Card className="shadow-sm rounded-4 p-4">
                <h5 className="mb-4 fw-semibold">Tickets by Status</h5>
                <Bar data={chartDataStatus} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm rounded-4 p-4">
                <h5 className="mb-4 fw-semibold">Tickets by Category</h5>
                <Pie data={chartDataCategory} options={{ responsive: true }} />
              </Card>
            </Col>
          </Row>
          <Card className="shadow-sm rounded-4 p-4 mb-4">
            <h5 className="mb-4 fw-semibold">Recent Activity</h5>
            <ul className="list-group list-group-flush">
              {recent.map(t => (
                <li key={t._id} className="list-group-item px-0" style={{ background: 'transparent' }}>
                  <strong>{t.title}</strong> <span className="text-muted">({t.status})</span><br />
                  <span className="text-secondary small">{new Date(t.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </Container>
  );
};

// Match AdminPanel UI for AgentDashboard
const statCardStyles = [
  { background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%)', color: '#fff' },
  { background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)', color: '#fff' },
];

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useContext(AuthContext);
  useEffect(() => {
    api.get('/api/tickets/list?assigned=me').then(res => {
      setTickets(res.data);
      setLoading(false);
    });
  }, []);

  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const byStatus = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const byCategory = tickets.reduce((acc, t) => {
    const cat = t.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const recent = tickets.slice(0, 8);
  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csvRows = [
      ['Title', 'Status', 'Category', 'Created By', 'Created At'],
      ...tickets.map(t => [
        t.title,
        t.status,
        t.category?.name || '-',
        t.createdBy?.name || '-',
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

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  return (
    <Container className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold dashboard-title agent-dashboard-title mb-1">Agent Dashboard</h2>
        </Col>
      </Row>
      <Row className="g-4 mb-5">
        {[{
          label: 'Total Assigned Tickets',
          value: total,
          style: statCardStyles[0],
        }, {
          label: 'Open Tickets',
          value: open,
          style: statCardStyles[1],
        }, {
          label: 'Resolved Tickets',
          value: resolved,
          style: statCardStyles[2],
        }, {
          label: 'Categories',
          value: Object.keys(byCategory).length,
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
      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="shadow-sm border-0 h-100" style={{ borderRadius: 20 }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4" style={{ fontSize: '1.3rem' }}>Tickets by Status</Card.Title>
              <Bar
                data={{
                  labels: Object.keys(byStatus),
                  datasets: [{
                    label: 'Tickets',
                    data: Object.values(byStatus),
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
              <Card.Title className="fw-bold mb-4" style={{ fontSize: '1.3rem' }}>Tickets by Category</Card.Title>
              <Pie
                data={{
                  labels: Object.keys(byCategory),
                  datasets: [{
                    data: Object.values(byCategory),
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
              <Card.Title className="fw-bold mb-3" style={{ fontSize: '1.2rem' }}> Recent Activity</Card.Title>
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                <ul className="list-group list-group-flush">
                  {recent.map(t => (
                    <li key={t._id} className="list-group-item px-0" style={{ background: 'transparent' }}>
                      <strong>{t.title}</strong> <span className="text-muted">({t.status})</span><br />
                      <span className="text-secondary small">{new Date(t.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Card className="shadow-sm border-0 mb-5" style={{ borderRadius: 20, marginTop: 64, width: '80vw', maxWidth: '1200px' }}>
          <Card.Body>
            <Row className="align-items-center mb-4">
              <Col><Card.Title className="fw-bold fs-5"> Assigned Tickets</Card.Title></Col>
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
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Dashboard;
export { AgentDashboard };
