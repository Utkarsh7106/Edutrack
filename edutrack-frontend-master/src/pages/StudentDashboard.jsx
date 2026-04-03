import React, { useState, useEffect } from 'react';
import * as api from '../api';
import '../dashboard.css';

const SECTIONS = ['Overview', 'Attendance', 'Results', 'Assignments', 'Fees', 'Profile'];

function StudentDashboard() {
  const [active, setActive] = useState('Overview');
  const [data, setData] = useState({
    profile: {}, attendance: [], results: [],
    assignments: [], fees: [], notices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashData = await api.getStudentDashboard();
        setData(dashData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: 'DM Sans' }}>Loading...</div>;

  const renderSection = () => {
    switch (active) {

      case 'Overview': return (
        <>
          <h2>Welcome back 👋</h2>
          <div className="cards">
            <div className="card green">
              <div className="card-label">Avg Attendance</div>
              <div className="card-value">{data.attendance.length ? '--' : '--'}</div>
              <div className="card-sub">Across subjects</div>
            </div>
            <div className="card blue">
              <div className="card-label">Assignments Due</div>
              <div className="card-value">{data.assignments.filter(a => a.status === 'Pending').length || '--'}</div>
              <div className="card-sub">This week</div>
            </div>
            <div className="card orange">
              <div className="card-label">Fee Due</div>
              <div className="card-value">{data.fees.filter(f => f.status === 'Pending').length ? 'Yes' : '--'}</div>
              <div className="card-sub">Check fees tab</div>
            </div>
            <div className="card">
              <div className="card-label">Notices</div>
              <div className="card-value">{data.notices.length || '--'}</div>
              <div className="card-sub">Unread</div>
            </div>
          </div>
          <div className="panel">
            <h3>Recent Notices</h3>
            {data.notices.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No notices yet</p>
              : <div className="notice-list">
                  {data.notices.slice(0, 3).map((n, i) => (
                    <div className="notice-item" key={i}>
                      <div className="notice-title">{n.title}</div>
                      <div className="notice-date">{n.date}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </>
      );

      case 'Attendance': return (
        <>
          <h2>Attendance</h2>
          <div className="panel">
            <h3>Subject-wise Attendance</h3>
            {data.attendance.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No attendance data yet</p>
              : <table>
                  <thead><tr><th>Subject</th><th>Present</th><th>Total</th><th>%</th><th>Status</th></tr></thead>
                  <tbody>{data.attendance.map((r, i) => (
                    <tr key={i}>
                      <td>{r.subject}</td><td>{r.present}</td><td>{r.total}</td><td>{r.percent}</td>
                      <td><span className={`badge ${parseInt(r.percent) >= 75 ? 'green' : 'red'}`}>{parseInt(r.percent) >= 75 ? 'Safe' : 'Low'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Results': return (
        <>
          <h2>Results</h2>
          <div className="panel">
            <h3>Subject-wise Marks</h3>
            {data.results.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No results uploaded yet</p>
              : <table>
                  <thead><tr><th>Subject</th><th>Internal</th><th>External</th><th>Total</th><th>Grade</th></tr></thead>
                  <tbody>{data.results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.subject}</td><td>{r.internal}</td><td>{r.external}</td><td>{r.total}</td>
                      <td><span className="badge blue">{r.grade}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Assignments': return (
        <>
          <h2>Assignments</h2>
          <div className="panel">
            <h3>All Assignments</h3>
            {data.assignments.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No assignments posted yet</p>
              : <table>
                  <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Status</th></tr></thead>
                  <tbody>{data.assignments.map((a, i) => (
                    <tr key={i}>
                      <td>{a.title}</td><td>{a.subject}</td><td>{a.due}</td>
                      <td><span className={`badge ${a.status === 'Submitted' ? 'green' : 'yellow'}`}>{a.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Fees': return (
        <>
          <h2>Fee Status</h2>
          <div className="panel">
            <h3>Payment History</h3>
            {data.fees.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No fee records yet</p>
              : <table>
                  <thead><tr><th>Term</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
                  <tbody>{data.fees.map((f, i) => (
                    <tr key={i}>
                      <td>{f.term}</td><td>{f.amount}</td><td>{f.due}</td>
                      <td><span className={`badge ${f.status === 'Paid' ? 'green' : 'red'}`}>{f.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Profile': return (
        <>
          <h2>My Profile</h2>
          <div className="panel">
            <h3>Personal Information</h3>
            {Object.keys(data.profile).length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>Profile not loaded yet</p>
              : <div className="profile-grid">
                  <div className="profile-field"><label>Full Name</label><p>{data.profile.name}</p></div>
                  <div className="profile-field"><label>Roll Number</label><p>{data.profile.roll}</p></div>
                  <div className="profile-field"><label>Branch</label><p>{data.profile.branch}</p></div>
                  <div className="profile-field"><label>Year</label><p>{data.profile.year}</p></div>
                  <div className="profile-field"><label>Email</label><p>{data.profile.email}</p></div>
                  <div className="profile-field"><label>Phone</label><p>{data.profile.phone}</p></div>
                </div>
            }
          </div>
        </>
      );

      default: return null;
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">Edu<span>Track</span></div>
        <div className="navbar-links">
          {SECTIONS.map(s => (
            <button key={s} className={active === s ? 'active' : ''} onClick={() => setActive(s)}>{s}</button>
          ))}
        </div>
        <div className="navbar-right">
          <span className="navbar-user">{data.profile.name || 'Student'}</span>
          <button className="navbar-logout" onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}>Logout</button>
        </div>
      </nav>
      <div className="content">{renderSection()}</div>
    </div>
  );
}

export default StudentDashboard;