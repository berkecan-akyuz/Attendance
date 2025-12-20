import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
    User,
    Settings,
    ShieldCheck,
    Bell,
    Building2,
    GraduationCap,
    UserCog,
    Camera,
    Mail,
    Phone,
    Lock,
    Smartphone,
    LogOut,
    ChevronLeft
} from "lucide-react";
import { changePassword } from "../lib/api";

interface UserProfilePageProps {
    userRole: "admin" | "teacher" | "student";
    userData?: {
        name?: string;
        email?: string;
        avatar?: string;
        id?: string;
    };
    onBack: () => void;
    onLogout: () => void;
    defaultTab?: string;
}

export function UserProfilePage({ userRole, userData, onBack, onLogout, defaultTab = "profile" }: UserProfilePageProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form State
    const [fullName, setFullName] = useState(userData?.name || "User");
    const [email, setEmail] = useState(userData?.email || "user@example.com");
    const [phone, setPhone] = useState("+1 (555) 000-0000");
    const [bio, setBio] = useState("");

    // Settings State
    const [theme, setTheme] = useState("system");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        if (userData) {
            setFullName(userData.name || fullName);
            setEmail(userData.email || email);
        }
    }, [userData]);

    const handleSave = async (type: "profile" | "security") => {
        setLoading(true);
        setMessage(null);

        try {
            if (type === "security") {
                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords do not match");
                }
                if (!currentPassword) {
                    throw new Error("Current password is required");
                }
                if (!userData?.id) {
                    // Fallback or error if ID is missing. But we can cast since we know it's there usually.
                    // The interface says userData.id is optional string, API expects number.
                    // Let's assume user_id is in userData as number or string id that can be parsed.
                    // If userData.id is string, parseInt.
                    if (!userData?.id) throw new Error("User ID not found");
                }

                await changePassword({
                    user_id: parseInt(userData.id!),
                    current_password: currentPassword,
                    new_password: newPassword
                });
                setMessage({ type: "success", text: "Password updated successfully" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                // Profile update simulation (or real API if we had one)
                await new Promise(resolve => setTimeout(resolve, 1000));
                setMessage({ type: "success", text: "Profile updated successfully" });
            }
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "An error occurred" });
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = () => {
        switch (userRole) {
            case "admin": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            case "teacher": return "bg-green-100 text-green-700 hover:bg-green-100";
            case "student": return "bg-purple-100 text-purple-700 hover:bg-purple-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={onLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3 space-y-2">
                        <nav className="space-y-1">
                            <Button
                                variant={activeTab === "profile" ? "secondary" : "ghost"}
                                className={`w-full justify-start flex items-center ${activeTab === "profile" ? "bg-white shadow-sm font-medium" : "text-gray-600"}`}
                                onClick={() => setActiveTab("profile")}
                            >
                                <User className="w-4 h-4 mr-3" />
                                Profile
                            </Button>

                            <div className="pt-4 pb-2">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
                            </div>

                            <Button
                                variant={activeTab === "security" ? "secondary" : "ghost"}
                                className={`w-full justify-start flex items-center ${activeTab === "security" ? "bg-white shadow-sm font-medium" : "text-gray-600"}`}
                                onClick={() => setActiveTab("security")}
                            >
                                <ShieldCheck className="w-4 h-4 mr-3" />
                                Security
                            </Button>
                            <Button
                                variant={activeTab === "notifications" ? "secondary" : "ghost"}
                                className={`w-full justify-start flex items-center ${activeTab === "notifications" ? "bg-white shadow-sm font-medium" : "text-gray-600"}`}
                                onClick={() => setActiveTab("notifications")}
                            >
                                <Bell className="w-4 h-4 mr-3" />
                                Notifications
                            </Button>
                            <Button
                                variant={activeTab === "preferences" ? "secondary" : "ghost"}
                                className={`w-full justify-start flex items-center ${activeTab === "preferences" ? "bg-white shadow-sm font-medium" : "text-gray-600"}`}
                                onClick={() => setActiveTab("preferences")}
                            >
                                <Settings className="w-4 h-4 mr-3" />
                                Preferences
                            </Button>
                        </nav>

                        <div className="pt-6">
                            <Card className="p-4 bg-blue-50 border-blue-100">
                                <div className="flex items-center space-x-2 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium text-sm text-blue-900">Security Status</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                                </div>
                                <p className="text-xs text-blue-700">Your account is well secured.</p>
                            </Card>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-6">
                        {message && (
                            <div
                                className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <ShieldCheck className="w-5 h-5" />
                                ) : (
                                    <LogOut className="w-5 h-5" />
                                )}
                                <span>{message.text}</span>
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100">
                                                <span className="text-3xl font-medium text-gray-400">
                                                    {fullName.charAt(0)}
                                                </span>
                                            </div>
                                            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-100 text-gray-600 hover:text-blue-600 transition-colors">
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge className={getRoleBadgeColor()}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</Badge>
                                                <span className="text-gray-500 text-sm">{email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                    </div>


                                    <div className="mt-6 flex justify-end">
                                        <Button onClick={() => handleSave("profile")} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                            {loading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Authentication</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Current Password</Label>
                                                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>New Password</Label>
                                                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Confirm New Password</Label>
                                                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <Button onClick={() => handleSave("security")} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                                {loading ? "Updating..." : "Update Password"}
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator className="my-6" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium text-gray-900">Two-Factor Authentication</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                        </div>
                                        <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === "notifications" && (
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-900">Email Notifications</span>
                                                <p className="text-sm text-gray-500">Receive daily summaries and important alerts.</p>
                                            </div>
                                            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-900">Push Notifications</span>
                                                <p className="text-sm text-gray-500">Get real-time updates on your device.</p>
                                            </div>
                                            <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === "preferences" && (
                            <div className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">App Preferences</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Theme</Label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="system">System</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Language</Label>
                                            <Select defaultValue="en">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
