import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { AddEditUserModal } from "./AddEditUserModal";
import { DeleteUserDialog } from "./DeleteUserDialog";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserCog,
  Edit,
  Trash2,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  department?: string;
  photo: string;
  status: boolean;
  lastLogin: string;
}

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@attendance.com",
      role: "admin",
      photo: "",
      status: true,
      lastLogin: "2 hours ago",
    },
    {
      id: "2",
      name: "John Teacher",
      email: "john.teacher@school.com",
      role: "teacher",
      department: "Computer Science",
      photo: "",
      status: true,
      lastLogin: "1 hour ago",
    },
    {
      id: "3",
      name: "Sarah Williams",
      email: "sarah.williams@school.com",
      role: "teacher",
      department: "Mathematics",
      photo: "",
      status: true,
      lastLogin: "3 hours ago",
    },
    {
      id: "4",
      name: "Emma Student",
      email: "emma.student@school.com",
      role: "student",
      photo: "",
      status: true,
      lastLogin: "30 minutes ago",
    },
    {
      id: "5",
      name: "Michael Brown",
      email: "michael.brown@school.com",
      role: "student",
      photo: "",
      status: true,
      lastLogin: "1 day ago",
    },
    {
      id: "6",
      name: "Lisa Anderson",
      email: "lisa.anderson@school.com",
      role: "teacher",
      department: "English",
      photo: "",
      status: false,
      lastLogin: "2 weeks ago",
    },
    {
      id: "7",
      name: "David Wilson",
      email: "david.wilson@school.com",
      role: "student",
      photo: "",
      status: true,
      lastLogin: "5 hours ago",
    },
    {
      id: "8",
      name: "Jennifer Garcia",
      email: "jennifer.garcia@school.com",
      role: "student",
      photo: "",
      status: false,
      lastLogin: "1 month ago",
    },
  ]);

  const stats = {
    totalUsers: users.length,
    activeToday: users.filter((u) => 
      u.lastLogin.includes("hour") || u.lastLogin.includes("minute")
    ).length,
    newThisMonth: 12,
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "admins" && user.role === "admin") ||
      (activeTab === "teachers" && user.role === "teacher") ||
      (activeTab === "students" && user.role === "student");

    return matchesSearch && matchesTab;
  });

  const getRoleBadge = (role: string) => {
    const configs = {
      admin: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      teacher: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      student: "bg-green-100 text-green-700 hover:bg-green-100",
    };

    return (
      <Badge className={configs[role as keyof typeof configs]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: !user.status } : user
      )
    );
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setAddEditModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setAddEditModalOpen(true);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...user, ...userData } : user
        )
      );
    } else {
      // Add new user
      const newUser: User = {
        id: String(users.length + 1),
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "student",
        department: userData.department,
        photo: userData.photo || "",
        status: userData.status !== undefined ? userData.status : true,
        lastLogin: "Never",
      };
      setUsers([...users, newUser]);
    }
    setAddEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      setUsers(users.filter((user) => user.id !== deletingUser.id));
      setDeletingUser(null);
    }
  };

  const handleResetPassword = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      alert(`Password reset email sent to ${user.email}`);
    }
  };

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900">User Management</h1>
            <p className="text-gray-500">Manage system users and permissions</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Users</p>
                <p className="text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Active Today</p>
                <p className="text-gray-900">{stats.activeToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">New This Month</p>
                <p className="text-gray-900">{stats.newThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCog className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Add User */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* Filter Tabs and Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 px-6 pt-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Users
                  <Badge className="ml-2 bg-gray-200 text-gray-900">{users.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="admins">
                  Admins
                  <Badge className="ml-2 bg-blue-100 text-blue-700">
                    {users.filter((u) => u.role === "admin").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="teachers">
                  Teachers
                  <Badge className="ml-2 bg-orange-100 text-orange-700">
                    {users.filter((u) => u.role === "teacher").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="students">
                  Students
                  <Badge className="ml-2 bg-green-100 text-green-700">
                    {users.filter((u) => u.role === "student").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-gray-500">No users found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={user.photo} alt={user.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-900">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-gray-600">
                            {user.department || "-"}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.status}
                              onCheckedChange={() => handleToggleStatus(user.id)}
                            />
                          </TableCell>
                          <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetPassword(user.id)}
                              >
                                <KeyRound className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingUser(user)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <p className="text-gray-600">
                    Showing {startIndex + 1}-{endIndex} of {filteredUsers.length} users
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""
                          }
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Add/Edit User Modal */}
      {addEditModalOpen && (
        <AddEditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setAddEditModalOpen(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
}
