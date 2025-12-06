import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function RecentActivities() {
  const activities = [
    {
      timestamp: "10:45 AM",
      type: "Check-in",
      user: "John Smith (Student)",
      status: "success",
    },
    {
      timestamp: "10:42 AM",
      type: "Check-in",
      user: "Sarah Johnson (Teacher)",
      status: "success",
    },
    {
      timestamp: "10:38 AM",
      type: "Check-in",
      user: "Mike Davis (Student)",
      status: "success",
    },
    {
      timestamp: "10:35 AM",
      type: "Failed Recognition",
      user: "Unknown User",
      status: "failed",
    },
    {
      timestamp: "10:30 AM",
      type: "Camera Online",
      user: "Camera 3 - Room 205",
      status: "info",
    },
    {
      timestamp: "10:25 AM",
      type: "Check-in",
      user: "Emily Brown (Student)",
      status: "success",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", className: string }> = {
      success: { variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100" },
      failed: { variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-100" },
      info: { variant: "secondary", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
    };
    
    const config = variants[status] || variants.info;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Activity Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="text-gray-600">{activity.timestamp}</TableCell>
                <TableCell>{activity.type}</TableCell>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{getStatusBadge(activity.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
