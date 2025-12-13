import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ShieldCheck, Bell, Building2, GraduationCap, UserCog } from "lucide-react";

type ProfileTab = "profile" | "security" | "preferences";

interface ProfileSettingsModalProps {
  open: boolean;
  onClose: () => void;
  role: "admin" | "teacher" | "student";
  userName?: string;
  email?: string;
  identifier?: string;
  defaultTab?: ProfileTab;
}

export function ProfileSettingsModal({
  open,
  onClose,
  role,
  userName = "",
  email = "",
  identifier = "",
  defaultTab = "profile",
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(defaultTab);
  const [fullName, setFullName] = useState(userName || "");
  const [contactEmail, setContactEmail] = useState(email || "");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [department, setDepartment] = useState("Computer Science");
  const [rollNumber, setRollNumber] = useState(identifier || "");
  const [program, setProgram] = useState("B.Sc Computer Science");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(role === "admin");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(role === "admin");
  const [theme, setTheme] = useState("system");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setMessage(null);
    }
  }, [defaultTab, open]);

  useEffect(() => {
    if (!userName) return;
    setFullName(userName);
  }, [userName]);

  useEffect(() => {
    if (!email) return;
    setContactEmail(email);
  }, [email]);

  const roleBadge = useMemo(() => {
    if (role === "admin") return { label: "Administrator", tone: "bg-blue-50 text-blue-700" };
    if (role === "teacher") return { label: "Teacher", tone: "bg-green-50 text-green-700" };
    return { label: "Student", tone: "bg-purple-50 text-purple-700" };
  }, [role]);

  const handleSave = () => {
    setMessage("Your profile preferences have been updated.");
  };

  const handlePasswordUpdate = () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMessage("Please confirm your new password correctly before saving.");
      return;
    }
    setMessage("Password updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const renderRoleSpecificProfile = () => {
    if (role === "admin") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <p className="text-sm text-gray-500">Where your administrative responsibilities live.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgAccess">Access Scope</Label>
            <Select defaultValue="full">
              <SelectTrigger id="orgAccess">
                <SelectValue placeholder="Access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full system access</SelectItem>
                <SelectItem value="restricted">Restricted (users &amp; classes)</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Adjust the boundaries of your admin workspace.</p>
          </div>
        </div>
      );
    }

    if (role === "teacher") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teacherDept">Department</Label>
            <Input id="teacherDept" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <p className="text-sm text-gray-500">Helps students recognize your classes.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="officeHours">Office Hours</Label>
            <Input id="officeHours" placeholder="Mon &amp; Wed 2:00–4:00 PM" />
            <p className="text-sm text-gray-500">Share availability for student queries.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roll">Roll Number</Label>
          <Input id="roll" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
          <p className="text-sm text-gray-500">Used to match your attendance records.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="program">Program</Label>
          <Input id="program" value={program} onChange={(e) => setProgram(e.target.value)} />
          <p className="text-sm text-gray-500">Update your current study program.</p>
        </div>
      </div>
    );
  };

  const renderRoleSpecificSecurity = () => {
    if (role === "admin") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Two-factor authentication</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Require 2FA for sign-in</p>
                <p className="text-sm text-gray-500">Keeps sensitive settings protected.</p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Session approvals</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Email new device alerts</p>
                <p className="text-sm text-gray-500">Get notified if someone signs in from a new device.</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </div>
        </div>
      );
    }

    if (role === "teacher") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Roster approvals</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Require confirmation</p>
                <p className="text-sm text-gray-500">Confirm before bulk marking absences.</p>
              </div>
              <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Live monitoring</Label>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Prompt before starting streams</p>
                <p className="text-sm text-gray-500">Avoid accidental camera activation.</p>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Exam season lock</Label>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Extra verification</p>
              <p className="text-sm text-gray-500">Require OTP before changing contact info during exams.</p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Device trust</Label>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium text-gray-900">Remember this device</p>
              <p className="text-sm text-gray-500">Skip re-verification for 30 days.</p>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Profile &amp; Settings</DialogTitle>
          <DialogDescription>
            Tailored preferences for your {role} workspace. Update your profile, security, and notification settings.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={roleBadge.tone}>{roleBadge.label}</Badge>
            {identifier && <Badge variant="outline">{identifier}</Badge>}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProfileTab)} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Campus / City" />
                </div>
              </div>

              {renderRoleSpecificProfile()}
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save profile</Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Change password</p>
                  <p className="text-sm text-gray-500">Keep your account secure with a strong password.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {renderRoleSpecificSecurity()}

              <div className="flex justify-end">
                <Button onClick={handlePasswordUpdate}>Update password</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">Choose how you stay updated.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email updates</p>
                    <p className="text-sm text-gray-500">Attendance summaries and alerts.</p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Push notifications</p>
                    <p className="text-sm text-gray-500">In-app announcements and reminders.</p>
                  </div>
                  <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">SMS alerts</p>
                    <p className="text-sm text-gray-500">Urgent alerts and attendance warnings.</p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value) => setTheme(value)}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Use system theme</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                {role === "student" ? <GraduationCap className="w-5 h-5 text-blue-600" /> : <Building2 className="w-5 h-5 text-blue-600" />}
                <div>
                  <p className="font-medium text-gray-900">Workspace preferences</p>
                  <p className="text-sm text-gray-500">
                    Customize the default dashboards you see after signing in.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Button variant="outline" className="justify-start gap-2">
                  <UserCog className="w-4 h-4" />
                  {role === "admin" ? "System overview" : role === "teacher" ? "Classes view" : "Attendance calendar"}
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {role === "admin" ? "Compliance digest" : role === "teacher" ? "Roster shortcuts" : "Exam alerts"}
                </Button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save preferences</Button>
            </div>
          </TabsContent>
        </Tabs>

        {message && <p className="text-sm text-blue-600 mt-2">{message}</p>}
      </DialogContent>
    </Dialog>
  );
}
