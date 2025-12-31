import { Text, View } from "react-native";
import {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import Header from "@/components/dashboard/Header";
import CategoryFilter from "@/components/menu/CategoryFilter";
import MenuList from "@/components/menu/MenuList";
import { vs } from "@/utils/Scale";
import MenuOrder from "@/components/order/menu-order";
import MenuSearchBar from "@/components/menu/MenuSearchBar";

/**
 * 
 * TODO
 * implement store settings maybe update API & DB, to have special_code for limit view all report/receipt
 */
const MenuScreen = () => {
	return (
		<View style={$.container}>
			<View style={$.content}>
				<Header>
					<MenuSearchBar />
				</Header>
				<MenuContent />
			</View>
			<MenuOrder />
		</View>
	);
};

const HEADER_HEIGHT = 80;

const MenuContent = () => {
	const scrollY = useSharedValue(0);

	const scrollHandler = (event: any) => {
		scrollY.value = event.nativeEvent.contentOffset.y;
	};

	const categoryFilterStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollY.value,
						[0, HEADER_HEIGHT],
						[0, -HEADER_HEIGHT],
						"clamp",
					),
				},
			],
		};
	});

	return (
		<View style={$.content}>
			<CategoryFilter style={categoryFilterStyle} />
			<MenuList scrollHandler={scrollHandler} />
		</View>
	);
};

const $ = StyleSheet.create((theme, rt) => ({
	container: {
		flex: 1,
		flexDirection: "row",
		backgroundColor: theme.colors.neutral[200],
	},
	content: {
		flex: 1,
	},
	orderContainer: {
		width: vs(338),
		shadowColor: "#000",
		shadowOffset: { height: 0, width: 0 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
		backgroundColor: theme.colors.neutral[100],
	},
}));

export default MenuScreen;
