import { useRouter } from "expo-router";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import { vs } from "@/utils/Scale";
import AuthLayout from "../../components/auth/AuthLayout";
import SignInForm from "../../components/auth/SignInForm";
import Button from "../../components/ui/Button";

const SignInScreen = () => {
	const router = useRouter();

	return (
		<AuthLayout>
			<AuthLayout.Intro position="left">
				{/* <Button
					accessibilityLabel={t("go_to_sign_up")}
					accessibilityRole="button"
					onPress={() => {
						router.replace("/(auth)/sign-up");
					}}
					size="lg"
					style={$.signButton}
					title={t("sign_up")}
					variant="secondary"
				/> */}
			</AuthLayout.Intro>
			<AuthLayout.Main title={t("sign_in")}>
				<SignInForm />
			</AuthLayout.Main>
		</AuthLayout>
	);
};

const $ = StyleSheet.create({
	signButton: {
		minWidth: vs(200),
	},
});

export default SignInScreen;
