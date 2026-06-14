import { useState, useEffect, useCallback } from 'react';
import RiderList from '../components/Riders/RiderList';
import { getRiders, toggleRiderOnline, registerUser } from '../services/api';
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import './RidersPage.css';

export default function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: 'motorcycle',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRiders = useCallback(async () => {
    try {
      const res = await getRiders();
      const data = res.data?.data || res.data?.riders || res.data || [];
      setRiders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch riders error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleToggle = async (riderId) => {
    try {
      await toggleRiderOnline(riderId);
      fetchRiders();
    } catch (err) {
      console.error('Toggle online error:', err);
    }
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAddRider = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await registerUser({ ...form, role: 'rider' });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', vehicleType: 'motorcycle' });
      fetchRiders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add rider');
    } finally {
      setSubmitting(false);
    }
  };

  const onlineCount = riders.filter((r) => r.isOnline || r.isAvailable).length;

  return (
    <div className="page-container" id="riders-page">
      {/* Header */}
      <div className="riders-page-header">
        <div>
          <h3>Riders</h3>
          <p className="text-secondary text-sm">
            {riders.length} total • {onlineCount} online
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
          id="add-rider-btn"
        >
          <HiOutlinePlus size={16} /> Add Rider
        </button>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="spinner" />
          </div>
        ) : (
          <RiderList riders={riders} onToggleOnline={handleToggle} />
        )}
      </div>

      {/* Add Rider Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)} id="add-rider-modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Rider</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <HiOutlineX />
              </button>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            <form onSubmit={handleAddRider} id="add-rider-form">
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="rider-name">Name</label>
                <input
                  id="rider-name"
                  name="name"
                  className="form-input"
                  placeholder="Rider name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="rider-email">Email</label>
                <input
                  id="rider-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="rider@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="rider-password">Password</label>
                <input
                  id="rider-password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="rider-phone">Phone</label>
                <input
                  id="rider-phone"
                  name="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label className="form-label" htmlFor="rider-vehicle">Vehicle Type</label>
                <select
                  id="rider-vehicle"
                  name="vehicleType"
                  className="form-select"
                  value={form.vehicleType}
                  onChange={handleChange}
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-rider-btn">
                  {submitting ? (
                    <>
                      <span className="spinner spinner-sm" /> Adding…
                    </>
                  ) : (
                    'Add Rider'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
