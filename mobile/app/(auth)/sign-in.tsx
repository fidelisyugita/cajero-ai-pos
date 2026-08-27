import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/SignInForm";
import { t } from "@/services/i18n";

const SignInScreen = () => {
  return (
    <AuthLayout>
      <AuthLayout.Intro position="left" />
      <AuthLayout.Main title={t("sign_in")}>
        <SignInForm />
      </AuthLayout.Main>
    </AuthLayout>
  );
};

export default SignInScreen;
