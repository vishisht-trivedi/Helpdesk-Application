import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Navbar as BSNavbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('helpdesk-dark') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.documentElement.style.setProperty('--accent', '#2563eb');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.style.setProperty('--accent', '#2563eb');
    }
    localStorage.setItem('helpdesk-dark', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length === 1 ? parts[0][0] : parts[0][0] + parts[1][0];
  }

  return (
    <BSNavbar bg={darkMode ? 'dark' : 'light'} variant={darkMode ? 'dark' : 'light'} expand="lg" className="mb-4 sticky-top shadow-sm" style={{ zIndex: 100 }}>
      <Container fluid>
        {/* Left: Logo and Helpdesk title */}
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 me-4">
          <img src="/acompworld-logo.png" alt="logo" width={32} height={32} style={{ borderRadius: 8 }} />
          <span style={{ fontWeight: 600, fontSize: 22 }}>Helpdesk</span>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar-nav" />
        <BSNavbar.Collapse id="main-navbar-nav">
          {/* Center/Left: Navigation links */}
          <Nav className="flex-row align-items-center gap-2 me-auto">
            {user && user.role === 'Admin' && (
              <>
                <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/tickets" active={location.pathname.startsWith('/tickets')}>All Tickets</Nav.Link>
                <Nav.Link as={Link} to="/add-category" active={location.pathname === '/add-category'}>Add Category</Nav.Link>
                <Nav.Link as={Link} to="/add-agent" active={location.pathname === '/add-agent'}>Add Agent</Nav.Link>
              </>
            )}
            {user && user.role === 'User' && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/tickets" active={location.pathname.startsWith('/tickets')}>All Tickets</Nav.Link>
                <Nav.Link as={Link} to="/submit" active={location.pathname === '/submit'}>Submit Ticket</Nav.Link>
              </>
            )}
            {user && user.role === 'Agent' && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={location.pathname === '/dashboard'}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/tickets" active={location.pathname.startsWith('/tickets')}>All Tickets</Nav.Link>
              </>
            )}
          </Nav>
          {/* Right: User info, dark mode, and dropdown */}
          <div className="d-flex align-items-center gap-3 ms-auto flex-row">
            {/* Dark mode toggle */}
            <div className="dark-toggle" aria-label="Toggle dark mode">
              <input
                type="checkbox"
                id="darkSwitch"
                checked={darkMode}
                onChange={() => setDarkMode((d) => !d)}
                style={{ display: 'none' }}
              />
              <label htmlFor="darkSwitch" className="toggle-label" tabIndex={0}>
                <span className="toggle-slider">
                  {darkMode ? '🌙' : '☀️'}
                </span>
              </label>
            </div>
            {user && (
              <span className="logged-in-badge ms-2">Logged in as <b>{user.name}</b></span>
            )}
            {/* User avatar and dropdown */}
            {user && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center gap-2 px-2 py-1 border-0 shadow-none avatar-toggle"
                  style={{ borderRadius: 20, background: 'var(--accent, #2563eb)' }}
                  aria-label="User menu"
                >
                  <span className="avatar bg-primary text-white fw-bold d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 18, background: 'white', color: 'var(--accent, #2563eb)', border: '2px solid var(--accent, #2563eb)' }}>{getInitials(user.name)}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                  <Dropdown.Item disabled>Role: {user.role}</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
