import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScanFace, Lock, User } from "lucide-react";
import { AuthPayload, loginUser } from "../lib/api";

import { cn } from "./ui/utils";

interface LoginPageProps {
  onLogin: (payload: AuthPayload) => void;
  onForgotPassword?: () => void;
}

export function LoginPage({ onLogin, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      setError("Email, password, and role are required");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const payload = await loginUser(email, password, role || undefined);
      onLogin(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-blue-100">
        <CardHeader className="space-y-4 pb-6">
          {/* Logo Placeholder */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ScanFace className="w-12 h-12 text-white" />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center space-y-2">
            <CardTitle className="text-blue-900">Face Recognition Attendance System</CardTitle>
            <CardDescription>Sign in to access your account</CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label htmlFor="role">Role (optional)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer select-none"
                >
                  Remember Me
                </Label>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => onForgotPassword?.()}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full bg-blue-600 hover:bg-blue-700",
                isLoading && "opacity-80 cursor-not-allowed"
              )}
              disabled={isLoading}
            >
              {isLoading ? "Checking credentials..." : "Login"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center pb-6">
          <p className="text-gray-500">
            Secure access powered by facial recognition
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
