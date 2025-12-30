import { View, Text, Modal, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { t } from "@/services/i18n";

interface DateRangeModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (start: Date, end: Date) => void;
    initialStart: Date;
    initialEnd: Date;
    minDate?: Date | null;
}

const DateRangeModal = ({ visible, onClose, onApply, initialStart, initialEnd, minDate }: DateRangeModalProps) => {
    const { theme } = useUnistyles();
    // We use a range object for react-native-ui-datepicker
    const [range, setRange] = useState<{ startDate: DateType; endDate: DateType }>({
        startDate: dayjs(initialStart),
        endDate: dayjs(initialEnd)
    });

    useEffect(() => {
        if (visible) {
            setRange({
                startDate: dayjs(initialStart),
                endDate: dayjs(initialEnd)
            });
        }
    }, [visible, initialStart, initialEnd]);

    const handleApply = () => {
        if (range.startDate && range.endDate) {
            onApply(dayjs(range.startDate as any).toDate(), dayjs(range.endDate as any).toDate());
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={$.overlay} onPress={onClose}>
                <Pressable style={$.container} onPress={(e) => e.stopPropagation()}>
                    <View style={$.header}>
                        <Text style={$.title}>{t("select_date_range")}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View style={$.dateDisplayContainer}>
                        <View style={$.dateBox}>
                            <Text style={$.dateLabel}>Start Date</Text>
                            <Text style={$.dateValue}>
                                {range.startDate ? dayjs(range.startDate as any).format("DD MMM YYYY") : "-"}
                            </Text>
                        </View>
                        <Feather name="arrow-right" size={20} color="#666" />
                        <View style={$.dateBox}>
                            <Text style={$.dateLabel}>End Date</Text>
                            <Text style={$.dateValue}>
                                {range.endDate ? dayjs(range.endDate as any).format("DD MMM YYYY") : "-"}
                            </Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={$.content}>
                        <DateTimePicker
                            mode="range"
                            startDate={range.startDate}
                            endDate={range.endDate}
                            onChange={(params) => setRange(params)}
                            minDate={minDate ? dayjs(minDate) : undefined}
                            styles={{
                                selected: { backgroundColor: theme.colors.pressed[1] },
                                range_start: { backgroundColor: theme.colors.pressed[1] },
                                range_end: { backgroundColor: theme.colors.pressed[1] },
                                range_middle: { backgroundColor: theme.colors.pressed[1] }, // Added based on user request to color in-between dates
                                month_selector_label: { color: theme.colors.neutral[700] },
                                year_selector_label: { color: theme.colors.neutral[700] },
                                weekday_label: { color: theme.colors.neutral[500] },
                                day_label: { color: theme.colors.neutral[700] },
                            }}
                        />
                    </ScrollView>

                    <View style={$.footer}>
                        <Button
                            title={t("apply")}
                            onPress={handleApply}
                            variant="primary"
                            size="md"
                            style={{ width: '100%' }}
                            disabled={!range.startDate || !range.endDate}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const $ = StyleSheet.create((theme) => ({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        borderRadius: theme.radius.lg,
        width: '90%',
        maxWidth: 400,
        maxHeight: '90%', // Ensure it fits on small screens
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
    },
    title: {
        ...theme.typography.heading3,
        fontWeight: 'bold',
    },
    dateDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.neutral[100],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.neutral[200],
    },
    dateBox: {
        flex: 1,
        alignItems: 'center',
    },
    dateLabel: {
        ...theme.typography.labelSm,
        color: theme.colors.neutral[500],
        marginBottom: 4,
    },
    dateValue: {
        ...theme.typography.bodyMd,
        fontWeight: 'bold',
        color: theme.colors.neutral[700],
    },
    content: {
        padding: theme.spacing.md,
        backgroundColor: 'white',
    },
    footer: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
    },
}));

export default DateRangeModal;
