'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function TrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
        <p className="text-gray-400">No historical data available</p>
      </div>
    );
  }

  // Sort by date ascending
  const sortedData = [...data].sort((a, b) => new Date(a.weekEnding) - new Date(b.weekEnding));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={sortedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="weekEnding"
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#2f4545',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#ffffff' }}
        />
        <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12 }} />

        <Line
          type="monotone"
          dataKey="overall"
          name="Overall"
          stroke="#ffffff"
          strokeWidth={2}
          dot={{ fill: '#ffffff', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke="#FF4D9A"
          strokeWidth={2}
          dot={{ fill: '#FF4D9A', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="finance"
          name="Finance"
          stroke="#FF6535"
          strokeWidth={2}
          dot={{ fill: '#FF6535', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="operations"
          name="Operations"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth={2}
          dot={{ fill: 'rgba(255, 255, 255, 0.6)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
