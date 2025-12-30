import { useState } from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { t } from "@/services/i18n";
import Header from "@/components/dashboard/Header";
import ReceiptsList from "@/components/receipt/ReceiptsList";
import DraftList from "@/components/receipt/DraftList";
import TabButton from "@/components/ui/TabButton";
import DateRangeModal from "@/components/report/DateRangeModal";
import { useAuthStore } from "@/store/useAuthStore";
import dayjs from "dayjs";
import Button from "@/components/ui/Button";
import SegmentedControl from "@/components/ui/SegmentedControl";
import SearchBar from "@/components/ui/SearchBar";
import { Feather } from "@expo/vector-icons";

const ReceiptScreen = () => {
    const [activeTab, setActiveTab] = useState<"Transactions" | "Drafts">("Transactions");
    const user = useAuthStore((state) => state.user);

    // Default to current month
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf('month').toDate(),
        endDate: dayjs().endOf('month').toDate(),
    });

    const [showPicker, setShowPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <View style={$.container}>
            <Header>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search ${activeTab}`}
                />
                <SegmentedControl
                    options={[
                        { label: t("transactions"), value: "Transactions" },
                        { label: t("drafts"), value: "Drafts" },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                />

                {activeTab === "Transactions" && (
                    <Button
                        variant="secondary"
                        title={`${dayjs(dateRange.startDate).format("DD/MM/YYYY")} - ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`}
                        rightIcon={(size, color) => <Feather name="calendar" size={size} color={color} />}
                        onPress={() => setShowPicker(true)}
                        size="sm"
                    />
                )}
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
                {activeTab === "Transactions" ? (
                    <ReceiptsList
                        startDate={dayjs(dateRange.startDate).format("YYYY-MM-DD")}
                        endDate={dayjs(dateRange.endDate).format("YYYY-MM-DD")}
                        searchQuery={searchQuery}
                    />
                ) : (
                    <DraftList searchQuery={searchQuery} />
                )}
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

export default ReceiptScreen;
