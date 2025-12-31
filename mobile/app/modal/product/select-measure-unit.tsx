import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { memo, useEffect } from "react";
import { t } from "@/services/i18n";
import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useShallow } from "zustand/react/shallow";
import IcPlus from "@/assets/icons/plus.svg";
import IcX from "@/assets/icons/x.svg";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import RadioButton from "@/components/ui/RadioButton";
import Input from "@/components/ui/Input";
import ScreenModal from "@/components/ui/ScreenModal";
import { useMeasureUnitStore } from "@/store/useMeasureUnitStore";
import { type MeasureUnit } from "@/services/types/MeasureUnit";
import { useMeasureUnitsQuery } from "@/services/queries/useMeasureUnitsQuery";
import { useCreateMeasureUnitMutation } from "@/services/mutations/useCreateMeasureUnitMutation";
import { vs } from "@/utils/Scale";

interface MeasureUnitItemProps {
	item: MeasureUnit;
}

const SelectMeasureUnitModal = () => {
	const router = useRouter();
	const { code, name } = useLocalSearchParams() as {
		code: string;
		name: string;
	};

	const { hasSelected, saveMeasureUnit, reset } = useMeasureUnitStore(
		useShallow((s) => ({
			hasSelected: !!s.selectedMeasureUnit,
			saveMeasureUnit: s.saveMeasureUnit,
			reset: s.reset,
		})),
	);

	useEffect(() => {
		if (code && name) {
			useMeasureUnitStore.setState((p) => ({
				selectedMeasureUnit: p.selectedMeasureUnit ?? {
					code,
					name,
				},
			}));
		}
	}, [code, name]);

	return (
		<ScreenModal modalStyle={$.modal}>
			<ScreenModal.Header title={t("select_measure_unit")} />
			<ScreenModal.Body>
				<View style={$.container}>
					<AddMeasureUnit />
					<MeasureUnitList />
				</View>
			</ScreenModal.Body>
			<ScreenModal.Footer>
				<Button
					onPress={() => {
						reset();
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("cancel")}
					variant="secondary"
				/>
				<Button
					disabled={!hasSelected}
					onPress={() => {
						saveMeasureUnit();
						router.dismiss();
					}}
					size="md"
					style={$.flex}
					title={t("select")}
					variant="primary"
				/>
			</ScreenModal.Footer>
		</ScreenModal>
	);
};

const AddMeasureUnit = () => {
	const { newMeasureUnitName, setNewMeasureUnitName, newMeasureUnitCode, setNewMeasureUnitCode } = useMeasureUnitStore();
	const { mutate: createMeasureUnit, isPending } = useCreateMeasureUnitMutation();

	const handleAdd = () => {
		if (!newMeasureUnitName || !newMeasureUnitCode) return;
		createMeasureUnit(
			{
				name: newMeasureUnitName,
				code: newMeasureUnitCode,
				description: "",
			},
			{
				onSuccess: () => {
					setNewMeasureUnitName("");
					setNewMeasureUnitCode("");
				},
			},
		);
	};

	return (
		<View style={$.addMeasureUnitContainer}>
			<Text style={$.addMeasureUnitTitle}>{t("add_measure_unit")}</Text>
			<View style={$.addMeasureUnitRow}>
				<Input
					containerStyle={$.addMeasureUnitInput}
					defaultValue={newMeasureUnitCode}
					label={`${t("code")} (PCS)`}
					maxLength={10}
					onChangeText={setNewMeasureUnitCode}
					size="lg"
				/>
				<Input
					containerStyle={$.addMeasureUnitInput}
					defaultValue={newMeasureUnitName}
					label={`${t("name")} (Pieces)`}
					maxLength={60}
					onChangeText={setNewMeasureUnitName}
					size="lg"
				/>
				<IconButton
					disabled={!newMeasureUnitName || !newMeasureUnitCode || isPending}
					Icon={IcPlus}
					onPress={handleAdd}
					size="lg"
					variant="primary"
				/>
			</View>
		</View>
	);
};

const MeasureUnitList = () => {
	const { data: measureUnits } = useMeasureUnitsQuery();

	return (
		<View style={$.flex}>
			<FlashList
				data={measureUnits}
				ItemSeparatorComponent={() => <View style={$.listSeparator} />}
				keyExtractor={(item) => item.code}
				ListHeaderComponent={
					<Text style={$.listTitle}>{t("list_of_measure_unit")}</Text>
				}
				ListHeaderComponentStyle={$.listHeader}
				renderItem={({ item }) => <MeasureUnitItem item={item} />}
			/>
		</View>
	);
};

const MeasureUnitItem = memo(({ item }: MeasureUnitItemProps) => {
	const checked = useMeasureUnitStore(
		(s) => s.selectedMeasureUnit?.code === item.code,
	);

	const onCheck = () => {
		useMeasureUnitStore.setState({
			selectedMeasureUnit: {
				name: item.name,
				code: item.code,
			},
		});
	};

	return (
		<View style={$.measureUnitItemContainer}>
			<TouchableOpacity onPress={onCheck} style={$.measureUnitItemRow}>
				<RadioButton checked={checked} onPress={onCheck} />
				<Text style={$.measureUnitItemText}>{item.name} ({item.code})</Text>
			</TouchableOpacity>
			{/* <IconButton Icon={IcX} size="md" variant="neutral-no-stroke" /> */}
		</View>
	);
});
MeasureUnitItem.displayName = "MeasureUnitItem";

const $ = StyleSheet.create((theme) => ({
	modal: {
		// aspectRatio: 649 / 874,
		width: vs(649),
		height: "90%",
	},
	flex: {
		flex: 1,
	},
	container: {
		padding: theme.spacing.xl,
		gap: theme.spacing.xxl,
		flex: 1,
	},
	addMeasureUnitContainer: {
		gap: vs(20),
	},
	addMeasureUnitTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	addMeasureUnitRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: vs(20),
	},
	addMeasureUnitInput: {
		flex: 1,
	},
	listTitle: {
		...theme.typography.heading4,
		color: theme.colors.neutral[700],
	},
	measureUnitItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: vs(20),
	},
	measureUnitItemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.spacing.lg,
		flex: 1,
	},
	measureUnitItemText: {
		...theme.typography.bodyLg,
		color: theme.colors.neutral[700],
	},
	listSeparator: {
		marginBottom: theme.spacing.sm,
	},
	listHeader: {
		marginBottom: vs(20),
	},
}));

export default SelectMeasureUnitModal;
