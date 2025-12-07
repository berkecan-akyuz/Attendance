import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatusDistributionChartProps {
  data?: Array<{ name: string; value: number; percentage?: number }>;
}

const COLORS = {
  Present: '#10b981',
  Absent: '#ef4444',
  Late: '#f59e0b',
};

export function StatusDistributionChart({ data = [] }: StatusDistributionChartProps) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 border border-dashed rounded-lg bg-white">
        No attendance distribution to show
      </div>
    );
  }

  const chartData = data;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
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
