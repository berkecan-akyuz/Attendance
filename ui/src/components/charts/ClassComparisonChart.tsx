import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClassComparisonChartProps {
  userRole: "admin" | "teacher";
  data?: Array<{ class: string; attendance: number }>;
}

export function ClassComparisonChart({ userRole, data = [] }: ClassComparisonChartProps) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 border border-dashed rounded-lg bg-white">
        No class comparison data available
      </div>
    );
  }

  const chartData = data;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="class" 
          tick={{ fontSize: 12 }}
          stroke="#888"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#888"
          domain={[0, 100]}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar 
          dataKey="attendance" 
          fill="#10b981" 
          radius={[8, 8, 0, 0]}
          name="Attendance %"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
