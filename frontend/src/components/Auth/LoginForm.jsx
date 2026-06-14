import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';

export default function LoginForm() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin', phone: '', vehicleType: 'bike' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.role, form.phone, form.vehicleType);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the backend. Please ensure your backend is running, and if deployed, that VITE_API_URL is set correctly in Vercel and CORS_ORIGIN is set in Render.');
      } else {
        setError(
          err.response.data?.message ||
          err.response.data?.error ||
          'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-static" style={{ padding: 'var(--space-8)' }}>
      <h3 style={{ marginBottom: 'var(--space-1)', fontSize: 'var(--font-xl)' }}>
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h3>
      <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>
        {isRegister
          ? 'Set up your dispatcher account'
          : 'Sign in to your dispatch dashboard'}
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }} id="login-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} id="login-form">
        {isRegister && (
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="login-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser
                style={{
                  position: 'absolute', left: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '1.1rem',
                }}
              />
              <input
                id="login-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineMail
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '1.1rem',
              }}
            />
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label" htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <HiOutlineLockClosed
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '1.1rem',
              }}
            />
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        {isRegister && (
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="login-role">Role</label>
            <select
              id="login-role"
              name="role"
              className="form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="admin">Admin / Dispatcher</option>
              <option value="rider">Rider</option>
            </select>
          </div>
        )}

        {isRegister && form.role === 'rider' && (
          <>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="login-phone">Phone Number</label>
              <input
                id="login-phone"
                name="phone"
                type="text"
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="login-vehicle">Vehicle Type</label>
              <select
                id="login-vehicle"
                name="vehicleType"
                className="form-select"
                value={form.vehicleType}
                onChange={handleChange}
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="bicycle">Bicycle</option>
                <option value="car">Car</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
          id="login-submit-btn"
          style={{ marginTop: 'var(--space-2)' }}
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm" />
              {isRegister ? 'Creating Account…' : 'Signing In…'}
            </>
          ) : (
            isRegister ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <p
        className="text-center text-sm"
        style={{ marginTop: 'var(--space-6)', color: 'var(--text-secondary)' }}
      >
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          className="text-gradient"
          style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          id="login-toggle-btn"
        >
          {isRegister ? 'Sign In' : 'Create Account'}
        </button>
      </p>
    </div>
  );
}
