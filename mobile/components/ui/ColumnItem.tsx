import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export interface ColumnItemProps extends PropsWithChildren {
	index: number;
	numColumns: number;
	gap: number;
}

const ColumnItem = ({ index, numColumns, gap, children }: ColumnItemProps) => {
	const marginLeft = ((index % numColumns) / (numColumns - 1)) * gap;
	const marginRight = gap - marginLeft;

	return <View style={$.container(marginLeft, marginRight)}>{children}</View>;
};

const $ = StyleSheet.create({
	container: (marginLeft: number, marginRight: number) => ({
		flexGrow: 1,
		width: "100%",
		marginLeft,
		marginRight,
	}),
});

export default ColumnItem;
