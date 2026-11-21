import Feather from "@expo/vector-icons/Feather";
import { FlashList, type FlashListRef, type ListRenderItemInfo } from "@shopify/flash-list";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { captureAnalyticsEvent } from "@/lib/posthog";
import { postAIChat } from "@/services/endpoints/postAIChat";
import { t } from "@/services/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 100 : 80;
const messageKeyExtractor = (item: Message) => item.id;
const getMessageItemType = (item: Message) => item.role;

const getMessageBubbleStyle = (role: Message["role"]) => {
  if (role === "user") {
    return $.userBubble;
  }
  if (role === "system") {
    return $.systemBubble;
  }
  return $.aiBubble;
};

const getMessageTextStyle = (role: Message["role"]) => {
  if (role === "user") {
    return $.userText;
  }
  if (role === "system") {
    return $.systemText;
  }
  return $.aiText;
};

const ChatMessageItem = memo(({ item }: { item: Message }) => (
  <View style={getMessageBubbleStyle(item.role)}>
    <Text style={getMessageTextStyle(item.role)}>{item.content}</Text>
  </View>
));

ChatMessageItem.displayName = "ChatMessageItem";

const MessageSeparator = () => <View style={$.separator} />;

const renderMessageItem = ({ item }: ListRenderItemInfo<Message>) => (
  <ChatMessageItem item={item} />
);

interface ChatInputBarProps {
  isGenerating: boolean;
  placeholder: string;
  onSend: (text: string) => void;
}

const ChatInputBar = memo(({ isGenerating, placeholder, onSend }: ChatInputBarProps) => {
  const [input, setInput] = useState("");
  const trimmedInput = input.trim();
  const isDisabled = !trimmedInput || isGenerating;

  const handleSubmit = useCallback(() => {
    if (!trimmedInput || isGenerating) return;
    setInput("");
    onSend(trimmedInput);
  }, [trimmedInput, isGenerating, onSend]);

  return (
    <View style={$.inputContainer}>
      <TextInput
        style={$.input}
        placeholder={placeholder}
        value={input}
        onChangeText={setInput}
        editable={!isGenerating}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
      />
      <TouchableOpacity
        style={isDisabled ? $.sendButtonDisabled : $.sendButton}
        onPress={handleSubmit}
        disabled={isDisabled}
      >
        {isGenerating ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Feather name="send" size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
});

ChatInputBar.displayName = "ChatInputBar";

const ChatInterface = memo(() => {
  useLanguageStore((state) => state.language); // Subscribe to language changes
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: "1", role: "assistant", content: t("ai_welcome_message") },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const listRef = useRef<FlashListRef<Message>>(null);

  useEffect(() => {
    if (messages.length > 1) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = useCallback(async (userText: string) => {
    if (!userText || isGeneratingRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: userText };

    // Optimistic update + pending indicator in one state transition
    isGeneratingRef.current = true;
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: "pending", role: "assistant", content: "..." },
    ]);
    setIsGenerating(true);

    captureAnalyticsEvent("ai_prompt_sent", {
      promptLength: userText.length,
    });

    try {
      const response = await postAIChat(userText);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "pending");
        return [
          ...filtered,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.text,
          },
        ];
      });
    } catch (e) {
      console.error("Chat API error:", e);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "pending");
        return [
          ...filtered,
          {
            id: (Date.now() + 1).toString(),
            role: "system",
            content: t("ai_connection_error"),
          },
        ];
      });
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={$.container}
      behavior="padding"
      keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
    >
      <FlashList<Message>
        ref={listRef}
        data={messages}
        keyExtractor={messageKeyExtractor}
        getItemType={getMessageItemType}
        renderItem={renderMessageItem}
        ItemSeparatorComponent={MessageSeparator}
        contentContainerStyle={$.listContent}
      />

      <ChatInputBar
        isGenerating={isGenerating}
        placeholder={t("type_message_placeholder")}
        onSend={handleSend}
      />
    </KeyboardAvoidingView>
  );
});

ChatInterface.displayName = "ChatInterface";

const $ = StyleSheet.create((theme) => {
  const messageBubbleBase = {
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    maxWidth: "80%" as const,
  };

  const sendButtonBase = {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary[500],
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  return {
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
      paddingBottom: theme.spacing.xl,
    },
    separator: {
      height: theme.spacing.md,
    },
    userBubble: {
      ...messageBubbleBase,
      backgroundColor: theme.colors.primary[500],
      alignSelf: "flex-end",
      borderBottomRightRadius: theme.radius.xs,
    },
    aiBubble: {
      ...messageBubbleBase,
      backgroundColor: theme.colors.primary[100],
      alignSelf: "flex-start",
      borderBottomLeftRadius: theme.radius.xs,
      borderWidth: 1,
      borderColor: theme.colors.primary[200],
    },
    systemBubble: {
      ...messageBubbleBase,
      backgroundColor: theme.colors.error[100],
      alignSelf: "center",
      maxWidth: "90%",
      borderWidth: 1,
      borderColor: theme.colors.error[200],
    },
    userText: {
      ...theme.typography.bodyMd,
      color: "#FFFFFF",
    },
    aiText: {
      ...theme.typography.bodyMd,
      color: theme.colors.neutral[700],
    },
    systemText: {
      ...theme.typography.bodyMd,
      color: theme.colors.error[600],
      fontSize: 12,
      textAlign: "center",
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
    sendButton: sendButtonBase,
    sendButtonDisabled: {
      ...sendButtonBase,
      backgroundColor: theme.colors.neutral[300],
    },
  };
});

export default ChatInterface;
