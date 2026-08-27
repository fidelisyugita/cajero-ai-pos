import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcEyeClose from "@/assets/icons/eye-fill-close.svg";
import IcEyeOpen from "@/assets/icons/eye-fill-open.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import alertService from "@/services/AlertService";
import { getStore } from "@/services/endpoints/getStore";
import { t } from "@/services/i18n";
import Logger from "@/services/logger";
import { useSignInOwnerMutation } from "@/services/mutations/useSignInMutation";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/useBusinessStore";
import { useLoadingStore } from "@/store/useLoadingStore";
import { vs } from "@/utils/Scale";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signInSchema = z.object({
  email: z
    .string()
    .min(1, t("email_required"))
    .refine((v) => emailRegex.test(v), {
      message: t("email_invalid"),
    })
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, t("password_required")).min(6, t("password_min_length")),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const router = useRouter();
  const { mutateAsync: signInMutate } = useSignInOwnerMutation();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { showLoading, hideLoading } = useLoadingStore();

  const {
    control,
    formState: { errors },
    handleSubmit,
    setFocus,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSignIn = async (data: SignInFormData) => {
    showLoading();
    try {
      const result = await signInMutate({
        email: data.email,
        password: data.password,
      });

      useAuthStore.setState({ user: result, isLoggedIn: true });

      if (result.storeId) {
        const store = await getStore(result.storeId);
        useBusinessStore.getState().setBusiness(store);
      }

      router.replace("/(dashboard)");
    } catch (error) {
      Logger.warn("Sign in failed:", error);
      alertService.error(t("sign_in_failed"), t("incorrect_email_or_password"));
    } finally {
      hideLoading();
    }
  };

  const IcEye = isPasswordVisible ? IcEyeOpen : IcEyeClose;

  return (
    <>
      <View style={$.formContainer}>
        <Controller
          control={control}
          name="email"
          render={({ field: { ref, onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              defaultValue={value}
              disableFullscreenUI={true}
              error={errors.email?.message}
              inputMode="email"
              keyboardType="email-address"
              label={t("email")}
              maxLength={60}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => {
                setFocus("password");
              }}
              ref={ref}
              returnKeyType="next"
              size="lg"
              testID="email-input"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { ref, onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              defaultValue={value}
              disableFullscreenUI={true}
              error={errors.password?.message}
              label={t("password")}
              maxLength={100}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={handleSubmit(onSignIn)}
              ref={ref}
              returnKeyType="done"
              right={
                <IconButton
                  Icon={IcEye}
                  onPress={() => setIsPasswordVisible((p) => !p)}
                  size="md"
                  variant="neutral-no-stroke"
                />
              }
              secureTextEntry={!isPasswordVisible}
              size="lg"
              testID="password-input"
            />
          )}
        />
      </View>

      <View style={$.buttonWrapper}>
        <Button
          onPress={handleSubmit(onSignIn)}
          size="lg"
          testID="sign-in-button"
          title={t("sign_in")}
          variant="primary"
        />
      </View>
    </>
  );
};

const $ = StyleSheet.create((theme) => ({
  formContainer: {
    gap: vs(16),
    width: "100%",
  },
  buttonWrapper: {
    gap: theme.spacing.md,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: vs(20),
  },
  separatorLine: {
    width: vs(120),
    height: vs(1),
    backgroundColor: theme.colors.neutral[300],
  },
  or: {
    ...theme.typography.bodyLg,
    color: theme.colors.neutral[600],
  },
}));

export default SignInForm;
