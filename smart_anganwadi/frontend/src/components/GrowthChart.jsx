import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const GrowthChart = ({ data, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-muted)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        No growth records available yet for charting.
      </div>
    );
  }

  // Format data
  const chartData = data.map(item => ({
    date: item.date,
    weight: parseFloat(item.weight),
    height: parseFloat(item.height),
    bmi: item.bmi ? parseFloat(item.bmi) : null,
    status: item.growth_status
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} unit=" kg" domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" stroke="#4f46e5" fontSize={12} unit=" cm" domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            formatter={(value, name) => [value, name === 'weight' ? 'Weight (kg)' : name === 'height' ? 'Height (cm)' : 'BMI']}
          />
          <Legend verticalAlign="top" height={36} />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="weight" 
            name="Weight (kg)" 
            stroke="#0d9488" 
            strokeWidth={3} 
            dot={{ r: 5, fill: '#0d9488' }} 
            activeDot={{ r: 7 }} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="height" 
            name="Height (cm)" 
            stroke="#4f46e5" 
            strokeWidth={2} 
            strokeDasharray="4 4" 
            dot={{ r: 4, fill: '#4f46e5' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;
