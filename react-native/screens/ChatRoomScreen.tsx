import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
}
const DEMO: Message[] = [
  { id: "1", sender: "You", text: "Hey!", time: "10:00" },
  { id: "2", sender: "Dan Smith", text: "Hi, climbing later?", time: "10:01" },
];

export default function ChatRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [text, setText] = React.useState("");
  const [messages, setMessages] = React.useState(DEMO);

  const title = route.params?.clubId
    ? "Club chat"
    : route.params?.userId
      ? "Direct message"
      : "Chat";

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", text, time: "now" },
    ]);
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.sender === "You" ? styles.me : styles.them,
            ]}
          >
            <Text style={styles.msgText}>{item.text}</Text>
            <Text style={styles.msgTime}>{item.time}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.send} onPress={send}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  back: { fontSize: 20, marginRight: 8 },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  bubble: { padding: 10, borderRadius: 12, marginBottom: 8, maxWidth: "80%" },
  me: { backgroundColor: "#DCFCE7", alignSelf: "flex-end" },
  them: { backgroundColor: "#F3F4F6", alignSelf: "flex-start" },
  msgText: { color: "#111827" },
  msgTime: { color: "#6B7280", fontSize: 11, marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  send: {
    backgroundColor: "#1F381F",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
});
