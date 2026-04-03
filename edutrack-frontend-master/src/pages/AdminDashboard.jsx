import React, { useState, useEffect } from 'react';
import '../dashboard.css';

const SECTIONS = ['Overview', 'Students', 'Teachers', 'Fees', 'Departments', 'Profile'];

function AdminDashboard() {
  const [active, setActive] = useState('Overview');
  const [data, setData] = useState({
    profile: {},
    students: [],
    teachers: [],
    fees: [],
    departments: [],
    notices: []
  });
  const [loading, setLoading] = useState(true);
  const [noticeForm, setNoticeForm] = useState({ title: '', date: '' });
  const [studentForm, setStudentForm] = useState({ name: '', roll: '', branch: '', year: '', email: '' });
  const [teacherForm, setTeacherForm] = useState({ name: '', id: '', department: '', subject: '', email: '' });

  useEffect(() => {
    // fetch('/api/admin/all').then(r => r.json()).then(d => { setData(d); setLoading(false); });
    setLoading(false); // remove when API is ready
  }, []);

  if (loading) return <div style={{ padding: 40, fontFamily: 'DM Sans' }}>Loading...</div>;

  const renderSection = () => {
    switch (active) {

      case 'Overview': return (
        <>
          <h2>Admin Overview</h2>
          <div className="cards">
            <div className="card blue">
              <div className="card-label">Total Students</div>
              <div className="card-value">{data.students.length || '--'}</div>
              <div className="card-sub">Enrolled</div>
            </div>
            <div className="card green">
              <div className="card-label">Total Teachers</div>
              <div className="card-value">{data.teachers.length || '--'}</div>
              <div className="card-sub">Active</div>
            </div>
            <div className="card orange">
              <div className="card-label">Fees Pending</div>
              <div className="card-value">{data.fees.filter(f => f.status === 'Pending').length || '--'}</div>
              <div className="card-sub">Students</div>
            </div>
            <div className="card red">
              <div className="card-label">Departments</div>
              <div className="card-value">{data.departments.length || '--'}</div>
              <div className="card-sub">Total</div>
            </div>
          </div>

          <div className="panel">
            <h3>Post Notice</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Title</label>
                <input
                  placeholder="Notice title"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={noticeForm.date}
                  onChange={e => setNoticeForm({ ...noticeForm, date: e.target.value })}
                />
              </div>
            </div>
            <button className="btn primary" onClick={() => console.log('Notice:', noticeForm)}>
              Post Notice
            </button>
          </div>

          <div className="panel">
            <h3>Recent Notices</h3>
            {data.notices.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No notices posted yet</p>
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

      case 'Students': return (
        <>
          <h2>Manage Students</h2>
          <div className="panel">
            <h3>Add Student</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input placeholder="Student name" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input placeholder="e.g. CE2021001" value={studentForm.roll} onChange={e => setStudentForm({ ...studentForm, roll: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <select value={studentForm.branch} onChange={e => setStudentForm({ ...studentForm, branch: e.target.value })}>
                  <option value="">Select branch</option>
                  <option>Computer Engineering</option>
                  <option>Information Technology</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <select value={studentForm.year} onChange={e => setStudentForm({ ...studentForm, year: e.target.value })}>
                  <option value="">Select year</option>
                  <option>FY</option>
                  <option>SY</option>
                  <option>TY</option>
                  <option>LY</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input placeholder="student@college.edu" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
              </div>
            </div>
            <button className="btn primary" onClick={() => console.log('Add Student:', studentForm)}>
              Add Student
            </button>
          </div>

          <div className="panel">
            <h3>All Students</h3>
            {data.students.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No students added yet</p>
              : <table>
                  <thead>
                    <tr><th>Roll</th><th>Name</th><th>Branch</th><th>Year</th><th>Email</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {data.students.map((s, i) => (
                      <tr key={i}>
                        <td>{s.roll}</td>
                        <td>{s.name}</td>
                        <td>{s.branch}</td>
                        <td>{s.year}</td>
                        <td>{s.email}</td>
                        <td><span className="badge red" style={{ cursor: 'pointer' }} onClick={() => console.log('Remove:', s.roll)}>Remove</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Teachers': return (
        <>
          <h2>Manage Teachers</h2>
          <div className="panel">
            <h3>Add Teacher</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input placeholder="Teacher name" value={teacherForm.name} onChange={e => setTeacherForm({ ...teacherForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Employee ID</label>
                <input placeholder="e.g. TCH2018001" value={teacherForm.id} onChange={e => setTeacherForm({ ...teacherForm, id: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select value={teacherForm.department} onChange={e => setTeacherForm({ ...teacherForm, department: e.target.value })}>
                  <option value="">Select department</option>
                  <option>Computer Engineering</option>
                  <option>Information Technology</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input placeholder="e.g. Data Structures" value={teacherForm.subject} onChange={e => setTeacherForm({ ...teacherForm, subject: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input placeholder="teacher@college.edu" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} />
              </div>
            </div>
            <button className="btn primary" onClick={() => console.log('Add Teacher:', teacherForm)}>
              Add Teacher
            </button>
          </div>

          <div className="panel">
            <h3>All Teachers</h3>
            {data.teachers.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No teachers added yet</p>
              : <table>
                  <thead>
                    <tr><th>ID</th><th>Name</th><th>Department</th><th>Subject</th><th>Email</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {data.teachers.map((t, i) => (
                      <tr key={i}>
                        <td>{t.id}</td>
                        <td>{t.name}</td>
                        <td>{t.department}</td>
                        <td>{t.subject}</td>
                        <td>{t.email}</td>
                        <td><span className="badge red" style={{ cursor: 'pointer' }} onClick={() => console.log('Remove:', t.id)}>Remove</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Fees': return (
        <>
          <h2>Fee Management</h2>
          <div className="panel">
            <h3>Fee Records</h3>
            {data.fees.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No fee records yet</p>
              : <table>
                  <thead>
                    <tr><th>Student</th><th>Roll</th><th>Term</th><th>Amount</th><th>Due Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.fees.map((f, i) => (
                      <tr key={i}>
                        <td>{f.name}</td>
                        <td>{f.roll}</td>
                        <td>{f.term}</td>
                        <td>{f.amount}</td>
                        <td>{f.due}</td>
                        <td><span className={`badge ${f.status === 'Paid' ? 'green' : 'red'}`}>{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Departments': return (
        <>
          <h2>Departments</h2>
          <div className="panel">
            <h3>Department Summary</h3>
            {data.departments.length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No department data yet</p>
              : <table>
                  <thead>
                    <tr><th>Department</th><th>Students</th><th>Teachers</th></tr>
                  </thead>
                  <tbody>
                    {data.departments.map((d, i) => (
                      <tr key={i}>
                        <td>{d.name}</td>
                        <td><span className="badge blue">{d.students}</span></td>
                        <td><span className="badge green">{d.teachers}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </>
      );

      case 'Profile': return (
        <>
          <h2>Admin Profile</h2>
          <div className="panel">
            <h3>Personal Information</h3>
            {Object.keys(data.profile).length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>Profile not loaded yet</p>
              : <div className="profile-grid">
                  <div className="profile-field"><label>Full Name</label><p>{data.profile.name}</p></div>
                  <div className="profile-field"><label>Admin ID</label><p>{data.profile.id}</p></div>
                  <div className="profile-field"><label>Role</label><p>{data.profile.role}</p></div>
                  <div className="profile-field"><label>Email</label><p>{data.profile.email}</p></div>
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
          <span className="navbar-user">{data.profile.name || 'Admin'}</span>
          <button className="navbar-logout" onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}>Logout</button>
        </div>
      </nav>
      <div className="content">{renderSection()}</div>
    </div>
  );
}

export default AdminDashboard;