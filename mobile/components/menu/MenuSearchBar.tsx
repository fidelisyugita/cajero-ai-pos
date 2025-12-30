import { useState, useEffect } from "react";
import IcSearch from "@/assets/icons/search.svg";
import IcX from "@/assets/icons/x.svg";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import { useCategoryStore } from "@/store/useMenuCategoryStore";
import { vs } from "@/utils/Scale";
import { StyleSheet } from "react-native-unistyles";

const MenuSearchBar = () => {
	const { searchQuery, setSearchQuery } = useCategoryStore();
	const [localQuery, setLocalQuery] = useState(searchQuery);

	// Sync local query with store query when store updates (reset)
	useEffect(() => {
		setLocalQuery(searchQuery);
	}, [searchQuery]);

	// Debounce update to store
	useEffect(() => {
		const handler = setTimeout(() => {
			if (localQuery !== searchQuery) {
				setSearchQuery(localQuery);
			}
		}, 300);

		return () => {
			clearTimeout(handler);
		};
	}, [localQuery, searchQuery, setSearchQuery]);

	const isSearching = localQuery.length >= 2;

	return (
		<Input
			containerStyle={$.searchBar}
			placeholder="Search Menu"
			right={
				<IconButton
					Icon={isSearching ? IcX : IcSearch}
					size="sm"
					variant="neutral-no-stroke"
					onPress={() => {
						setLocalQuery("");
						setSearchQuery("");
					}}
				/>
			}
			size="md"
			value={localQuery}
			onChangeText={setLocalQuery}
		/>
	);
};

const $ = StyleSheet.create((theme) => ({
	searchBar: {
		width: "100%",
		maxWidth: vs(400),
	},
}));

export default MenuSearchBar;
