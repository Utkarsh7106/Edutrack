import React, { useState } from 'react';
import * as api from '../api'
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const response = await api.login(email, password);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      sessionStorage.setItem('role', response.role);

      if (response.role === 'student') navigate('/student-dashboard');
      else if (response.role === 'teacher') navigate('/teacher-dashboard');
      else if (response.role === 'admin') navigate('/admin-dashboard');
    } else {
      alert('Login failed: ' + response.message);
    }
  } catch (error) {
    alert('Error logging in: ' + error.message);
  }
};

  return (
    <div className="login-wrapper">

      <div className="login-left">
        <div className="brand">
          <div className="brand-logo">Q-spiders<span>Track</span></div>
          <div className="brand-tagline">Institution Management System</div>
        </div>

        <div className="brand-description">
          <h2>Manage your institution<br /><span>smarter, not harder.</span></h2>
          <p>Q-spiders Track replaces paper registers and WhatsApp groups with one centralised platform for students, professors, and admins.</p>
        </div>

        <div className="features">
          <div className="feature-item"><div className="feature-dot"></div>Track attendance in real time</div>
          <div className="feature-item"><div className="feature-dot"></div>Manage results and assignments</div>
          <div className="feature-item"><div className="feature-dot"></div>Admin control over fees and notices</div>
          <div className="feature-item"><div className="feature-dot"></div>Role-based access for all users</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <h3>Welcome back</h3>
          <p>Sign in to your EduTrack account</p>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="login-btn" onClick={handleLogin}>Sign In</button>

          <div className="login-footer">
            Don't have an account? <a href="/signup" style={{color: '#6366f1'}}>Sign up</a>
            </div>
        </div>
      </div>

    </div>
  );
}

export default Login;