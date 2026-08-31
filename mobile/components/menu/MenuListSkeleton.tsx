import { type FlashListProps, FlashList as ShopifyFlashList } from "@shopify/flash-list";
import { memo, type ReactElement } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { vs } from "@/utils/Scale";

// Workaround for missing estimatedItemSize in FlashList props type definition
const FlashList = ShopifyFlashList as unknown as <T>(
  props: FlashListProps<T> & { estimatedItemSize: number },
) => ReactElement;

const NUM_COLUMNS = 4;

const SKELETON_DATA = Array.from({ length: 16 }, (_, index) => ({
  id: index,
}));

const MenuListSkeleton = () => {
  return (
    <FlashList
      estimatedItemSize={200}
      data={SKELETON_DATA}
      keyExtractor={(item) => item.id.toString()}
      numColumns={NUM_COLUMNS}
      renderItem={() => <ProductCard />}
      showsVerticalScrollIndicator={false}
      style={$.container}
    />
  );
};

const ProductCard = memo(() => {
  return (
    <View style={$.productContainer}>
      <View style={$.productImage} />
      <View style={$.productInfoWrapper}>
        <View style={$.productName} />
        <View style={$.productPrice} />
      </View>
    </View>
  );
});

const $ = StyleSheet.create((theme) => ({
  container: {
    marginLeft: theme.spacing.xl,
    marginRight: theme.spacing.xs,
    paddingTop: vs(80),
  },
  listHeader: {
    marginBottom: theme.spacing.xxl,
  },
  productContainer: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    borderWidth: vs(1),
    borderColor: theme.colors.neutral[300],
    padding: theme.spacing.md,
    flexGrow: 1,
    marginRight: vs(20),
    marginBottom: vs(20),
  },
  productImage: {
    aspectRatio: 177 / 96,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral[300],
  },
  productInfoWrapper: {
    gap: theme.spacing.xs,
  },
  productName: {
    height: vs(24),
    width: vs(177),
    backgroundColor: theme.colors.neutral[300],
    borderRadius: theme.radius.sm,
  },
  productPrice: {
    height: vs(20),
    width: vs(150),
    backgroundColor: theme.colors.neutral[300],
    borderRadius: theme.radius.sm,
  },
}));

export default MenuListSkeleton;
