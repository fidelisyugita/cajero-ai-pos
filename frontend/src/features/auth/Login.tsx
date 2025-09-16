import { Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LoginFormData } from "@/schemas/auth";
import { LoginForm } from "./LoginForm";
import { useAuth } from "./AuthContext";
import { useLoginMutation } from "./hooks";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const loginMutation = useLoginMutation();

  const handleSubmit = async (values: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to login:", error);
    }
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
