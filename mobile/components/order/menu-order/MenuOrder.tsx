import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import IcArrowCircleRight from "../../../assets/icons/arrow-circle-right.svg";
import IcTable from "../../../assets/icons/table.svg";
import IcUser from "../../../assets/icons/user.svg";
import { vs } from "../../../utils/Scale";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ListOrder from "../list-order";
import { useOrderStore } from "@/store/useOrderStore";
import { t } from '@/services/i18n';

const today = dayjs().format("dddd, D MMMM YYYY");

const UniIcUser = withUnistyles(IcUser, (theme) => ({
	color: theme.colors.neutral[600],
}));

const UniIcTable = withUnistyles(IcTable, (theme) => ({
	color: theme.colors.neutral[600],
}));

const MenuOrder = () => {
	const router = useRouter();
	const customerName = useOrderStore((state) => state.customerName);
	const tableNumber = useOrderStore((state) => state.tableNumber);
	const setCustomerName = useOrderStore((state) => state.setCustomerName);
	const setTableNumber = useOrderStore((state) => state.setTableNumber);
	const items = useOrderStore((state) => state.items);

	const isValid = items.length > 0;

	return (
		<View style={$.container}>
			<View style={$.header}>
				<View style={$.headerContent}>
					<Text style={$.title}>{t("current_order")}</Text>
					<Text style={$.todayText}>{today}</Text>
				</View>
				<View style={$.customerOrderRow}>
					<Input
						containerStyle={$.customerNameField}
						left={<UniIcUser height={vs(20)} width={vs(20)} />}
						placeholder={t("customer_name")}
						size="sm"
						value={customerName}
						onChangeText={setCustomerName}
					/>
					<Input
						containerStyle={$.tableNumberField}
						keyboardType="numeric"
						left={<UniIcTable height={vs(20)} width={vs(20)} />}
						maxLength={3}
						size="sm"
						value={tableNumber}
						onChangeText={setTableNumber}
					/>
				</View>
			</View>

			<ListOrder />

			<View style={$.footer}>
				<Button
					disabled={!isValid}
					leftIcon={(size, color) => (
						<IcArrowCircleRight color={color} height={size} width={size} />
					)}
					size="md"
					title={t("proceed")}
					variant="primary"
					onPress={() => {
						router.push("/payment");
					}}
				/>
			</View>
		</View>
	);
};

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		backgroundColor: theme.colors.neutral[100],
		paddingTop: rt.insets.top,
		width: vs(338),
		zIndex: 10,
		gap: vs(20),
		//shadow
		shadowColor: "#000",
		shadowOffset: { height: 0, width: 0 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	header: {
		paddingHorizontal: theme.spacing.xl,
		gap: vs(20),
	},
	headerContent: {
		gap: vs(6),
	},
	customerOrderRow: {
		flexDirection: "row",
		gap: theme.spacing.md,
	},
	title: {
		...theme.typography.heading3,
		color: theme.colors.neutral[700],
	},
	todayText: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[600],
	},
	customerNameField: {
		flex: 1,
	},
	tableNumberField: {
		width: "27.5%",
	},
	footer: {
		backgroundColor: theme.colors.neutral[100],
		paddingHorizontal: theme.spacing.xl,
		paddingTop: theme.spacing.md,
		paddingBottom: theme.spacing.xl,
		borderTopColor: theme.colors.neutral[300],
		borderTopWidth: vs(1),
		position: "absolute",
		bottom: 0,
		width: "100%",
	},
}));

export default MenuOrder;
