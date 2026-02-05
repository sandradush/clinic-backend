// React Components Examples for API Integration

// 1. Login Component
import React, { useState } from 'react';
import { authAPI, tokenUtils } from './api';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      tokenUtils.setToken(response.accessToken);
      tokenUtils.setRefreshToken(response.refreshToken);
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else if (response.user.role === 'doctor') {
        window.location.href = '/doctor-dashboard';
      } else {
        window.location.href = '/patient-dashboard';
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

// 2. Doctor Request Form
import React, { useState } from 'react';
import { doctorRequestAPI } from './api';

const DoctorRequestForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    specialty: '',
    licenseNumber: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await doctorRequestAPI.create(formData);
      setSuccess(true);
      setFormData({
        email: '',
        password: '',
        name: '',
        specialty: '',
        licenseNumber: '',
        phone: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h3>Request Submitted Successfully!</h3>
        <p>Your doctor registration request has been submitted. Please wait for admin approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Doctor Registration Request</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="Specialty"
        value={formData.specialty}
        onChange={(e) => setFormData({...formData, specialty: e.target.value})}
        required
      />
      
      <input
        type="text"
        placeholder="License Number"
        value={formData.licenseNumber}
        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
        required
      />
      
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </form>
  );
};

// 3. Admin Doctor Requests Management
import React, { useState, useEffect } from 'react';
import { doctorRequestAPI } from './api';

const AdminDoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await doctorRequestAPI.getAll();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await doctorRequestAPI.approve(id);
      loadRequests(); // Reload the list
    } catch (error) {
      alert('Failed to approve request: ' + error.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await doctorRequestAPI.reject(id, reason);
      loadRequests(); // Reload the list
    } catch (error) {
      alert('Failed to reject request: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Doctor Registration Requests</h2>
      
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>License</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{request.name}</td>
                <td>{request.email}</td>
                <td>{request.specialty}</td>
                <td>{request.license_number}</td>
                <td>{request.status}</td>
                <td>
                  {request.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(request.id)}>
                        Approve
                      </button>
                      <button onClick={() => handleReject(request.id)}>
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// 4. Patient Profile Component
import React, { useState, useEffect } from 'react';
import { patientAPI } from './api';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await patientAPI.getMyProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.updateMyProfile(formData);
      setProfile(formData);
      setEditing(false);
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Profile</h2>
      
      {!editing ? (
        <div>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>Date of Birth:</strong> {profile.date_of_birth}</p>
          <p><strong>Address:</strong> {profile.address}</p>
          
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          
          <input
            type="date"
            placeholder="Date of Birth"
            value={formData.dateOfBirth || ''}
            onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
          />
          
          <textarea
            placeholder="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
          
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export {
  LoginForm,
  DoctorRequestForm,
  AdminDoctorRequests,
  PatientProfile
};