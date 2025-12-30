import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import { vs } from "@/utils/Scale";
import AuthLayout from "../../components/auth/AuthLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import Button from "../../components/ui/Button";

const SignUpScreen = () => {
	const router = useRouter();

	return (
		<AuthLayout>
			<AuthLayout.Main title={t("sign_up")}>
				<SignUpForm />
			</AuthLayout.Main>
			<AuthLayout.Intro position="right">
				<Button
					accessibilityLabel={t("go_to_sign_in")}
					accessibilityRole="button"
					onPress={() => {
						router.replace("/(auth)/sign-in");
					}}
					size="lg"
					style={$.signButton}
					title={t("sign_in")}
					variant="secondary"
				/>
			</AuthLayout.Intro>
		</AuthLayout>
	);
};

const $ = StyleSheet.create({
	signButton: {
		minWidth: vs(200),
	},
});

export default SignUpScreen;
