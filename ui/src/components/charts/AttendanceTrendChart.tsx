import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mon', attendance: 92 },
  { date: 'Tue', attendance: 88 },
  { date: 'Wed', attendance: 95 },
  { date: 'Thu', attendance: 90 },
  { date: 'Fri', attendance: 82 },
  { date: 'Sat', attendance: 94 },
  { date: 'Sun', attendance: 89 },
];

export function AttendanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
