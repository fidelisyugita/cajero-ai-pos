import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import RadioButton from "@/components/ui/RadioButton";
import { Image } from "expo-image";
import { useLanguageStore } from "@/store/useLanguageStore";
import { t } from "@/services/i18n";
import FormSectionCard from "@/components/ui/FormSectionCard";

const LanguageSettings = () => {
    const { language, setLanguage } = useLanguageStore();
    const [tempLanguage, setTempLanguage] = useState<"en" | "id">(language);

    // Update temp language when store changes (e.g. initial load)
    useEffect(() => {
        setTempLanguage(language);
    }, [language]);

    const languages: { code: "en" | "id"; label: string; icon: string }[] = [
        { code: "en", label: "English", icon: "https://flagcdn.com/w80/us.png" },
        { code: "id", label: "Indonesian", icon: "https://flagcdn.com/w80/id.png" },
    ];

    const handleSave = () => {
        setLanguage(tempLanguage);
    };

    return (
        <FormSectionCard
            title={t("language_setting")}
            style={{ flex: 1 }}
            contentStyle={$.content}
        >
            <View style={$.listContainer}>
                {languages.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={$.languageCard}
                        onPress={() => setTempLanguage(lang.code)}
                        activeOpacity={0.7}
                    >
                        <View style={$.languageInfo}>
                            {/* Simple circular flag placeholder or use Expo Image */}
                            <Image source={lang.icon} style={$.flag} contentFit="cover" />
                            <Text style={$.languageName}>{lang.label}</Text>
                        </View>
                        <RadioButton
                            checked={tempLanguage === lang.code}
                            onPress={() => setTempLanguage(lang.code)}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={$.footer}>
                <Button
                    title={t("save_changes")}
                    variant="primary"
                    onPress={handleSave}
                />
            </View>
        </FormSectionCard>
    );
};

const $ = StyleSheet.create((theme) => ({
    content: {
        justifyContent: "space-between",
        flex: 1,
    },
    listContainer: {
        gap: theme.spacing.md,
        flex: 1,
    },
    languageCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.neutral[200],
    },
    languageInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
    },
    flag: {
        width: 32,
        height: 24,
        borderRadius: 4,
    },
    languageName: {
        ...theme.typography.labelMd,
        color: theme.colors.neutral[700],
    },
    footer: {
        paddingTop: theme.spacing.xl,
        borderTopWidth: 1,
        borderTopColor: theme.colors.neutral[200],
        alignItems: "flex-end", // Align save button to right
    },
}));

export default LanguageSettings;
