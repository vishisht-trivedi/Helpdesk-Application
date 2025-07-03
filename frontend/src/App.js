import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard, { AgentDashboard } from './pages/Dashboard';
import Tickets from './pages/Tickets';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import NotAuthorized from './pages/NotAuthorized';
import { AuthContext } from './contexts/AuthContext';
import UserDashboard from './pages/UserDashboard';
import TicketForm from './components/TicketForm';
import TicketDetail from './pages/TicketDetail';
import AddCategory from './pages/AddCategory';
import AddAgent from './pages/AddAgent';
import Profile from './pages/Profile';
import './global.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorized" />;
  }
  return children;
}

function App() {
  const { user } = useContext(AuthContext);
  function getDashboardRoute(role) {
    if (role === 'Admin') return '/admin';
    if (role === 'User') return '/dashboard';
    if (role === 'Agent') return '/tickets';
    return '/login';
  }
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to={getDashboardRoute(user.role)} /> : <Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          user?.role === 'Admin' ? (
            <ProtectedRoute allowedRoles={["Admin"]}><AdminPanel /></ProtectedRoute>
          ) : user?.role === 'Agent' ? (
            <ProtectedRoute allowedRoles={["Agent"]}><AgentDashboard /></ProtectedRoute>
          ) : (
            <ProtectedRoute allowedRoles={["User"]}><UserDashboard /></ProtectedRoute>
          )
        } />
        <Route path="/tickets/*" element={<ProtectedRoute allowedRoles={["User","Admin","Agent"]}><Tickets /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={["User","Admin","Agent"]}><TicketDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/submit" element={<ProtectedRoute allowedRoles={['User']}><TicketForm /></ProtectedRoute>} />
        <Route path="/add-category" element={<ProtectedRoute allowedRoles={["Admin"]}><AddCategory /></ProtectedRoute>} />
        <Route path="/add-agent" element={<ProtectedRoute allowedRoles={["Admin"]}><AddAgent /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={["User","Admin","Agent"]}><Profile /></ProtectedRoute>} />
        <Route path="*" element={user ? <Navigate to={getDashboardRoute(user.role)} /> : <Welcome />} />
      </Routes>
    </>
  );
}

export default App; 