import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { LoginFormData } from "@/schemas/auth";
import { loginSchema } from "@/schemas/auth";
import type { UseMutationResult } from "@tanstack/react-query";
import type { AuthResponse } from "@/types/auth";

interface LoginFormProps {
  onSubmit: (values: LoginFormData) => void;
  mutation: UseMutationResult<AuthResponse, Error, LoginFormData>;
}

export function LoginForm({ onSubmit, mutation }: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
        {mutation.isError && (
          <div className="text-red-500 text-sm text-center">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Login failed"}
          </div>
        )}
      </form>
    </Form>
  );
}
