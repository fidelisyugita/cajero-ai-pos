import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
  });
}
