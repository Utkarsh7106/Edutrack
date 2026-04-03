import React, { useState } from 'react';
import './Login.css';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleSignup = () => {
    console.log(name, email, password, role);
  };

  return (
    <div className="login-wrapper">

      <div className="login-left">
        <div className="brand">
          <div className="brand-logo">Q-spiders<span>Track</span></div>
          <div className="brand-tagline">Institution Management System</div>
        </div>

        <div className="brand-description">
          <h2>Join your institution<br /><span>on one platform.</span></h2>
          <p>Create your Q-spiders account to access attendance, results, assignments and notices — all in one place.</p>
        </div>

        <div className="features">
          <div className="feature-item"><div className="feature-dot"></div>Students track attendance and results</div>
          <div className="feature-item"><div className="feature-dot"></div>Teachers manage assignments and marks</div>
          <div className="feature-item"><div className="feature-dot"></div>Admins control fees and notices</div>
          <div className="feature-item"><div className="feature-dot"></div>Secure role-based access</div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <h3>Create account</h3>
          <p>Sign up to get started with Q-spiders</p>

          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          <button className="login-btn" onClick={handleSignup}>Create Account</button>

          <div className="login-footer">
            Already have an account? <a href="/" style={{color: '#6366f1'}}>Sign in</a>
            </div>
        </div>
      </div>

    </div>
  );
}

export default Signup;