import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import IcEyeClose from "@/assets/icons/eye-fill-close.svg";
import IcEyeOpen from "@/assets/icons/eye-fill-open.svg";
import IcGoogle from "@/assets/icons/google.svg";
import { t } from "../../services/i18n";
import { vs } from "../../utils/Scale";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Input from "../ui/Input";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, t("full_name_required"))
      .max(100, t("full_name_max_length")),
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
    confirmPassword: z.string().min(1, t("confirm_password_required")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t("passwords_do_not_match"),
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    setFocus,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSignUp = async (data: SignUpFormData) => {
    // Implement sign-up logic here
  };

  const onGoogleSignUp = async () => {
    // Handle Google sign-in logic here
  };

  const IcEye = isPasswordVisible ? IcEyeOpen : IcEyeClose;
  const IcConfirmEye = isConfirmPasswordVisible ? IcEyeOpen : IcEyeClose;

  return (
    <>
      <View style={$.formContainer}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { ref, onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              defaultValue={value}
              disableFullscreenUI={true}
              error={errors.fullName?.message}
              inputMode="text"
              keyboardType="default"
              label={t("full_name")}
              maxLength={100}
              onBlur={onBlur}
              onChangeText={onChange}
              onSubmitEditing={() => {
                setFocus("email");
              }}
              ref={ref}
              returnKeyType="next"
              size="lg"
            />
          )}
          rules={{
            required: true,
          }}
        />

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
              onSubmitEditing={() => {
                setFocus("confirmPassword");
              }}
              ref={ref}
              returnKeyType="next"
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
            />
          )}
          rules={{
            required: true,
          }}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { ref, onChange, onBlur, value } }) => (
            <Input
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              defaultValue={value}
              disableFullscreenUI={true}
              error={errors.confirmPassword?.message}
              label={t("confirm_password")}
              maxLength={100}
              onBlur={onBlur}
              onChangeText={onChange}
              ref={ref}
              returnKeyType="done"
              right={
                <IconButton
                  Icon={IcConfirmEye}
                  onPress={() => setIsConfirmPasswordVisible((p) => !p)}
                  size="md"
                  variant="neutral-no-stroke"
                />
              }
              secureTextEntry={!isConfirmPasswordVisible}
              size="lg"
            />
          )}
          rules={{
            required: true,
          }}
        />
      </View>

      <View style={$.buttonWrapper}>
        <Button
          onPress={handleSubmit(onSignUp)}
          size="lg"
          title={t("sign_up")}
          variant="primary"
        />

        <View style={$.separatorContainer}>
          <View style={$.separatorLine} />
          <Text style={$.or}>{t("or")}</Text>
          <View style={$.separatorLine} />
        </View>

        <Button
          isLoading={false}
          leftIcon={() => <IcGoogle height={vs(24)} width={vs(24)} />}
          onPress={() => onGoogleSignUp()}
          size="lg"
          title={t("sign_up_google")}
          variant="secondary"
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

export default SignUpForm;
