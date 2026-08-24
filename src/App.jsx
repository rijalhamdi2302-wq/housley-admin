/**
 * Housley HQ — Admin Dashboard v2
 * Professional admin panel with dark mode, animations, and advanced features.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './api';
import './App.css';

/* ─── tiny helpers ────────────────────────────────────────────────────────── */
function fmt(n) { return typeof n === 'number' ? n.toLocaleString() : n; }
function fmtRM(n) { return `RM ${fmt(n)}`; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' }); }
function fmtDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-MY', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function tierBadge(t) {
  const colors = { none: '#6c757d', monthly: '#4e9de6', yearly: '#7c5cd6', lifetime: '#f7b32b' };
  return <span className="badge" style={{ background: colors[t] || '#6c757d' }}>{t || 'none'}</span>;
}
function statusBadge(s) {
  const colors = { paid: '#34c759', pending: '#ff9500', failed: '#ff3b30', expired: '#6c757d' };
  return <span className="badge" style={{ background: colors[s] || '#6c757d' }}>{s}</span>;
}
function roleBadge(r) {
  const colors = { provider: '#ff6f91', grocery_spender: '#4e9de6', member: '#34c759', dependent: '#f7b32b' };
  return <span className="badge" style={{ background: colors[r] || '#6c757d' }}>{r}</span>;
}

/* ─── Animated Counter ────────────────────────────────────────────────────── */
function AnimatedNumber({ value, prefix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
    const duration = 600;
    const steps = 20;
    const step = num / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= num) || (step < 0 && current <= num)) {
        setDisplay(num);
        clearInterval(interval);
      } else {
        setDisplay(Math.round(current * 100) / 100);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);
  return <>{prefix}{fmt(display)}</>;
}

/* ─── Toast ───────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type || 'info'}`}>{msg}</div>;
}

/* ─── Login Page ──────────────────────────────────────────────────────────── */
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('admin_token', data.token);
      onLogin(data.admin);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo"><img src="/icon.png" alt="Housley" width="64" height="64" style={{ borderRadius: 16, objectFit: 'cover' }} /></div>
        <h1>Housley HQ</h1>
        <p className="login-subtitle">Admin Dashboard</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@housley.app" autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 24px' }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'families', icon: '👨‍👩‍👧‍👦', label: 'Families' },
  { id: 'users', icon: '👤', label: 'Users' },
  { id: 'orders', icon: '💳', label: 'Payments' },
  { id: 'activity', icon: '📋', label: 'Activity' },
  { id: 'promos', icon: '🏷️', label: 'Promos' },
  { id: 'reports', icon: '📈', label: 'Reports' },
  { id: 'announcements', icon: '📣', label: 'Announcements' },
  { id: 'releases', icon: '📦', label: 'App Releases' },
  { id: 'system', icon: '⚙️', label: 'System' },
];

function Sidebar({ active, onSelect, admin, onLogout, darkMode, setDarkMode }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/icon.png" alt="Housley" width="32" height="32" style={{ borderRadius: 8, objectFit: 'cover' }} />
        <span className="brand-text">Housley HQ</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        <div className={`theme-toggle-track ${darkMode ? 'dark' : ''}`}>
          <div className="theme-toggle-thumb" />
        </div>
        <span className="theme-toggle-label">{darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</span>
      </div>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">{admin?.name?.[0] || 'A'}</div>
          <div>
            <div className="admin-name">{admin?.name}</div>
            <div className="admin-role">{admin?.role}</div>
          </div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>Sign Out</button>
      </div>
    </aside>
  );
}

/* ─── Dashboard Page ──────────────────────────────────────────────────────── */
function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;
  if (!data) return <div className="page-error">Failed to load dashboard.</div>;

  const statCards = [
    { icon: '👨‍👩‍👧‍👦', label: 'Total Families', value: data.totalFamilies, color: '#ff6f91' },
    { icon: '👤', label: 'Total Users', value: data.totalUsers, color: '#4e9de6' },
    { icon: '⭐', label: 'Pro Families', value: data.proFamilies, color: '#f7b32b' },
    { icon: '💰', label: 'Revenue', value: data.revenue?.totalRM, color: '#34c759', prefix: 'RM ' },
    { icon: '💳', label: 'Paid Orders', value: data.revenue?.orderCount, color: '#7c5cd6' },
    { icon: '📈', label: 'Active Orders', value: data.activeOrders, color: '#ff9500' },
    { icon: '💸', label: 'Total Expenses', value: data.totalExpenses, color: '#ff3b30' },
    { icon: '📥', label: 'Total Fundings', value: data.totalFunding, color: '#00bcd4' },
  ];

  const tierData = [
    { name: 'Free', value: data.freeFamilies || 0, fill: '#6c757d' },
    { name: 'Monthly', value: (data.tierBreakdown?.monthly || 0), fill: '#4e9de6' },
    { name: 'Yearly', value: (data.tierBreakdown?.yearly || 0), fill: '#7c5cd6' },
    { name: 'Lifetime', value: (data.tierBreakdown?.lifetime || 0), fill: '#f7b32b' },
  ];

  return (
    <div className="page">
      <h2>Dashboard Overview</h2>

      <div className="quick-actions">
        <div className="quick-action" onClick={() => document.querySelector('[data-nav="families"]')?.click()}>
          <span className="quick-action-icon">👨‍👩‍👧‍👦</span>
          <div><div className="quick-action-label">Manage Families</div><div className="quick-action-sub">View & edit all families</div></div>
        </div>
        <div className="quick-action" onClick={() => document.querySelector('[data-nav="users"]')?.click()}>
          <span className="quick-action-icon">👤</span>
          <div><div className="quick-action-label">Manage Users</div><div className="quick-action-sub">View & edit all users</div></div>
        </div>
        <div className="quick-action" onClick={() => document.querySelector('[data-nav="orders"]')?.click()}>
          <span className="quick-action-icon">💳</span>
          <div><div className="quick-action-label">View Payments</div><div className="quick-action-sub">Orders & revenue</div></div>
        </div>
        <div className="quick-action" onClick={() => document.querySelector('[data-nav="reports"]')?.click()}>
          <span className="quick-action-icon">📈</span>
          <div><div className="quick-action-label">Reports</div><div className="quick-action-sub">Analytics & trends</div></div>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card animate-in" style={{ borderLeftColor: s.color, animationDelay: `${i * 60}ms` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <div className="stat-value">
                <AnimatedNumber value={s.value} prefix={s.prefix || ''} />
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card animate-in-delay-1">
          <h3>Pro Tier Distribution</h3>
          <div className="tier-bars">
            {tierData.map((t, i) => (
              <div key={i} className="tier-bar-row">
                <span className="tier-name">{t.name}</span>
                <div className="tier-bar-bg">
                  <div className="tier-bar-fill" style={{
                    width: `${data.totalFamilies ? (t.value / data.totalFamilies * 100) : 0}%`,
                    background: t.fill
                  }} />
                </div>
                <span className="tier-count">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card animate-in-delay-2">
          <h3>Daily Sign-ups (30 days)</h3>
          <MiniChart data={data.dailyFamilies} color="#ff6f91" label="families" />
          <MiniChart data={data.dailyUsers} color="#4e9de6" label="users" />
        </div>
      </div>

      <div className="grid-2">
        <div className="card animate-in-delay-2">
          <h3>Recent Pro Payments</h3>
          <table className="table">
            <thead><tr><th>Family</th><th>Plan</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {(data.recentOrders || []).map((o, i) => (
                <tr key={i}>
                  <td>{o.familyId?.name || '—'}</td>
                  <td>{tierBadge(o.plan)}</td>
                  <td>{fmtRM((o.amountSen / 100).toFixed(2))}</td>
                  <td>{fmtDate(o.paidAt)}</td>
                </tr>
              ))}
              {(!data.recentOrders || data.recentOrders.length === 0) && <tr><td colSpan={4} className="empty">No payments yet</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card animate-in-delay-3">
          <h3>Latest Families</h3>
          <table className="table">
            <thead><tr><th>Name</th><th>Pro</th><th>Created</th></tr></thead>
            <tbody>
              {(data.recentFamilies || []).map((f, i) => (
                <tr key={i}>
                  <td><strong>{f.name}</strong></td>
                  <td>{tierBadge(f.proTier)}</td>
                  <td>{fmtDate(f.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini bar chart ──────────────────────────────────────────────────────── */
function MiniChart({ data, color, label }) {
  if (!data || data.length === 0) return <div className="empty">No data yet</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="mini-chart">
      <div className="mini-chart-bars">
        {data.map((d, i) => (
          <div key={i} className="mini-bar-wrap" title={`${d._id}: ${d.count} ${label}`}>
            <div className="mini-bar" style={{ height: `${(d.count / max) * 100}%`, background: color }} />
          </div>
        ))}
      </div>
      <div className="mini-chart-labels">
        <span>{data[0]?._id?.slice(5)}</span>
        <span>{data[data.length - 1]?._id?.slice(5)}</span>
      </div>
    </div>
  );
}

/* ─── Users Page ──────────────────────────────────────────────────────────── */
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { const data = await api.users({ search, page, limit: 30 }); setUsers(data.users); setTotal(data.total); } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, page]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const viewUser = async (id) => { try { const data = await api.user(id); setUserDetail(data); setSelectedUser(id); } catch (e) { console.error(e); } };
  const editUser = async (id, changes) => { try { await api.updateUser(id, changes); loadUsers(); if (selectedUser === id) viewUser(id); } catch (e) { alert(e.message); } };
  const deleteUser = async (id, name) => { if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return; try { await api.deleteUser(id); setSelectedUser(null); loadUsers(); } catch (e) { alert(e.message); } };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Users ({total})</h2>
        <input className="search-input" placeholder="Search name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {selectedUser && userDetail ? (
        <UserDetail user={userDetail.user} stats={userDetail.stats} onClose={() => setSelectedUser(null)} onEdit={editUser} onDelete={deleteUser} />
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Family</th><th>Pro</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} className="clickable" onClick={() => viewUser(u._id)} style={{ animationDelay: `${i * 30}ms` }}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email || '—'}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>{u.familyName}</td>
                    <td>{tierBadge(u.proTier)}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td><button className="btn btn-sm btn-ghost">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <span>Page {page} of {Math.ceil(total / 30) || 1}</span>
            <button className="btn btn-sm" disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── User Detail ─────────────────────────────────────────────────────────── */
function UserDetail({ user, stats, onClose, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState(user.role);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) return alert('Password must be at least 6 characters.');
    setResetting(true);
    try {
      await api.resetUserPassword(user._id, newPassword);
      alert(`Password updated for "${user.name}"!`);
      setShowPasswordReset(false); setNewPassword('');
    } catch (e) { alert(e.message); } finally { setResetting(false); }
  };

  if (!user) return null;

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onClose}>← Back to list</button>
        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => { onEdit(user._id, { name, email, role }); setEditing(false); }}>Save</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(user._id, user.name)}>Delete</button>
            </>
          )}
        </div>
      </div>
      <div className="detail-grid">
        <div className="card">
          <h3>Profile</h3>
          {editing ? (
            <div className="form-stack">
              <div className="field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="field"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="field">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="provider">Provider</option>
                  <option value="grocery_spender">Grocery Spender</option>
                  <option value="member">Member</option>
                  <option value="dependent">Dependent</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div><span className="info-label">Name:</span> {user.name}</div>
              <div><span className="info-label">Email:</span> {user.email || '—'}</div>
              <div><span className="info-label">Role:</span> {roleBadge(user.role)}</div>
              <div><span className="info-label">Family:</span> {user.familyName}</div>
              <div><span className="info-label">Pro:</span> {tierBadge(user.proTier)}</div>
              <div><span className="info-label">PIN:</span> {user.pinHash === '(set)' ? '✅ Set' : '❌ Not set'}</div>
              <div><span className="info-label">Biometric:</span> {user.biometricEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
              <div><span className="info-label">Joined:</span> {fmtDateTime(user.createdAt)}</div>
            </div>
          )}
        </div>
        <div className="card">
          <h3>Activity Stats</h3>
          <div className="stats-grid compact">
            <div className="stat-mini"><div className="stat-mini-val">{stats?.expenseCount || 0}</div><div className="stat-mini-label">Expenses</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{stats?.fundingCount || 0}</div><div className="stat-mini-label">Fundings</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{stats?.activityCount || 0}</div><div className="stat-mini-label">Activities</div></div>
          </div>
          {user.proExpiresAt && <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 13 }}>Pro expires: {fmtDate(user.proExpiresAt)}</p>}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {!showPasswordReset ? (
              <button className="btn btn-sm btn-warning" onClick={() => setShowPasswordReset(true)}>🔑 Reset User Password</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: 1, margin: 0 }}>
                  <label>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" autoFocus />
                </div>
                <button className="btn btn-sm btn-primary" onClick={resetPassword} disabled={resetting} style={{ marginBottom: 0 }}>{resetting ? 'Saving…' : 'Set Password'}</button>
                <button className="btn btn-sm btn-ghost" onClick={() => { setShowPasswordReset(false); setNewPassword(''); }} style={{ marginBottom: 0 }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Families Page ───────────────────────────────────────────────────────── */
function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyDetail, setFamilyDetail] = useState(null);

  const loadFamilies = useCallback(async () => {
    setLoading(true);
    try { const data = await api.families({ search, page, limit: 30 }); setFamilies(data.families); setTotal(data.total); } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, page]);
  useEffect(() => { loadFamilies(); }, [loadFamilies]);

  const viewFamily = async (id) => { try { const data = await api.family(id); setFamilyDetail(data); setSelectedFamily(id); } catch (e) { console.error(e); } };
  const editFamily = async (id, changes) => { try { await api.updateFamily(id, changes); loadFamilies(); if (selectedFamily === id) viewFamily(id); } catch (e) { alert(e.message); } };
  const deleteFamily = async (id, name) => { if (!confirm(`Delete family "${name}" and ALL its data?`)) return; try { await api.deleteFamily(id); setSelectedFamily(null); loadFamilies(); } catch (e) { alert(e.message); } };
  const resetFamily = async (id, name) => { if (!confirm(`Factory reset family "${name}"? All data wiped.`)) return; try { await api.factoryReset(id); viewFamily(id); } catch (e) { alert(e.message); } };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Families ({total})</h2>
        <input className="search-input" placeholder="Search family name…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {selectedFamily && familyDetail ? (
        <FamilyDetail family={familyDetail} onBack={() => setSelectedFamily(null)} onEdit={editFamily} onDelete={deleteFamily} onReset={resetFamily} />
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead><tr><th>Name</th><th>Members</th><th>Pro</th><th>Revenue</th><th>Orders</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {families.map((f, i) => (
                  <tr key={f._id} className="clickable" onClick={() => viewFamily(f._id)} style={{ animationDelay: `${i * 30}ms` }}>
                    <td><strong>{f.name}</strong></td>
                    <td>{f.memberCount}</td>
                    <td>{tierBadge(f.proTier)}</td>
                    <td>RM {f.totalSpentRM}</td>
                    <td>{f.orderCount}</td>
                    <td>{fmtDate(f.createdAt)}</td>
                    <td><button className="btn btn-sm btn-ghost">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <span>Page {page} of {Math.ceil(total / 30) || 1}</span>
            <button className="btn btn-sm" disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Family Detail ───────────────────────────────────────────────────────── */
function FamilyDetail({ family: { family, members, orders, stats, revenue }, onBack, onEdit, onDelete, onReset }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(family.name);
  const [proTier, setProTier] = useState(family.proTier);
  const [aiEnabled, setAiEnabled] = useState(family.aiEnabled);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>← Back to list</button>
        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => { onEdit(family._id, { name, proTier, aiEnabled }); setEditing(false); }}>Save</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-primary" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-sm btn-warning" onClick={() => onReset(family._id, family.name)}>Factory Reset</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(family._id, family.name)}>Delete</button>
            </>
          )}
        </div>
      </div>
      <div className="detail-grid">
        <div className="card">
          <h3>Family Info</h3>
          {editing ? (
            <div className="form-stack">
              <div className="field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="field">
                <label>Pro Tier</label>
                <select value={proTier} onChange={e => setProTier(e.target.value)}>
                  <option value="none">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div className="field"><label><input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} /> AI Enabled</label></div>
            </div>
          ) : (
            <div className="info-grid">
              <div><span className="info-label">Name:</span> {family.name}</div>
              <div><span className="info-label">Pro:</span> {tierBadge(family.proTier)}</div>
              <div><span className="info-label">Pro Purchased:</span> {fmtDate(family.proPurchasedAt)}</div>
              <div><span className="info-label">Pro Expires:</span> {fmtDate(family.proExpiresAt)}</div>
              <div><span className="info-label">AI:</span> {family.aiEnabled ? '✅' : '❌'}</div>
              <div><span className="info-label">Currency:</span> {family.currency}</div>
              <div><span className="info-label">Created:</span> {fmtDateTime(family.createdAt)}</div>
            </div>
          )}
        </div>
        <div className="card">
          <h3>Stats</h3>
          <div className="stats-grid compact">
            <div className="stat-mini"><div className="stat-mini-val">{stats.memberCount}</div><div className="stat-mini-label">Members</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{stats.expenseCount}</div><div className="stat-mini-label">Expenses</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{stats.fundingCount}</div><div className="stat-mini-label">Fundings</div></div>
            <div className="stat-mini"><div className="stat-mini-val">RM {revenue}</div><div className="stat-mini-label">Revenue</div></div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Members ({members.length})</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>PIN</th><th>Joined</th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m._id}>
                <td><strong>{m.name}</strong></td>
                <td>{m.email || '—'}</td>
                <td>{roleBadge(m.role)}</td>
                <td>{m.pinHash === '(set)' ? '✅' : '—'}</td>
                <td>{fmtDate(m.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Payment History</h3>
          <table className="table">
            <thead><tr><th>Order</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td className="mono">{o.orderId}</td>
                  <td>{tierBadge(o.plan)}</td>
                  <td>RM {(o.amountSen / 100).toFixed(2)}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td>{fmtDate(o.paidAt || o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Orders / Payments Page ──────────────────────────────────────────────── */
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [revenue, setRevenue] = useState('0.00');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (status) params.status = status;
      if (plan) params.plan = plan;
      const data = await api.orders(params);
      setOrders(data.orders); setTotal(data.total); setRevenue(data.totalRevenueRM);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [status, plan, page]);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Payments ({total}) — Total Revenue: RM {revenue}</h2>
        <div className="filters">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
          <select value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}>
            <option value="">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Order ID</th><th>Family</th><th>Plan</th><th>Amount</th><th>Status</th><th>Promo</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td className="mono">{o.orderId}</td>
                <td>{o.familyName}</td>
                <td>{tierBadge(o.plan)}</td>
                <td>RM {o.amountRM}</td>
                <td>{statusBadge(o.status)}</td>
                <td>{o.promoCode || '—'}</td>
                <td>{fmtDate(o.paidAt || o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="empty">No orders found</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
        <span>Page {page} of {Math.ceil(total / 30) || 1}</span>
        <button className="btn btn-sm" disabled={page * 30 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

/* ─── Activity Page ───────────────────────────────────────────────────────── */
function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const loadActivity = useCallback(async () => {
    try { const data = await api.activity({ page, limit: 50 }); setLogs(data.logs); setTotal(data.total); } catch (e) { console.error(e); }
  }, [page]);
  useEffect(() => { loadActivity(); }, [loadActivity]);

  return (
    <div className="page">
      <div className="page-header"><h2>Activity Log ({total})</h2></div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Time</th><th>Actor</th><th>Type</th><th>Message</th><th>Amount</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id}>
                <td>{fmtDateTime(l.createdAt)}</td>
                <td>{l.actorName || '—'}</td>
                <td><span className="badge badge-sm">{l.type}</span></td>
                <td>{l.message}</td>
                <td>{l.amount ? `RM ${(l.amount / 100).toFixed(2)}` : '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={5} className="empty">No activity yet</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
        <span>Page {page} of {Math.ceil(total / 50) || 1}</span>
        <button className="btn btn-sm" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

/* ─── Promos Page (Full CRUD) ────────────────────────────────────────────── */
function PromosPage() {
  const [promos, setPromos] = useState([]);
  const [usage, setUsage] = useState([]);
  const [tab, setTab] = useState('codes');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', description: '', discountType: 'percent', discountValue: 25, expiresAt: '', targetEmails: '', maxUses: 0, active: true });
  const [saving, setSaving] = useState(false);

  const loadPromos = () => api.promos().then(d => setPromos(d.promos || [])).catch(console.error);
  const loadUsage = () => api.promoUsage().then(d => setUsage(d.usage || [])).catch(console.error);
  useEffect(() => { loadPromos(); loadUsage(); }, []);

  const openNew = () => { setEditing(null); setForm({ code: '', description: '', discountType: 'percent', discountValue: 25, expiresAt: '', targetEmails: '', maxUses: 0, active: true }); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      code: p.code, description: p.description || '', discountType: p.discountType,
      discountValue: p.discountValue, expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : '',
      targetEmails: (p.targetEmails || []).join(', '), maxUses: p.maxUses || 0, active: p.active !== false,
    });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        expiresAt: form.expiresAt || null,
        targetEmails: form.targetEmails ? form.targetEmails.split(',').map(e => e.trim()).filter(Boolean) : [],
        maxUses: Number(form.maxUses) || 0,
        active: form.active,
      };
      if (editing) await api.updatePromo(editing._id, payload);
      else await api.createPromo(payload);
      setShowForm(false); loadPromos();
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const del = async (id, code) => {
    if (!confirm(`Delete promo code "${code}"?`)) return;
    try { await api.deletePromo(id); loadPromos(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Promo Codes</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setTab('codes')} style={{ background: tab === 'codes' ? 'var(--primary)' : 'var(--surface)', color: tab === 'codes' ? '#fff' : 'var(--text)' }}>Manage Codes</button>
          <button className="btn btn-sm" onClick={() => setTab('usage')} style={{ background: tab === 'usage' ? 'var(--primary)' : 'var(--surface)', color: tab === 'usage' ? '#fff' : 'var(--text)' }}>Usage History</button>
          <button className="btn btn-sm btn-primary" onClick={openNew}>+ New Code</button>
        </div>
      </div>

      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <h3>{editing ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
          <div className="form-stack">
            <div className="field"><label>Code</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER25" disabled={!!editing} style={{ textTransform: 'uppercase' }} /></div>
            <div className="field"><label>Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Summer sale discount" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Discount Type</label>
                <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (RM)</option>
                </select>
              </div>
              <div className="field">
                <label>{form.discountType === 'percent' ? 'Discount (%)' : 'Discount (sen)'}</label>
                <input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} min={1} max={form.discountType === 'percent' ? 100 : 99999} />
                {form.discountType === 'fixed' && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Enter in sen. E.g. 300 = RM 3.00 off</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label>Expiry Date (leave empty = forever)</label><input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} /></div>
              <div className="field"><label>Max Uses (0 = unlimited)</label><input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} min={0} /></div>
            </div>
            <div className="field"><label>Target Emails (comma-separated, leave empty = everyone)</label><input value={form.targetEmails} onChange={e => setForm({...form, targetEmails: e.target.value})} placeholder="user@email.com, other@email.com" /></div>
            <div className="field"><label><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} /> Active (visible to users)</label></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Code'}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'codes' ? (
        <div className="card">
          <table className="table">
            <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Uses</th><th>Expires</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {promos.map(p => (
                <tr key={p._id}>
                  <td><strong style={{ fontFamily: 'monospace' }}>{p.code}</strong></td>
                  <td><span className="badge badge-sm" style={{ background: p.discountType === 'percent' ? '#4e9de6' : '#34c759' }}>{p.discountType}</span></td>
                  <td>{p.discountType === 'percent' ? `${p.discountValue}%` : `RM ${(p.discountValue / 100).toFixed(2)}`}</td>
                  <td>{p.currentUses}{p.maxUses > 0 ? ` / ${p.maxUses}` : ''}</td>
                  <td>{p.expiresAt ? fmtDate(p.expiresAt) : 'Forever'}</td>
                  <td><span className="badge badge-sm" style={{ background: p.active ? '#34c759' : '#6c757d' }}>{p.active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(p._id, p.code)}>Delete</button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && <tr><td colSpan={7} className="empty">No promo codes yet. Click "+ New Code" to create one.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Code</th><th>Family</th><th>Used At</th><th>Order</th></tr></thead>
            <tbody>
              {usage.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.code}</strong></td>
                  <td>{u.familyName}</td>
                  <td>{fmtDate(u.usedAt)}</td>
                  <td className="mono">{u.orderId || '—'}</td>
                </tr>
              ))}
              {usage.length === 0 && <tr><td colSpan={4} className="empty">No promo usage yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Reports Page (NEW) ─────────────────────────────────────────────────── */
function ReportsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setDashboard).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Generating reports…</div>;
  if (!dashboard) return <div className="page-error">Failed to load report data.</div>;

  const revPerFamily = dashboard.totalFamilies ? ((dashboard.revenue?.totalRM || 0) / dashboard.totalFamilies).toFixed(2) : '0.00';
  const proRate = dashboard.totalFamilies ? ((dashboard.proFamilies / dashboard.totalFamilies) * 100).toFixed(1) : '0.0';
  const avgExpenses = dashboard.totalFamilies ? ((dashboard.totalExpenses || 0) / dashboard.totalFamilies).toFixed(0) : '0';

  return (
    <div className="page">
      <h2>📈 Reports & Analytics</h2>

      <div className="grid-2">
        <div className="card animate-in">
          <h3>Revenue Summary</h3>
          <div className="stats-grid compact">
            <div className="stat-mini"><div className="stat-mini-val">RM {dashboard.revenue?.totalRM || 0}</div><div className="stat-mini-label">Total Revenue</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{dashboard.revenue?.orderCount || 0}</div><div className="stat-mini-label">Total Orders</div></div>
            <div className="stat-mini"><div className="stat-mini-val">RM {revPerFamily}</div><div className="stat-mini-label">Rev / Family</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{proRate}%</div><div className="stat-mini-label">Pro Conversion</div></div>
          </div>
        </div>

        <div className="card animate-in-delay-1">
          <h3>Usage Summary</h3>
          <div className="stats-grid compact">
            <div className="stat-mini"><div className="stat-mini-val">{dashboard.totalFamilies}</div><div className="stat-mini-label">Families</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{dashboard.totalUsers}</div><div className="stat-mini-label">Users</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{dashboard.totalExpenses || 0}</div><div className="stat-mini-label">Expenses</div></div>
            <div className="stat-mini"><div className="stat-mini-val">{avgExpenses}</div><div className="stat-mini-label">Avg Exp / Family</div></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card animate-in-delay-2">
          <h3>Sign-up Trend (30 days)</h3>
          <MiniChart data={dashboard.dailyFamilies} color="#ff6f91" label="families" />
        </div>
        <div className="card animate-in-delay-3">
          <h3>User Growth (30 days)</h3>
          <MiniChart data={dashboard.dailyUsers} color="#4e9de6" label="users" />
        </div>
      </div>

      <div className="card animate-in-delay-3" style={{ marginTop: 16 }}>
        <h3>Tier Breakdown</h3>
        <div className="tier-bars">
          {[
            { name: 'Free', value: dashboard.freeFamilies || 0, fill: '#6c757d' },
            { name: 'Monthly', value: dashboard.tierBreakdown?.monthly || 0, fill: '#4e9de6' },
            { name: 'Yearly', value: dashboard.tierBreakdown?.yearly || 0, fill: '#7c5cd6' },
            { name: 'Lifetime', value: dashboard.tierBreakdown?.lifetime || 0, fill: '#f7b32b' },
          ].map((t, i) => (
            <div key={i} className="tier-bar-row">
              <span className="tier-name">{t.name}</span>
              <div className="tier-bar-bg">
                <div className="tier-bar-fill" style={{ width: `${dashboard.totalFamilies ? (t.value / dashboard.totalFamilies * 100) : 0}%`, background: t.fill }} />
              </div>
              <span className="tier-count">{t.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Announcements Page (NEW) ───────────────────────────────────────────── */
function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState('info');
  const [newLink, setNewLink] = useState('');
  const [sending, setSending] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const r = await api.announcements();
      setAnnouncements(r.announcements || []);
    } catch {}
  };
  useEffect(() => { loadAnnouncements(); }, []);

  const sendAnnouncement = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setSending(true);
    try {
      await api.createAnnouncement({ title: newTitle, message: newMessage, type: newType, linkUrl: newLink || null });
      setNewLink('');
      setNewTitle(''); setNewMessage('');
      loadAnnouncements();
    } catch (e) { alert(e.message); } finally { setSending(false); }
  };

  const deleteAnn = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="page">
      <h2>📣 Announcements</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        Send push notifications and in-app messages to all users or specific families.
      </p>

      <div className="grid-2">
        <div className="card animate-in">
          <h3>Create Announcement</h3>
          <div className="form-stack">
            <div className="field">
              <label>Title</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. New feature: AI receipt scanning!" />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Describe the update or announcement…" style={{ resize: 'vertical' }} />
            </div>
            <div className="field">
              <label>Link URL (optional)</label>
              <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="e.g. https://housley.app/download" />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="info">ℹ️ Info</option>
                <option value="update">🔄 Update</option>
                <option value="promo">🎉 Promotion</option>
                <option value="warning">⚠️ Warning</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={sendAnnouncement} disabled={sending || !newTitle.trim()}>
              {sending ? 'Sending…' : '📤 Send to All Users'}
            </button>
          </div>
        </div>

        <div className="card animate-in-delay-1">
          <h3>Sent Announcements</h3>
          {announcements.length === 0 ? (
            <div className="empty" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📣</div>
              <div>No announcements sent yet</div>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Title</th><th>Type</th><th>Link</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a._id}>
                    <td><strong>{a.title}</strong></td>
                    <td><span className="badge badge-sm">{a.type}</span></td>
                    <td>{a.linkUrl ? <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'var(--primary)'}}>Open</a> : '-'}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => deleteAnn(a._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Releases Page ────────────────────────────────────────────────────────── */
function ReleasesPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({ version: '', versionCode: '', releaseNotes: '', isMandatory: false });
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState(null);

  const loadReleases = async () => {
    setLoading(true);
    try {
      const data = await api.releases();
      setReleases(data.releases || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { loadReleases(); }, []);

  const handlePublish = async () => {
    if (!form.version || !form.versionCode) return alert('Version and version code are required.');
    if (!file && !form.apkUrl) return alert('Upload an APK file.');
    setPublishing(true);
    try {
      const fd = new FormData();
      fd.append('version', form.version);
      fd.append('versionCode', form.versionCode);
      fd.append('releaseNotes', form.releaseNotes);
      fd.append('isMandatory', form.isMandatory);
      if (file) fd.append('apk', file);
      await api.publishRelease(fd);
      setToast({ msg: `Version ${form.version} published!`, type: 'success' });
      setShowForm(false);
      setForm({ version: '', versionCode: '', releaseNotes: '', isMandatory: false });
      setFile(null);
      loadReleases();
    } catch (e) { setToast({ msg: e.message, type: 'error' }); } finally { setPublishing(false); }
  };

  const handleDelete = async (id, version) => {
    if (!confirm(`Delete release v${version}? This cannot be undone.`)) return;
    try {
      await api.deleteRelease(id);
      loadReleases();
    } catch (e) { alert(e.message); }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="page">
      <div className="page-header">
        <h2>App Releases</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Publish New Release'}
        </button>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 24 }}>
          <h3>Publish New Release</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Upload an APK file and publish a new version. All users will be notified automatically.
          </p>
          <div className="form-stack">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Version Name</label>
                <input value={form.version} onChange={e => setForm({...form, version: e.target.value})} placeholder="e.g. 2.1.0" autoFocus />
              </div>
              <div className="field">
                <label>Version Code</label>
                <input type="number" value={form.versionCode} onChange={e => setForm({...form, versionCode: e.target.value})} placeholder="e.g. 21" min={1} />
              </div>
            </div>
            <div className="field">
              <label>APK File</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="btn btn-sm btn-ghost" style={{ cursor: 'pointer' }}>
                  📁 Choose APK file
                  <input type="file" accept=".apk" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </label>
                {file && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>}
              </div>
            </div>
            <div className="field">
              <label>Release Notes (one per line)</label>
              <textarea value={form.releaseNotes} onChange={e => setForm({...form, releaseNotes: e.target.value})} rows={4} placeholder="- Fixed login bug\n- Added dark mode\n- Improved performance" style={{ resize: 'vertical' }} />
            </div>
            <div className="field">
              <label><input type="checkbox" checked={form.isMandatory} onChange={e => setForm({...form, isMandatory: e.target.checked})} /> Mandatory update (users cannot skip)</label>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing…' : '🚀 Publish Release'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty" style={{ padding: 40 }}>Loading releases…</div>
        ) : releases.length === 0 ? (
          <div className="empty" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
            <div>No releases published yet</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Click "+ Publish New Release" to upload your first APK.</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Version</th><th>Code</th><th>Size</th><th>Notes</th><th>Mandatory</th><th>Published</th><th></th></tr></thead>
            <tbody>
              {releases.map(r => (
                <tr key={r._id}>
                  <td>
                    <strong>v{r.version}</strong>
                    {r.isLatest && <span className="badge" style={{ marginLeft: 8, background: '#34c759', fontSize: 10 }}>LATEST</span>}
                  </td>
                  <td>{r.versionCode}</td>
                  <td>{r.apkSize ? `${(r.apkSize / 1024 / 1024).toFixed(1)} MB` : '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(r.releaseNotes || []).join(', ') || '—'}
                  </td>
                  <td>{r.isMandatory ? '✅' : '—'}</td>
                  <td>{fmtDateTime(r.createdAt)}</td>
                  <td>
                    {!r.isLatest && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r._id, r.version)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── System Page ─────────────────────────────────────────────────────────── */
function SystemPage() {
  const [sys, setSys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', name: '', role: 'admin' });

  useEffect(() => { api.system().then(setSys).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault(); setCreating(true);
    try { await api.createAdmin(newAdmin); alert('Admin created!'); setNewAdmin({ email: '', password: '', name: '', role: 'admin' }); }
    catch (err) { alert(err.message); } finally { setCreating(false); }
  };

  if (loading) return <div className="page-loading">Loading system info…</div>;

  return (
    <div className="page">
      <h2>⚙️ System</h2>
      <div className="grid-2">
        <div className="card animate-in">
          <h3>Health</h3>
          <div className="info-grid">
            <div><span className="info-label">Status:</span> {sys?.status === 'healthy' ? '✅ Healthy' : '❌ Disconnected'}</div>
            <div><span className="info-label">MongoDB:</span> {sys?.mongodb}</div>
            <div><span className="info-label">Uptime:</span> {sys?.uptime ? `${Math.floor(sys.uptime / 60)}m ${Math.floor(sys.uptime % 60)}s` : '—'}</div>
            <div><span className="info-label">Memory:</span> {sys?.memory ? `${(sys.memory.heapUsed / 1024 / 1024).toFixed(1)} MB` : '—'}</div>
          </div>
          {sys?.collections && (
            <div style={{ marginTop: 16 }}>
              <span className="info-label">Collections:</span>
              <div className="tag-list">
                {sys.collections.map(c => <span key={c} className="tag">{c}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="card animate-in-delay-1">
          <h3>Create Admin Account</h3>
          <form onSubmit={handleCreateAdmin} className="form-stack">
            <div className="field"><label>Name</label><input value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required /></div>
            <div className="field"><label>Email</label><input type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required /></div>
            <div className="field"><label>Password</label><input type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required minLength={10} /></div>
            <div className="field">
              <label>Role</label>
              <select value={newAdmin.role} onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="viewer">Viewer (read-only)</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={creating}>{creating ? 'Creating…' : 'Create Admin'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [admin, setAdmin] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('admin_dark_mode') === 'true');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    api.me().then(d => setAdmin(d.admin)).catch(() => localStorage.removeItem('admin_token')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('admin_dark_mode', darkMode);
  }, [darkMode]);

  const handleLogin = (a) => { setAdmin(a); setToast({ msg: `Welcome back, ${a.name}!`, type: 'success' }); };
  const handleLogout = () => { localStorage.removeItem('admin_token'); setAdmin(null); setPage('dashboard'); };

  if (loading) return <div className="login-page"><div className="loading">Loading…</div></div>;
  if (!admin) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard: <DashboardPage />,
    families: <FamiliesPage />,
    users: <UsersPage />,
    orders: <OrdersPage />,
    activity: <ActivityPage />,
    promos: <PromosPage />,
    reports: <ReportsPage />,
    announcements: <AnnouncementsPage />,
    releases: <ReleasesPage />,
    system: <SystemPage />,
  };

  return (
    <div className="app-layout">
      <Sidebar active={page} onSelect={setPage} admin={admin} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="main-content">
        {pages[page] || <DashboardPage />}
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
