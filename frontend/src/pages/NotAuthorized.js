import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotAuthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center p-4 rounded shadow" style={{ background: '#fff', maxWidth: 400 }}>
        <h2 className="mb-3 text-danger">Not Authorized</h2>
        <p className="text-muted mb-4">You are not authorized to access this page.<br />Please login with the correct account or contact your administrator.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    </div>
  );
};

export default NotAuthorized; 