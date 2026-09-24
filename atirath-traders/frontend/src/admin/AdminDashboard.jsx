import React, { useEffect, useState } from 'react';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';

const AdminDashboard = () => {
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const productsRef = ref(database, 'products');
        const productsSnapshot = await get(productsRef);
        if (productsSnapshot.exists()) {
          setProductCount(Object.keys(productsSnapshot.val()).length);
        }

        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          setUserCount(Object.keys(usersSnapshot.val()).length);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Dashboard Overview</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#eef4ff', color: '#0b2c5f', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="fas fa-box"></i>
          </div>
          <div>
            <h3 style={{ color: '#6c757d', fontSize: '1rem', margin: '0 0 5px 0' }}>Total Products</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0b2c5f', margin: 0 }}>{productCount}</p>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: '#fff3e6', color: '#ff6b00', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            <i className="fas fa-users"></i>
          </div>
          <div>
            <h3 style={{ color: '#6c757d', fontSize: '1rem', margin: '0 0 5px 0' }}>Total Users</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0b2c5f', margin: 0 }}>{userCount}</p>
          </div>
        </div>
      </div>
      
      <div className="admin-card" style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#0b2c5f', marginBottom: '10px' }}>Welcome to the Admin Panel</h3>
        <p style={{ color: '#4a5568', lineHeight: '1.6' }}>
          From here you can manage all aspects of the Atirath Traders platform. Use the sidebar to navigate to the Products section to add, edit, or remove your inventory. You can also view all registered users in the Users section.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
