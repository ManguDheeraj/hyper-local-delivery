import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './EarningsChart.css';

const SAMPLE_DATA = [
  { day: 'Mon', earnings: 4200 },
  { day: 'Tue', earnings: 5800 },
  { day: 'Wed', earnings: 3900 },
  { day: 'Thu', earnings: 7100 },
  { day: 'Fri', earnings: 6300 },
  { day: 'Sat', earnings: 8500 },
  { day: 'Sun', earnings: 5400 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
}

export default function EarningsChart({ data }) {
  const chartData = data?.length ? data : SAMPLE_DATA;

  return (
    <div className="earnings-chart glass-card-static" id="earnings-chart">
      <div className="earnings-chart-header">
        <h4>Earnings Overview</h4>
        <span className="text-secondary text-sm">Last 7 days</span>
      </div>
      <div className="earnings-chart-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barSize={32} barGap={8}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="earnings" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
