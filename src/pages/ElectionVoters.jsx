import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ElectionSidebar from '../components/ElectionSidebar';
import './ElectionVoters.css';

const ElectionVoters = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [voters, setVoters] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const found = JSON.parse(stored).find(e => String(e.id) === String(id));
      setElection(found);
      setVoters(found && found.voters ? found.voters : []);
    }
  }, [id]);

  const handleAddVoter = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const newVoters = [...voters, { name: name.trim(), email: email.trim(), password: password.trim() }];
    setVoters(newVoters);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    updateElection({ voters: newVoters });
  };

  const handleEditVoter = idx => {
    setEditIdx(idx);
    setEditName(voters[idx].name);
    setEditEmail(voters[idx].email);
    setEditPassword(voters[idx].password);
  };

  const handleSaveVoter = idx => {
    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    const updated = voters.map((v, i) =>
      i === idx ? { name: editName, email: editEmail, password: editPassword } : v
    );
    setVoters(updated);
    setEditIdx(null);
    setError('');
    updateElection({ voters: updated });
  };

  const handleDeleteVoter = idx => {
    const updated = voters.filter((_, i) => i !== idx);
    setVoters(updated);
    setEditIdx(null);
    setError('');
    updateElection({ voters: updated });
  };

  function updateElection(fields) {
    const stored = localStorage.getItem('elections');
    if (stored) {
      const arr = JSON.parse(stored).map(e =>
        String(e.id) === String(id) ? { ...e, ...fields } : e
      );
      localStorage.setItem('elections', JSON.stringify(arr));
      setElection(arr.find(e => String(e.id) === String(id)));
    }
  }

  return (
    <div className="election-details-layout">
      <ElectionSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="election-details-main">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
          &#9776;
        </button>
        <h2 className="voters-title">Voters</h2>
        <div className="voters-panel">
          <div className="voters-form-row">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="voters-add-btn" onClick={handleAddVoter}>Add Voter</button>
          </div>
          {error && <div className="voters-error">{error}</div>}
          <table className="voters-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {voters.length === 0 && (
                <tr><td colSpan={4} style={{ color: '#888', textAlign: 'center' }}>No voters added.</td></tr>
              )}
              {voters.map((v, idx) => (
                <tr key={idx}>
                  {editIdx === idx ? (
                    <>
                      <td><input type="text" value={editName} onChange={e => setEditName(e.target.value)} /></td>
                      <td><input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></td>
                      <td><input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} /></td>
                      <td>
                        <button className="voters-add-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => handleSaveVoter(idx)}>Save</button>
                        <button className="cancel-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem', marginLeft: 6 }} onClick={() => setEditIdx(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{v.name}</td>
                      <td>{v.email}</td>
                      <td>{v.password}</td>
                      <td>
                        <button className="edit-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem' }} onClick={() => handleEditVoter(idx)}>Edit</button>
                        <button className="cancel-btn" style={{ padding: '0.3rem 1rem', fontSize: '0.95rem', marginLeft: 6 }} onClick={() => handleDeleteVoter(idx)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ElectionVoters; 