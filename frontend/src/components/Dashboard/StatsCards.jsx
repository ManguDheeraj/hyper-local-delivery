import { useEffect, useState, useRef } from 'react';
import {
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi';
import './StatsCards.css';

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const end = Number(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 800;
    const start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
}

const CARDS = [
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: HiOutlineClipboardList,
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  },
  {
    key: 'activeRiders',
    label: 'Active Riders',
    icon: HiOutlineUserGroup,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #67e8f9)',
  },
  {
    key: 'deliveredToday',
    label: 'Delivered Today',
    icon: HiOutlineCheckCircle,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #6ee7b7)',
  },
  {
    key: 'revenue',
    label: 'Revenue',
    icon: HiOutlineCurrencyRupee,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
    prefix: '₹',
  },
];

export default function StatsCards({ stats = {} }) {
  return (
    <div className="stats-grid" id="stats-cards">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;
        return (
          <div
            key={card.key}
            className={`stat-card glass-card animate-fadeInUp stagger-${i + 1}`}
            style={{ '--card-accent': card.color }}
            id={`stat-card-${card.key}`}
          >
            <div className="stat-card-accent" style={{ background: card.gradient }} />
            <div className="stat-card-header">
              <div className="stat-card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                <Icon size={22} />
              </div>
              {stats.changes?.[card.key] !== undefined && (
                <span
                  className={`stat-card-change ${
                    stats.changes[card.key] >= 0 ? 'positive' : 'negative'
                  }`}
                >
                  {stats.changes[card.key] >= 0 ? '+' : ''}
                  {stats.changes[card.key]}%
                </span>
              )}
            </div>
            <div className="stat-card-value">
              <AnimatedNumber value={value} prefix={card.prefix || ''} />
            </div>
            <div className="stat-card-label">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}
