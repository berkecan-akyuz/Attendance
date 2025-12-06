import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Present', value: 420, percentage: 84 },
  { name: 'Absent', value: 50, percentage: 10 },
  { name: 'Late', value: 30, percentage: 6 },
];

const COLORS = {
  Present: '#10b981',
  Absent: '#ef4444',
  Late: '#f59e0b',
};

export function StatusDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
