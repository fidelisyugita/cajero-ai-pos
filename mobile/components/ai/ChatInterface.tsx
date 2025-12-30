import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
import { Feather } from "@expo/vector-icons";
import { postAIChat } from "@/services/endpoints/postAIChat";
import { t } from "@/services/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const ChatInterface = () => {
  const language = useLanguageStore((state) => state.language); // Subscribe to language changes
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: t("ai_welcome_message") }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: userText };

    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Add pending indicator
    setMessages(prev => [...prev, { id: "pending", role: "assistant", content: "..." }]);

    try {
      const response = await postAIChat(userText);

      setMessages(prev => {
        // Remove pending and add response
        const filtered = prev.filter(m => m.id !== "pending");
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.text
        }];
      });
    } catch (e) {
      console.error("Chat API error:", e);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== "pending");
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: t("ai_connection_error")
        }];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={$.container} 
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 80}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            $.messageBubble,
            item.role === "user" ? $.userBubble : (item.role === "system" ? $.systemBubble : $.aiBubble)
          ]}>
            <Text style={[
              $.messageText,
              item.role === "user" ? $.userText : (item.role === "system" ? $.systemText : $.aiText)
            ]}>
              {item.content}
            </Text>
          </View>
        )}
        contentContainerStyle={$.listContent}
      />

      <View style={$.inputContainer}>
        <TextInput
          style={$.input}
          placeholder={t("type_message_placeholder")}
          value={input}
          onChangeText={setInput}
          editable={!isGenerating}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[$.sendButton, (!input.trim() || isGenerating) && $.disabledButton]}
          onPress={handleSend}
          disabled={!input.trim() || isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Feather name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const $ = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    overflow: "hidden",
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    maxWidth: "80%",
  },
  userBubble: {
    backgroundColor: theme.colors.primary[500],
    alignSelf: "flex-end",
    borderBottomRightRadius: theme.radius.xs,
  },
  aiBubble: {
    backgroundColor: theme.colors.primary[100],
    alignSelf: "flex-start",
    borderBottomLeftRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary[200],
  },
  systemBubble: {
    backgroundColor: theme.colors.error[100],
    alignSelf: "center",
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: theme.colors.error[200],
  },
  messageText: {
    ...theme.typography.bodyMd,
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: theme.colors.neutral[700],
  },
  systemText: {
    color: theme.colors.error[600],
    fontSize: 12,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: "row",
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.neutral[700],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    ...theme.typography.bodyMd,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: theme.colors.neutral[300],
  },
}));

export default ChatInterface;
