import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const usersList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          // Sort by creation time if available
          usersList.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA; // Descending
          });
          setUsers(usersList);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setErrorMsg(error.message);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Registered Users</h2>
      </div>

      <div className="admin-card">
        {errorMsg ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
            <strong>Error:</strong> {errorMsg}
            <br/><br/>
            <small>If this says "Permission denied", you need to update Firebase Database Rules.</small>
          </div>
        ) : loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No users found.</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined At</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="admin-avatar" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                          <i className="fas fa-user"></i>
                        </div>
                        <strong>{user.fullName || user.name || 'N/A'}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : 'Unknown'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
