import { useRouter } from "expo-router";
import { type StyleProp, Text, View, type ViewStyle, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcX from "@/assets/icons/x.svg";
import { vs } from "@/utils/Scale";
import IconButton from "@/components/ui/IconButton";

interface ScreenModalProps {
	modalStyle?: StyleProp<ViewStyle>;
	children: React.ReactNode;
}

interface ScreenModalHeaderProps {
	title: string;
	hideCloseButton?: boolean;
}
interface ScreenModalBodyProps {
	children: React.ReactNode;
}

interface ScreenModalFooterProps {
	children: React.ReactNode;
}

const ScreenModal = ({ modalStyle, children }: ScreenModalProps) => {
	const router = useRouter();
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={$.keyboardAvoidingView}
		>
			<View style={$.container}>
				<Pressable style={$.backdrop} onPress={() => router.dismiss()} />
				<View style={[$.modal, modalStyle]}>
					{children}
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};

const Header = ({ title, hideCloseButton }: ScreenModalHeaderProps) => {
	const router = useRouter();
	return (
		<View style={$.header}>
			<Text style={$.modalTitle}>{title}</Text>

			{!hideCloseButton && (
				<IconButton
					Icon={IcX}
					onPress={() => router.dismiss()}
					size="sm"
					variant="neutral-no-stroke"
				/>
			)}
		</View>
	);
};

const Body = ({ children }: ScreenModalBodyProps) => {
	return <View style={$.body}>{children}</View>;
};

const Footer = ({ children }: ScreenModalFooterProps) => {
	return <View style={$.footer}>{children}</View>;
};

ScreenModal.Header = Header;
ScreenModal.Body = Body;
ScreenModal.Footer = Footer;

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: theme.colors.transparentModal,
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	modal: {
		backgroundColor: theme.colors.neutral[200],
		borderRadius: theme.radius.xl,
		overflow: "hidden",
		zIndex: 1,
	},
	header: {
		backgroundColor: theme.colors.primary[100],
		minHeight: vs(66),
		paddingLeft: theme.spacing.xl,
		paddingRight: theme.spacing.lg,
		justifyContent: "space-between",
		flexDirection: "row",
		alignItems: "center",
		gap: vs(20),
	},
	modalTitle: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	footer: {
		borderTopWidth: vs(1),
		borderTopColor: theme.colors.neutral[300],
		backgroundColor: theme.colors.neutral[100],
		padding: theme.spacing.xl,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: theme.spacing.lg,
	},
	body: {
		flex: 1,
	},
}));

export default ScreenModal;
