import { useState, useEffect } from "react";
import IcSearch from "@/assets/icons/search.svg";
import IcX from "@/assets/icons/x.svg";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import { StyleSheet } from "react-native-unistyles";
import { ViewStyle, StyleProp } from "react-native";
import { vs } from "@/utils/Scale";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const SearchBar = ({ value, onChangeText, placeholder = "Search", containerStyle }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value when prop updates (e.g. clear)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce update to parent
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue, value, onChangeText]);
  const isSearching = localValue.length > 0;

  return (
    <Input
      containerStyle={[$.searchBar, containerStyle]}
      placeholder={placeholder}
      right={
        <IconButton
          Icon={isSearching ? IcX : IcSearch}
          size="sm"
          variant="neutral-no-stroke"
          onPress={() => {
            if (isSearching) {
              setLocalValue("");
              onChangeText("");
            }
          }}
        />
      }
      size="md"
      value={localValue}
      onChangeText={setLocalValue}
    />
  );
};

const $ = StyleSheet.create((theme) => ({
  searchBar: {
    width: vs(400),
  },
}));

export default SearchBar;
