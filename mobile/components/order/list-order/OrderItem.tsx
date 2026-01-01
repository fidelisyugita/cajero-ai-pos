import { Entypo } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import IcEdit from "@/assets/icons/edit.svg";
import IcTrash from "@/assets/icons/trash.svg";
import Button from "@/components/ui/Button";
import type { OrderItem as OrderItemType } from "@/store/useOrderStore";
import { formatCurrency } from "@/utils/Format";
import { vs } from "@/utils/Scale";

interface OrderItemProps {
	item: OrderItemType;
	index: number;
	isExpanded: boolean;
	onToggle: () => void;
	onRemove: () => void;
	onEdit: () => void;
}

const OrderItem = ({
	item,
	index,
	isExpanded,
	onToggle,
	onRemove,
	onEdit,
}: OrderItemProps) => {
	const variantsTotal = item.variants.reduce((sum, v) => sum + (Number(v.price) || 0), 0);
	const unitPrice = Number(item.sellingPrice || 0) + variantsTotal;
	// Calculate total price: (unitPrice - discount?) * quantity.
	// But discount in store model is simple number.
	// We'll assume discount is total discount for the line item for now, or per unit.
	// "Discount ... Rp 3.500" implies a fixed amount OFF.
	// Let's assume item.discount is total discount for this line item.
	const subtotal = unitPrice * (Number(item.quantity) || 1);

	const discountVal = Number(item.discount || 0);
	const discountStr = discountVal > 0
		? `- ${formatCurrency(discountVal)}`
		: null;
	const finalPrice = subtotal - discountVal;

	return (
		<View style={[$.container, isExpanded && $.expandedContainer]}>
			<TouchableOpacity
				style={$.header}
				onPress={onToggle}
				activeOpacity={0.7}
			>
				<View style={$.left}>
					<Entypo
						name={isExpanded ? "chevron-down" : "chevron-right"}
						size={vs(20)}
						color="#666"
					/>
					<Text style={$.quantity} adjustsFontSizeToFit numberOfLines={1}>
						{item.quantity}
					</Text>
					<Text style={$.name} numberOfLines={1} adjustsFontSizeToFit>
						{item.name}
					</Text>
				</View>
				<Text style={$.price}>{formatCurrency(finalPrice)}</Text>
			</TouchableOpacity>

			{isExpanded && (
				<View style={$.details}>
					{/* Variants */}
					{item.variants.length > 0 && (
						<View style={$.variantsList}>
							{item.variants.map((v, i) => (
								<View key={i} style={$.variantRow}>
									<Text style={$.variantName}>
										{v.groupName}: {v.name}
									</Text>
									{v.price > 0 && (
										<Text style={$.variantPrice}>
											{formatCurrency(v.price)}
										</Text>
									)}
								</View>
							))}
						</View>
					)}

					{/* Note */}
					{item.note && (
						<Text style={$.note} numberOfLines={2}>
							{item.note}
						</Text>
					)}

					{/* Discount */}
					{item.discount ? (
						<View style={$.discountRow}>
							<Text style={$.discountLabel}>Discount</Text>
							<Text style={$.discountValue}>{discountStr}</Text>
						</View>
					) : null}

					{/* Actions */}
					<View style={$.actions}>
						<Button
							title="Edit"
							variant="positive"
							size="sm"
							leftIcon={(size, color) => (
								<IcEdit width={size} height={size} color={color} />
							)}
							onPress={onEdit}
							style={$.actionButton}
						/>
						<Button
							title="Remove"
							variant="warning"
							size="sm"
							leftIcon={(size, color) => (
								<IcTrash width={size} height={size} color={color} />
							)}
							onPress={onRemove}
							style={$.actionButton}
						/>
					</View>
				</View>
			)}
		</View>
	);
};

const $ = StyleSheet.create((theme) => ({
	container: {
		paddingVertical: theme.spacing.md,
		paddingHorizontal: theme.spacing.md,
		borderRadius: theme.radius.md,
		backgroundColor: theme.colors.neutral[100],
		borderWidth: 1,
		borderColor: theme.colors.neutral[200],
		marginBottom: theme.spacing.sm,
	},
	expandedContainer: {
		backgroundColor: theme.colors.neutral[100],
		borderColor: theme.colors.primary[200],
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: theme.spacing.sm,
	},
	left: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.sm,
		flex: 1,
	},
	quantity: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
		width: vs(24),
		textAlign: "center",
	},
	name: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
		flex: 1,
	},
	price: {
		...theme.typography.heading5,
		color: theme.colors.neutral[700],
	},
	details: {
		marginTop: theme.spacing.md,
		paddingLeft: vs(34), // Indent to align with text
		gap: theme.spacing.sm,
	},
	variantsList: {
		gap: theme.spacing.xs,
	},
	variantRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	variantName: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[500],
	},
	variantPrice: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[500],
	},
	note: {
		...theme.typography.bodySm,
		color: theme.colors.neutral[600],
		fontStyle: "italic",
	},
	discountRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	discountLabel: {
		...theme.typography.bodySm,
		color: theme.colors.primary[400],
	},
	discountValue: {
		...theme.typography.bodySm,
		color: theme.colors.primary[400],
	},
	actions: {
		flexDirection: "row",
		gap: theme.spacing.md,
		marginTop: theme.spacing.sm,
	},
	actionButton: {
		flex: 1,
	},
}));

export default OrderItem;
