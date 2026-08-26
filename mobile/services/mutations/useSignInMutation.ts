import { useMutation } from "@tanstack/react-query";
import { postSignInOwner, postSignInStaff } from "@/services/endpoints/postSignIn";
import type { SignInOwnerRequest, SignStaffInRequest } from "@/services/types/Auth";

export const useSignInOwnerMutation = () => {
  return useMutation({
    mutationFn: (data: SignInOwnerRequest) => postSignInOwner(data),
  });
};

export const useSignInStaffMutation = () => {
  return useMutation({
    mutationFn: (data: SignStaffInRequest) => postSignInStaff(data),
  });
};
