import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceTrendChartProps {
  data?: Array<{ date: string; attendance: number }>;
}

export function AttendanceTrendChart({ data = [] }: AttendanceTrendChartProps) {
  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 border border-dashed rounded-lg bg-white">
        No attendance trends available yet
      </div>
    );
  }

  const chartData = data;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
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
        <Line 
          type="monotone" 
          dataKey="attendance" 
          stroke="#2563eb" 
          strokeWidth={3}
          dot={{ fill: '#2563eb', r: 5 }}
          activeDot={{ r: 7 }}
          name="Attendance %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
