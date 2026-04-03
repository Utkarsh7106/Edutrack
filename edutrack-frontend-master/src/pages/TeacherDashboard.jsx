import React, { useState, useEffect } from 'react';
import '../dashboard.css';

const SECTIONS = ['Overview', 'Attendance', 'Results', 'Assignments', 'Students', 'Calendar', 'Profile'];

const calendarEvents = { 24: 'Lecture', 25: 'Lab', 27: 'Exam', 28: 'Lecture', 31: 'Lab' };
const today = new Date().getDate();

function TeacherDashboard() {
  const [active, setActive] = useState('Overview');
  const [attendance, setAttendance] = useState({});
  const [assignmentForm, setAssignmentForm] = useState({ title: '', subject: '', due: '', description: '' });
  const [resultForm, setResultForm] = useState({ student: '', subject: '', internal: '', external: '' });
  const [data, setData] = useState({
    profile: {}, students: [], assignments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch('/api/teacher/all').then(r => r.json()).then(d => { setData(d); setLoading(false); });
    setLoading(false);
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: 'DM Sans' }}>Loading...</div>;

  const toggleAttendance = (roll, status) => {
    setAttendance(prev => ({ ...prev, [roll]: status }));
  };

  const renderSection = () => {
    switch (active) {

      case 'Overview': return (
        <>
          <h2>Welcome, {data.profile.name || 'Teacher'} 👋</h2>
          <div className="cards">
            <div className="card blue">
              <div className="card-label">Total Students</div>
              <div className="card-value">{data.students.length || '--'}</div>
              <div className="card-sub">This semester</div>
            </div>
            <div className="card green">
              <div className="card-label">Assignments Posted</div>
              <div className="card-value">{data.assignments.length || '--'}</div>
              <div className="card-sub">Active</div>
            </div>
            <div className="card orange">
              <div className="card-label">Pending Submissions</div>
              <div className="card-value">{data.assignments.reduce((acc, a) => acc + (a.total - a.submissions), 0) || '--'}</div>
              <div className="card-sub">Across all assignments</div>
            </div>
            <div className="card">
              <div className="card-label">Classes This Week</div>
              <div className="card-value">{Object.keys(calendarEvents).length}</div>
              <div className="card-sub">Scheduled</div>
            </div>
          </div>
          <div className="panel">
            <h3>Recent Assignments</h3>
            {data.assignments.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No assignments posted yet</p>
              : <table>
                  <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Submissions</th></tr></thead>
                  <tbody>{data.assignments.map((a, i) => (
                    <tr key={i}>
                      <td>{a.title}</td><td>{a.subject}</td><td>{a.due}</td>
                      <td><span className="badge blue">{a.submissions}/{a.total}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Attendance': return (
        <>
          <h2>Mark Attendance</h2>
          <div className="panel">
            <h3>Today — {new Date().toDateString()}</h3>
            {data.students.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No students loaded yet</p>
              : <>
                  <table>
                    <thead><tr><th>Roll No</th><th>Name</th><th>Year</th><th>Mark</th></tr></thead>
                    <tbody>{data.students.map((s, i) => (
                      <tr key={i}>
                        <td>{s.roll}</td><td>{s.name}</td><td>{s.year}</td>
                        <td>
                          <div className="att-toggle">
                            <button className={`att-btn ${attendance[s.roll] === 'present' ? 'present' : ''}`} onClick={() => toggleAttendance(s.roll, 'present')}>Present</button>
                            <button className={`att-btn ${attendance[s.roll] === 'absent' ? 'absent' : ''}`} onClick={() => toggleAttendance(s.roll, 'absent')}>Absent</button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                  <br />
                  <button className="btn primary" onClick={() => console.log('Attendance:', attendance)}>Submit Attendance</button>
                </>
            }
          </div>
        </>
      );

      case 'Results': return (
        <>
          <h2>Upload Results</h2>
          <div className="panel">
            <h3>Enter Marks</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student</label>
                <select value={resultForm.student} onChange={e => setResultForm({ ...resultForm, student: e.target.value })}>
                  <option value="">Select student</option>
                  {data.students.map((s, i) => <option key={i} value={s.roll}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input placeholder="e.g. Data Structures" value={resultForm.subject} onChange={e => setResultForm({ ...resultForm, subject: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Internal Marks</label>
                <input type="number" placeholder="Out of 40" value={resultForm.internal} onChange={e => setResultForm({ ...resultForm, internal: e.target.value })} />
              </div>
              <div className="form-group">
                <label>External Marks</label>
                <input type="number" placeholder="Out of 60" value={resultForm.external} onChange={e => setResultForm({ ...resultForm, external: e.target.value })} />
              </div>
            </div>
            <button className="btn primary" onClick={() => console.log('Result:', resultForm)}>Upload Result</button>
          </div>
        </>
      );

      case 'Assignments': return (
        <>
          <h2>Post Assignment</h2>
          <div className="panel">
            <h3>New Assignment</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input placeholder="Assignment title" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input placeholder="Subject name" value={assignmentForm.subject} onChange={e => setAssignmentForm({ ...assignmentForm, subject: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={assignmentForm.due} onChange={e => setAssignmentForm({ ...assignmentForm, due: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Description</label>
              <textarea rows="4" placeholder="Assignment details..." value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
            </div>
            <button className="btn primary" onClick={() => console.log('Assignment:', assignmentForm)}>Post Assignment</button>
          </div>
          <div className="panel">
            <h3>Posted Assignments</h3>
            {data.assignments.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No assignments yet</p>
              : <table>
                  <thead><tr><th>Title</th><th>Subject</th><th>Due</th><th>Submissions</th></tr></thead>
                  <tbody>{data.assignments.map((a, i) => (
                    <tr key={i}>
                      <td>{a.title}</td><td>{a.subject}</td><td>{a.due}</td>
                      <td><span className="badge blue">{a.submissions}/{a.total}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Students': return (
        <>
          <h2>Student List</h2>
          <div className="panel">
            <h3>All Students</h3>
            {data.students.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No students loaded yet</p>
              : <table>
                  <thead><tr><th>Roll No</th><th>Name</th><th>Year</th><th>Attendance</th><th>Status</th></tr></thead>
                  <tbody>{data.students.map((s, i) => (
                    <tr key={i}>
                      <td>{s.roll}</td><td>{s.name}</td><td>{s.year}</td><td>{s.attendance}</td>
                      <td><span className={`badge ${parseInt(s.attendance) >= 75 ? 'green' : 'red'}`}>{parseInt(s.attendance) >= 75 ? 'Safe' : 'Low'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Calendar': return (
        <>
          <h2>Calendar — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <div className="panel">
            <h3>This Month</h3>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div className="calendar-day-label" key={d}>{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <div key={day} className={`calendar-day ${day === today ? 'today' : ''}`}>
                  <div className="day-num">{day}</div>
                  {calendarEvents[day] && <div className="day-event">{calendarEvents[day]}</div>}
                </div>
              ))}
            </div>
          </div>
        </>
      );

      case 'Profile': return (
        <>
          <h2>My Profile</h2>
          <div className="panel">
            <h3>Teacher Information</h3>
            {Object.keys(data.profile).length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>Profile not loaded yet</p>
              : <div className="profile-grid">
                  <div className="profile-field"><label>Full Name</label><p>{data.profile.name}</p></div>
                  <div className="profile-field"><label>Employee ID</label><p>{data.profile.employeeId}</p></div>
                  <div className="profile-field"><label>Department</label><p>{data.profile.department}</p></div>
                  <div className="profile-field"><label>Subject</label><p>{data.profile.subject}</p></div>
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
          <span className="navbar-user">{data.profile.name || 'Teacher'}</span>
          <button className="navbar-logout" onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}>Logout</button>
        </div>
      </nav>
      <div className="content">{renderSection()}</div>
    </div>
  );
}

export default TeacherDashboard;