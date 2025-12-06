import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

export function AttendanceOverview() {
  const data = [
    { day: "Mon", attendance: 92 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 94 },
    { day: "Thu", attendance: 90 },
    { day: "Fri", attendance: 87 },
    { day: "Sat", attendance: 85 },
    { day: "Sun", attendance: 0 },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-gray-900 mb-1">Attendance Overview</h3>
          <p className="text-gray-600">Weekly attendance trend</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <TrendingUp className="w-3 h-3 mr-1" />
          +2.3%
        </Badge>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="attendance"
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAttendance)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
          <p className="text-gray-600 mb-1">Average</p>
          <p className="text-gray-900">89.3%</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Highest</p>
          <p className="text-gray-900">94%</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Lowest</p>
          <p className="text-gray-900">85%</p>
        </div>
      </div>
    </Card>
  );
}
