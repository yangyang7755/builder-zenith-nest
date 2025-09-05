import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { platformFetch } from "../../src/shared/platform/fetch";
import { API_BASE_URL } from "../../src/shared/services/apiService";

interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name?: string;
  receiver_name?: string;
  sender_avatar?: string;
  receiver_avatar?: string;
  message: string;
  created_at: string;
  read_at?: string | null;
  is_sent_by_me?: boolean;
}

export default function Chat() {
  const [otherUserId, setOtherUserId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!otherUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await platformFetch(`${API_BASE_URL}/chat/direct/${otherUserId}/messages`, { method: "GET" });
      if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
      const data = await res.json();
      const items: DirectMessage[] = data?.data || [];
      setMessages(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [otherUserId]);

  useEffect(() => {
    // Auto-refresh when otherUserId changes
    loadMessages();
  }, [otherUserId, loadMessages]);

  const sendMessage = async () => {
    if (!otherUserId || !input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await platformFetch(`${API_BASE_URL}/chat/direct/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_id: otherUserId, message: input.trim() }),
      });
      if (!res.ok) throw new Error(`Failed to send (${res.status})`);
      const data = await res.json();
      const newMsg: DirectMessage = data?.data;
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: DirectMessage }) => {
    const mine = item.is_sent_by_me || false;
    return (
      <View style={[styles.msgRow, mine ? styles.msgMine : styles.msgTheirs]}>
        <Text style={styles.msgText}>{item.message}</Text>
        <Text style={styles.msgMeta}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>Direct Messages</Text>
        <Text style={styles.caption}>Enter a user ID to load your conversation</Text>
        <TextInput
          style={styles.input}
          value={otherUserId}
          onChangeText={setOtherUserId}
          placeholder="Other user ID"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.reloadBtn} onPress={loadMessages} disabled={!otherUserId || loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.reloadText}>Load Messages</Text>}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet</Text>
            </View>
          ) : null
        }
        contentContainerStyle={messages.length === 0 ? styles.listEmpty : undefined}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.composeInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          editable={!sending}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending || !input.trim() || !otherUserId}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee" },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  caption: { color: "#666", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 },
  reloadBtn: { marginTop: 10, backgroundColor: "#2563eb", paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  reloadText: { color: "#fff", fontWeight: "600" },
  error: { color: "#dc2626", marginTop: 8 },
  list: { flex: 1 },
  listEmpty: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", padding: 20 },
  emptyText: { color: "#666" },
  msgRow: { marginHorizontal: 12, marginVertical: 6, padding: 10, borderRadius: 10, maxWidth: "80%" },
  msgMine: { alignSelf: "flex-end", backgroundColor: "#dcfce7" },
  msgTheirs: { alignSelf: "flex-start", backgroundColor: "#f1f5f9" },
  msgText: { fontSize: 16 },
  msgMeta: { marginTop: 4, fontSize: 12, color: "#64748b" },
  composer: { flexDirection: "row", padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee" },
  composeInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  sendBtn: { backgroundColor: "#16a34a", paddingHorizontal: 16, justifyContent: "center", borderRadius: 20 },
  sendText: { color: "#fff", fontWeight: "700" },
});
