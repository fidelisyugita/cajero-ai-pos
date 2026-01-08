import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import Header from "@/components/dashboard/Header";
import ExpenseList from "@/components/expense/ExpenseList";
import Button from "@/components/ui/Button";
import { useRouter } from "expo-router";
import DateRangeModal from "@/components/report/DateRangeModal";
import { useAuthStore } from "@/store/useAuthStore";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import SearchBar from "@/components/ui/SearchBar";

const ExpenseScreen = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    // Default to last 7 days
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(6, 'day').toDate(),
        endDate: dayjs().toDate(),
    });

    const [showPicker, setShowPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <View style={$.container}>
            <Header>
                {/* // TODO: currently not work due to API not support
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search Expenses`}
                /> */}
                <Button
                    variant="secondary"
                    title={`${dayjs(dateRange.startDate).format("DD/MM/YYYY")} - ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`}
                    rightIcon={(size, color) => <Feather name="calendar" size={size} color={color} />}
                    onPress={() => setShowPicker(true)}
                    size="sm"
                />
                <Button
                    onPress={() => router.push("/expense/add")}
                    size="sm"
                    title={t("add_expense_title")}
                    variant="primary"
                    leftIcon={(size, color) => <Feather name="plus" size={size} color={color} />}
                />
            </Header>

            <DateRangeModal
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                onApply={(start, end) => setDateRange({ startDate: start, endDate: end })}
                initialStart={dateRange.startDate}
                initialEnd={dateRange.endDate}
                minDate={user?.createdAt ? new Date(user.createdAt) : undefined}
            />

            <View style={$.content}>
                <ExpenseList
                    startDate={dayjs(dateRange.startDate).format("YYYY-MM-DD")}
                    endDate={dayjs(dateRange.endDate).format("YYYY-MM-DD")}
                    searchQuery={searchQuery}
                />
            </View>
        </View>
    );
};

const $ = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.neutral[200],
    },

    content: {
        flex: 1,
        padding: theme.spacing.xl,
        paddingTop: 0,
    },
}));

export default ExpenseScreen;
