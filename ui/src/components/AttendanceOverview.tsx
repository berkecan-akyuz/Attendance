import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { fetchAttendanceReports, AttendanceReports } from "../lib/api";

export function AttendanceOverview() {
  const [reports, setReports] = useState<AttendanceReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await fetchAttendanceReports();
        setReports(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load attendance";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const chartData = useMemo(() => {
    if (!reports?.recent_sessions?.length) return [] as Array<{ label: string; percentage: number }>;

    return reports.recent_sessions
      .map((session) => {
        const total = session.present + session.absent + session.late;
        const pct = total > 0 ? Math.round((session.present / total) * 100) : 0;
        return {
          label: session.session_date || session.lecture_name,
          percentage: pct,
        };
      })
      .reverse();
  }, [reports]);

  const average = reports?.average_attendance ?? 0;
  const highest = chartData.length ? Math.max(...chartData.map((c) => c.percentage)) : 0;
  const lowest = chartData.length ? Math.min(...chartData.map((c) => c.percentage)) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-gray-900 mb-1">Attendance Overview</h3>
          <p className="text-gray-600">Live session performance</p>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <TrendingUp className="w-3 h-3 mr-1" />
          {average ? `${average.toFixed(1)}% avg` : "Live"}
        </Badge>
      </div>

      {error && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mb-4">{error}</div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ left: -12 }}>
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v?.length > 12 ? `${v.slice(0, 12)}…` : v)}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value}%`, "Attendance"]}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#2563eb"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAttendance)"
            isAnimationActive={!loading}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div>
          <p className="text-gray-600 mb-1">Average</p>
          <p className="text-gray-900">{average ? `${average.toFixed(1)}%` : "--"}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Highest</p>
          <p className="text-gray-900">{chartData.length ? `${highest}%` : "--"}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Lowest</p>
          <p className="text-gray-900">{chartData.length ? `${lowest}%` : "--"}</p>
        </div>
      </div>
    </Card>
  );
}
