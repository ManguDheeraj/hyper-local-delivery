import { useState } from 'react';
import { HiOutlineX, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import './CreateOrderModal.css';

const EMPTY_ITEM = { name: '', quantity: 1, price: 0 };

export default function CreateOrderModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: '',
  });
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => setItems((p) => [...p, { ...EMPTY_ITEM }]);

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems((p) => p.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        ...form,
        items: items.map((it) => ({
          name: it.name,
          quantity: Number(it.quantity),
          price: Number(it.price),
        })),
        amount: totalAmount,
      });
      onClose();
      setForm({ customerName: '', customerPhone: '', deliveryAddress: '', notes: '' });
      setItems([{ ...EMPTY_ITEM }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="create-order-modal">
      <div className="modal-content create-order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New Order</h3>
          <button className="modal-close" onClick={onClose} id="close-create-order-btn">
            <HiOutlineX />
          </button>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={handleSubmit} id="create-order-form">
          <div className="create-order-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="co-name">Customer Name</label>
              <input
                id="co-name"
                name="customerName"
                className="form-input"
                placeholder="John Doe"
                value={form.customerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="co-phone">Phone</label>
              <input
                id="co-phone"
                name="customerPhone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={form.customerPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="form-label" htmlFor="co-address">Delivery Address</label>
            <textarea
              id="co-address"
              name="deliveryAddress"
              className="form-textarea"
              placeholder="Full delivery address…"
              value={form.deliveryAddress}
              onChange={handleChange}
              required
            />
          </div>

          {/* Items */}
          <div className="create-order-items mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">Items</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} id="add-item-btn">
                <HiOutlinePlus size={14} /> Add Item
              </button>
            </div>

            {items.map((item, i) => (
              <div className="create-order-item-row" key={i}>
                <input
                  className="form-input"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(i, 'name', e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                  style={{ width: 70 }}
                  required
                />
                <input
                  className="form-input"
                  type="number"
                  placeholder="Price"
                  min="0"
                  value={item.price}
                  onChange={(e) => handleItemChange(i, 'price', e.target.value)}
                  style={{ width: 90 }}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeItem(i)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                >
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group mt-4">
            <label className="form-label" htmlFor="co-notes">Notes (optional)</label>
            <input
              id="co-notes"
              name="notes"
              className="form-input"
              placeholder="Special instructions…"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          <div className="create-order-footer mt-6">
            <div className="create-order-total">
              Total: <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                id="submit-order-btn"
              >
                {loading ? (
                  <>
                    <span className="spinner spinner-sm" /> Creating…
                  </>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
