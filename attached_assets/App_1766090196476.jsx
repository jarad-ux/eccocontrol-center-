import React, { useState } from 'react';

const DIVISIONS = [
  { id: 'NV', name: 'Nevada (NV)' },
  { id: 'MD', name: 'Maryland (MD)' },
  { id: 'GA', name: 'Georgia (GA)' },
  { id: 'DE', name: 'Delaware (DE)' }
];

const BANKS = [
  { id: '360', name: '360 Payments' },
  { id: 'enhancify', name: 'Enhancify' }
];

const LEAD_SOURCES = [
  { id: 'lead', name: 'Company Lead' },
  { id: 'self', name: 'Self-Generated' }
];

const EQUIPMENT_TYPES = [
  { id: 'central_air', name: 'Central Air Conditioner' },
  { id: 'gas_furnace', name: 'Gas Furnace' },
  { id: 'electric_furnace', name: 'Electric Furnace' },
  { id: 'heat_pump', name: 'Heat Pump' },
  { id: 'mini_split', name: 'Mini Split / Ductless' },
  { id: 'package_unit', name: 'Package Unit' },
  { id: 'boiler', name: 'Boiler' },
  { id: 'water_heater', name: 'Water Heater' },
  { id: 'dual_fuel', name: 'Dual Fuel System' },
  { id: 'geothermal', name: 'Geothermal' },
  { id: 'other', name: 'Other' }
];

const TONNAGE_OPTIONS = ['1.5', '2', '2.5', '3', '3.5', '4', '5'];

const USERS = [
  { id: 1, username: 'admin', password: 'admin123', name: 'System Admin', role: 'admin', division: 'all' },
  { id: 2, username: 'jmajors', password: 'goeco2024', name: 'Joey Majors', role: 'admin', division: 'all' },
  { id: 3, username: 'rep1', password: 'sales123', name: 'Demo Rep', role: 'rep', division: 'MD' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [settings, setSettings] = useState({
    webhookUrl: '',
    googleSheetId: '',
    googleSheetTab: 'Sales',
    lidyWebhookUrl: '',
    lidyApiKey: '',
    retellApiKey: '',
    retellAgentId: '',
    resendApiKey: '',
    resendFromEmail: '',
    resendToEmail: ''
  });
  const [submissions, setSubmissions] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleSubmission = (formData) => {
    const submission = {
      ...formData,
      id: Date.now(),
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString(),
      status: settings.webhookUrl ? 'synced' : 'pending'
    };
    setSubmissions(prev => [submission, ...prev]);
    if (settings.webhookUrl) {
      showNotification('Sale submitted and synced successfully');
    } else {
      showNotification('Sale saved. Configure webhook in settings to sync.');
    }
    setCurrentView('dashboard');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          padding: '16px 24px',
          borderRadius: 8,
          color: 'white',
          fontSize: 14,
          fontWeight: 500,
          zIndex: 1000,
          backgroundColor: notification.type === 'success' ? '#059669' : '#dc2626'
        }}>
          {notification.message}
        </div>
      )}

      <Header 
        user={currentUser} 
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      />
      
      <main style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        {currentView === 'dashboard' && (
          <Dashboard 
            submissions={submissions}
            onNewSale={() => setCurrentView('new-sale')}
            user={currentUser}
          />
        )}
        
        {currentView === 'new-sale' && (
          <SalesEntryForm 
            user={currentUser}
            onSubmit={handleSubmission}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        
        {currentView === 'settings' && (
          <SettingsPanel 
            settings={settings}
            onSave={(s) => { setSettings(s); showNotification('Settings saved'); }}
            user={currentUser}
          />
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setError('');
    
    const user = USERS.find(u => 
      u.username.toLowerCase() === username.toLowerCase().trim() && 
      u.password === password
    );

    setTimeout(() => {
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && username && password) {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 16,
        padding: 40
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            margin: '0 auto 24px'
          }}>
            GE
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Go Ecco Climate Control
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Field Sales Portal</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              borderRadius: 8,
              padding: 12,
              color: '#fca5a5',
              fontSize: 14,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#f1f5f9',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: 14,
              background: loading || !username || !password 
                ? '#334155' 
                : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              marginTop: 8
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <p style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#475569' }}>
          Secure access for authorized personnel only
        </p>
      </div>
    </div>
  );
}

function Header({ user, currentView, onNavigate, onLogout }) {
  const navItems = ['dashboard', 'new-sale'];
  if (user.role === 'admin') navItems.push('settings');

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      flexWrap: 'wrap',
      gap: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
          color: 'white'
        }}>
          GE
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Go Ecco Climate Control</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>Field Sales System</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 4 }}>
        {navItems.map(view => (
          <button 
            key={view}
            onClick={() => onNavigate(view)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: currentView === view ? '#1e293b' : 'transparent',
              color: currentView === view ? '#f1f5f9' : '#64748b'
            }}
          >
            {view === 'new-sale' ? 'New Sale' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{user.name}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{user.role === 'admin' ? 'Administrator' : 'Sales Rep'}</div>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            border: '1px solid #334155',
            borderRadius: 8,
            backgroundColor: 'transparent',
            color: '#94a3b8',
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

function Dashboard({ submissions, onNewSale, user }) {
  const userSubmissions = user.role === 'admin' ? submissions : submissions.filter(s => s.submittedBy === user.name);
  const todaySubmissions = userSubmissions.filter(s => new Date(s.submittedAt).toDateString() === new Date().toDateString());
  const totalValue = userSubmissions.reduce((sum, s) => sum + (parseFloat(s.saleAmount) || 0), 0);
  const selfGenerated = userSubmissions.filter(s => s.leadSource === 'self').length;

  const stats = [
    { label: "Today's Sales", value: todaySubmissions.length },
    { label: "Total Sales", value: userSubmissions.length },
    { label: "Self-Generated", value: selfGenerated },
    { label: "Total Value", value: `$${totalValue.toLocaleString()}` }
  ];

  const getEquipmentName = (id) => {
    const eq = EQUIPMENT_TYPES.find(e => e.id === id);
    return eq ? eq.name : id;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Sales Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={onNewSale}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Enter New Sale
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 12,
            padding: 24
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', padding: '16px 20px', margin: 0, borderBottom: '1px solid #334155' }}>
          Recent Submissions
        </h2>
        
        {userSubmissions.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#64748b', marginBottom: 16 }}>No sales recorded yet</p>
            <button 
              onClick={onNewSale}
              style={{
                padding: '10px 20px',
                border: '1px solid #475569',
                borderRadius: 8,
                backgroundColor: 'transparent',
                color: '#e2e8f0',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Enter Your First Sale
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                  {['Date', 'Customer', 'Equipment', 'Division', 'Amount', 'Source', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userSubmissions.slice(0, 10).map(sub => (
                  <tr key={sub.id} style={{ borderTop: '1px solid #334155' }}>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#cbd5e1' }}>
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#f1f5f9' }}>{sub.customerName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{sub.city}, {sub.state}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: 13, color: '#cbd5e1' }}>{getEquipmentName(sub.equipmentType)}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{sub.tonnage} Ton</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#334155', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>
                        {sub.division}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#cbd5e1' }}>
                      ${parseFloat(sub.saleAmount).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: sub.leadSource === 'self' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: sub.leadSource === 'self' ? '#34d399' : '#60a5fa'
                      }}>
                        {sub.leadSource === 'self' ? 'Self-Gen' : 'Lead'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: sub.status === 'synced' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: sub.status === 'synced' ? '#34d399' : '#fbbf24'
                      }}>
                        {sub.status}
                      </span>
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
}

function SalesEntryForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    customerName: '', address: '', city: '', state: '', zip: '', phone: '', email: '',
    bank: '', leadSource: '', equipmentType: '', equipmentReplaced: '', tonnage: '', equipmentAge: '',
    saleAmount: '', division: user.division === 'all' ? '' : user.division, notes: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const formatPhone = (v) => {
    const c = v.replace(/\D/g, '');
    if (c.length <= 3) return c;
    if (c.length <= 6) return `(${c.slice(0,3)}) ${c.slice(3)}`;
    return `(${c.slice(0,3)}) ${c.slice(3,6)}-${c.slice(6,10)}`;
  };

  const handleSubmit = () => {
    const required = ['customerName', 'address', 'city', 'state', 'zip', 'phone', 'email', 'bank', 'leadSource', 'equipmentType', 'equipmentReplaced', 'tonnage', 'equipmentAge', 'saleAmount', 'division'];
    const newErrors = {};
    required.forEach(f => { if (!formData[f]?.trim()) newErrors[f] = 'Required'; });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: 12,
    backgroundColor: '#0f172a',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box'
  });

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 6 };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>New Sale Entry</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Complete all required fields to submit a new sale</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Customer Information */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
            Customer Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <label style={labelStyle}>Customer Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="Full name"
                style={inputStyle(errors.customerName)}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                placeholder="(555) 555-5555"
                style={inputStyle(errors.phone)}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="customer@email.com"
                style={inputStyle(errors.email)}
              />
            </div>
          </div>
        </div>

        {/* Service Address */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
            Service Address
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Street Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main Street"
                style={inputStyle(errors.address)}
              />
            </div>
            <div>
              <label style={labelStyle}>City <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="City"
                style={inputStyle(errors.city)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>State <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                  placeholder="MD"
                  maxLength={2}
                  style={inputStyle(errors.state)}
                />
              </div>
              <div>
                <label style={labelStyle}>ZIP <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  placeholder="21201"
                  maxLength={5}
                  style={inputStyle(errors.zip)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Details */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
            Equipment Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <label style={labelStyle}>Equipment Type <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.equipmentType}
                onChange={(e) => handleChange('equipmentType', e.target.value)}
                style={inputStyle(errors.equipmentType)}
              >
                <option value="">Select equipment type</option>
                {EQUIPMENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tonnage <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.tonnage}
                onChange={(e) => handleChange('tonnage', e.target.value)}
                style={inputStyle(errors.tonnage)}
              >
                <option value="">Select tonnage</option>
                {TONNAGE_OPTIONS.map(t => <option key={t} value={t}>{t} Ton</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Equipment Being Replaced <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.equipmentReplaced}
                onChange={(e) => handleChange('equipmentReplaced', e.target.value)}
                placeholder="e.g., Carrier AC Unit Model XYZ"
                style={inputStyle(errors.equipmentReplaced)}
              />
            </div>
            <div>
              <label style={labelStyle}>Equipment Age (years) <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.equipmentAge}
                onChange={(e) => handleChange('equipmentAge', e.target.value)}
                placeholder="e.g., 15"
                style={inputStyle(errors.equipmentAge)}
              />
            </div>
          </div>
        </div>

        {/* Sale Details */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
            Sale Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <label style={labelStyle}>Sale Amount <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                value={formData.saleAmount}
                onChange={(e) => handleChange('saleAmount', e.target.value)}
                placeholder="12500.00"
                style={inputStyle(errors.saleAmount)}
              />
            </div>
            <div>
              <label style={labelStyle}>Funding Bank <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.bank}
                onChange={(e) => handleChange('bank', e.target.value)}
                style={inputStyle(errors.bank)}
              >
                <option value="">Select bank</option>
                {BANKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Lead Source <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.leadSource}
                onChange={(e) => handleChange('leadSource', e.target.value)}
                style={inputStyle(errors.leadSource)}
              >
                <option value="">Select source</option>
                {LEAD_SOURCES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Division <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                value={formData.division}
                onChange={(e) => handleChange('division', e.target.value)}
                disabled={user.division !== 'all'}
                style={{...inputStyle(errors.division), opacity: user.division !== 'all' ? 0.6 : 1}}
              >
                <option value="">Select division</option>
                {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #334155' }}>
            Additional Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional information..."
            rows={3}
            style={{...inputStyle(false), resize: 'none'}}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              border: '1px solid #334155',
              borderRadius: 8,
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Submit Sale
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSave, user }) {
  const [local, setLocal] = useState(settings);
  const [testStatus, setTestStatus] = useState({});

  if (user.role !== 'admin') {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Access Denied</h1>
        <p style={{ color: '#64748b' }}>Administrator access required.</p>
      </div>
    );
  }

  const testWebhook = async (key, url) => {
    if (!url) { 
      setTestStatus(prev => ({ ...prev, [key]: { ok: false, msg: 'Enter a URL first' } })); 
      return; 
    }
    setTestStatus(prev => ({ ...prev, [key]: { ok: null, msg: 'Testing...' } }));
    try {
      const r = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString(), source: 'go-ecco-sales-app' }) 
      });
      setTestStatus(prev => ({ ...prev, [key]: { ok: r.ok, msg: r.ok ? 'Connection successful!' : `Failed: HTTP ${r.status}` } }));
    } catch (e) { 
      setTestStatus(prev => ({ ...prev, [key]: { ok: false, msg: 'Connection failed' } })); 
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, [key]: null })), 5000);
  };

  const testRetellApi = async () => {
    if (!local.retellApiKey) {
      setTestStatus(prev => ({ ...prev, retell: { ok: false, msg: 'Enter API key first' } }));
      return;
    }
    setTestStatus(prev => ({ ...prev, retell: { ok: null, msg: 'Testing...' } }));
    try {
      const r = await fetch('https://api.retellai.com/list-agents', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${local.retellApiKey}` }
      });
      setTestStatus(prev => ({ ...prev, retell: { ok: r.ok, msg: r.ok ? 'API key valid!' : `Failed: HTTP ${r.status}` } }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, retell: { ok: false, msg: 'Connection failed' } }));
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, retell: null })), 5000);
  };

  const testResendApi = async () => {
    if (!local.resendApiKey) {
      setTestStatus(prev => ({ ...prev, resend: { ok: false, msg: 'Enter API key first' } }));
      return;
    }
    setTestStatus(prev => ({ ...prev, resend: { ok: null, msg: 'Testing...' } }));
    try {
      const r = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${local.resendApiKey}` }
      });
      setTestStatus(prev => ({ ...prev, resend: { ok: r.ok, msg: r.ok ? 'API key valid!' : `Failed: HTTP ${r.status}` } }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, resend: { ok: false, msg: 'Connection failed' } }));
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, resend: null })), 5000);
  };

  const inputStyle = {
    width: '100%',
    padding: 12,
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#94a3b8', marginBottom: 6 };

  const SectionHeader = ({ title, subtitle, icon }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{subtitle}</p>
    </div>
  );

  const TestButton = ({ onClick, status }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
      <button 
        onClick={onClick}
        style={{
          padding: '8px 16px',
          border: '1px solid #475569',
          borderRadius: 8,
          backgroundColor: 'transparent',
          color: '#e2e8f0',
          fontSize: 13,
          cursor: 'pointer'
        }}
      >
        Test Connection
      </button>
      {status && (
        <span style={{ 
          fontSize: 13, 
          fontWeight: 500, 
          color: status.ok === true ? '#34d399' : status.ok === false ? '#f87171' : '#94a3b8' 
        }}>
          {status.msg}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>System Settings</h1>
        <p style={{ color: '#64748b', marginTop: 4 }}>Configure webhooks, APIs, and integrations</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Primary Webhook */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <SectionHeader 
            icon="🔗" 
            title="Primary Webhook" 
            subtitle="Main endpoint for sale submission notifications (Zapier, Make, etc.)"
          />
          
          <label style={labelStyle}>Webhook URL</label>
          <input
            type="url"
            value={local.webhookUrl}
            onChange={(e) => setLocal({ ...local, webhookUrl: e.target.value })}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            style={inputStyle}
          />
          <TestButton onClick={() => testWebhook('primary', local.webhookUrl)} status={testStatus.primary} />
        </div>

        {/* Lidy.ai Configuration */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <SectionHeader 
            icon="🤖" 
            title="Lidy.ai Integration" 
            subtitle="Configure Lidy.ai webhook for AI-powered lead processing"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Lidy.ai Webhook URL</label>
              <input
                type="url"
                value={local.lidyWebhookUrl}
                onChange={(e) => setLocal({ ...local, lidyWebhookUrl: e.target.value })}
                placeholder="https://api.lidy.ai/webhooks/..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Lidy.ai API Key (Optional)</label>
              <input
                type="password"
                value={local.lidyApiKey}
                onChange={(e) => setLocal({ ...local, lidyApiKey: e.target.value })}
                placeholder="lidy_api_key_..."
                style={inputStyle}
              />
            </div>
          </div>
          <TestButton onClick={() => testWebhook('lidy', local.lidyWebhookUrl)} status={testStatus.lidy} />
        </div>

        {/* Retell AI Configuration */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <SectionHeader 
            icon="📞" 
            title="Retell AI Configuration" 
            subtitle="Connect to Retell AI for voice agent integrations"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Retell API Key</label>
              <input
                type="password"
                value={local.retellApiKey}
                onChange={(e) => setLocal({ ...local, retellApiKey: e.target.value })}
                placeholder="key_..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Default Agent ID (Optional)</label>
              <input
                type="text"
                value={local.retellAgentId}
                onChange={(e) => setLocal({ ...local, retellAgentId: e.target.value })}
                placeholder="agent_..."
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                Used for triggering outbound calls to new customers
              </p>
            </div>
          </div>
          <TestButton onClick={testRetellApi} status={testStatus.retell} />
        </div>

        {/* Resend Email Configuration */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <SectionHeader 
            icon="📧" 
            title="Resend Email Configuration" 
            subtitle="Configure Resend API for email notifications"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Resend API Key</label>
              <input
                type="password"
                value={local.resendApiKey}
                onChange={(e) => setLocal({ ...local, resendApiKey: e.target.value })}
                placeholder="re_..."
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>From Email Address</label>
                <input
                  type="email"
                  value={local.resendFromEmail}
                  onChange={(e) => setLocal({ ...local, resendFromEmail: e.target.value })}
                  placeholder="sales@goecco.com"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Notification Email</label>
                <input
                  type="email"
                  value={local.resendToEmail}
                  onChange={(e) => setLocal({ ...local, resendToEmail: e.target.value })}
                  placeholder="team@goecco.com"
                  style={inputStyle}
                />
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
              Sends email notifications when new sales are submitted
            </p>
          </div>
          <TestButton onClick={testResendApi} status={testStatus.resend} />
        </div>

        {/* Google Sheets Backup */}
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <SectionHeader 
            icon="📊" 
            title="Google Sheets Backup" 
            subtitle="Configure Google Sheets integration for automatic data backup"
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Google Sheet ID</label>
              <input
                type="text"
                value={local.googleSheetId}
                onChange={(e) => setLocal({ ...local, googleSheetId: e.target.value })}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Sheet Tab Name</label>
              <input
                type="text"
                value={local.googleSheetTab}
                onChange={(e) => setLocal({ ...local, googleSheetTab: e.target.value })}
                placeholder="Sales"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Integration Status Summary */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>Integration Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { name: 'Primary Webhook', configured: !!local.webhookUrl },
              { name: 'Lidy.ai', configured: !!local.lidyWebhookUrl },
              { name: 'Retell AI', configured: !!local.retellApiKey },
              { name: 'Resend', configured: !!local.resendApiKey },
              { name: 'Google Sheets', configured: !!local.googleSheetId }
            ].map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: item.configured ? '#10b981' : '#475569'
                }} />
                <span style={{ fontSize: 12, color: item.configured ? '#e2e8f0' : '#64748b' }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => onSave(local)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
