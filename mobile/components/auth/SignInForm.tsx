import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcEyeClose from "@/assets/icons/eye-fill-close.svg";
import IcEyeOpen from "@/assets/icons/eye-fill-open.svg";
import alertService from "../../services/AlertService";
import { t } from "../../services/i18n";
import { useSignInOwnerMutation } from "../../services/mutations/useSignInMutation";
import { useAuthStore } from "../../store/useAuthStore";
import { useLoadingStore } from "../../store/useLoadingStore";
import { vs } from "../../utils/Scale";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Input from "../ui/Input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signInSchema = z.object({
  email: z
    .string()
    .min(1, t("email_required"))
    .refine((v) => emailRegex.test(v), {
      message: t("email_invalid"),
    })
    .transform((v) => v.toLowerCase()),
  password: z
    .string()
    .min(1, t("password_required"))
    .min(6, t("password_min_length")),
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
        const { getStore } = await import("@/services/endpoints/getStore");
        const { useBusinessStore } = await import("@/store/useBusinessStore");
        const store = await getStore(result.storeId);
        useBusinessStore.getState().setBusiness(store);
      }

      router.replace("/(dashboard)");
    } catch (error) {
      console.error("Sign in failed:", error);
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
          rules={{
            required: true,
          }}
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
          rules={{
            required: true,
          }}
        />
        {/* <Button size="md" title="Forgot Password?" variant="link" /> */}
      </View>

      <View style={$.buttonWrapper}>
        <Button
          onPress={handleSubmit(onSignIn)}
          size="lg"
          testID="sign-in-button"
          title={t("sign_in")}
          variant="primary"
        />

        {/* <View style={$.separatorContainer}>
          <View style={$.separatorLine} />
          <Text style={$.or}>{t("or")}</Text>
          <View style={$.separatorLine} />
        </View>

        <Button
          isLoading={false}
          leftIcon={() => <IcGoogle height={vs(24)} width={vs(24)} />}
          onPress={() => onGoogleSignIn()}
          size="lg"
          title={t("sign_in_google")}
          variant="secondary"
        /> */}
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
