import { useState, useEffect, useMemo } from 'react';
import EarningsChart from '../components/Dashboard/EarningsChart';
import { getRiders } from '../services/api';
import {
  HiOutlineCurrencyRupee,
  HiOutlineTrendingUp,
  HiOutlineStar,
} from 'react-icons/hi';
import './EarningsPage.css';

const RANGES = [
  { key: '7', label: 'Last 7 days' },
  { key: '30', label: 'Last 30 days' },
  { key: 'all', label: 'All Time' },
];

export default function EarningsPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getRiders();
        const data = res.data?.data || res.data?.riders || res.data || [];
        setRiders(Array.isArray(data) ? data : []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const summary = useMemo(() => {
    const totalPayout = riders.reduce((s, r) => s + (r.totalEarnings || 0), 0);
    const avgEarnings = riders.length ? totalPayout / riders.length : 0;
    const topEarner = riders.length
      ? [...riders].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))[0]
      : null;
    return { totalPayout, avgEarnings, topEarner };
  }, [riders]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-container" id="earnings-page">
      <div className="earnings-page-header">
        <div>
          <h3>Earnings</h3>
          <p className="text-secondary text-sm">Rider payouts &amp; revenue</p>
        </div>

        <div className="tabs">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={`tab ${range === r.key ? 'active' : ''}`}
              onClick={() => setRange(r.key)}
              id={`earnings-range-${r.key}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="earnings-summary mt-6">
        <div className="glass-card earnings-summary-card animate-fadeInUp stagger-1">
          <div className="earnings-summary-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
            <HiOutlineCurrencyRupee size={22} />
          </div>
          <div>
            <span className="earnings-summary-value">
              ₹{summary.totalPayout.toLocaleString('en-IN')}
            </span>
            <span className="earnings-summary-label">Total Payout</span>
          </div>
        </div>

        <div className="glass-card earnings-summary-card animate-fadeInUp stagger-2">
          <div className="earnings-summary-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
            <HiOutlineTrendingUp size={22} />
          </div>
          <div>
            <span className="earnings-summary-value">
              ₹{Math.round(summary.avgEarnings).toLocaleString('en-IN')}
            </span>
            <span className="earnings-summary-label">Avg per Rider</span>
          </div>
        </div>

        <div className="glass-card earnings-summary-card animate-fadeInUp stagger-3">
          <div className="earnings-summary-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
            <HiOutlineStar size={22} />
          </div>
          <div>
            <span className="earnings-summary-value">
              {summary.topEarner?.name || '—'}
            </span>
            <span className="earnings-summary-label">Top Earner</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <EarningsChart />
      </div>

      {/* Rider Earnings Table */}
      <div className="glass-card-static mt-6" style={{ padding: 'var(--space-5)' }} id="earnings-table">
        <h4 className="mb-4">Rider Breakdown</h4>
        {riders.length === 0 ? (
          <p className="text-secondary text-sm text-center p-6">No rider data available.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Total Deliveries</th>
                  <th>Total Earnings</th>
                  <th>Avg / Delivery</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((rider) => {
                  const deliveries = rider.totalDeliveries || 0;
                  const earnings = rider.totalEarnings || 0;
                  const avg = deliveries > 0 ? earnings / deliveries : 0;
                  return (
                    <tr key={rider._id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {rider.name}
                      </td>
                      <td>{deliveries}</td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{earnings.toLocaleString('en-IN')}
                      </td>
                      <td>₹{Math.round(avg).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
