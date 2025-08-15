import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import type { LoginFormData } from "@/schemas/auth";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const loginMutation = useLoginMutation();

  const handleSubmit = (values: LoginFormData) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        login(data);
      },
      onError: (error) => {
        console.error("Login error:", error);
      },
    });
  };

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} mutation={loginMutation} />
        </CardContent>
      </Card>
    </div>
  );
}
