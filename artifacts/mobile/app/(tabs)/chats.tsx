import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";
import { CONNECTIONS, COMMUNITIES } from "@/data/mockData";
import { supabase } from "@/lib/supabase";
import { AvatarCircle } from "@/components/AvatarCircle";
import { TypeBadge } from "@/components/TypeBadge";
import { GlassCard } from "@/components/GlassCard";
import { useApp } from "@/context/AppContext";

type Section = "chats" | "communities";

const CHAT_MESSAGES = CONNECTIONS.map((c, i) => ({
  id: c.id,
  user: c,
  lastMessage: [
    "means what are u here for? 😅",
    "Visit my pages and follow? Sorry if busy",
    "how abt a mid length",
    "bald d...",
    "yeah right lol",
    "I understand why someone would vote her...",
    "like I said before...",
    "so what do you think about it?",
  ][i % 8],
  time: ["Just now", "2m", "15m", "45m", "1h", "Sat", "Fri", "Wed"][i % 8],
  unread: [6, 0, 2, 0, 1, 0, 0, 3][i % 8],
  isPinned: i === 0,
}));

const MENU_OPTIONS = [
  { id: "m1", label: "Thought Bubbles", icon: "💭" },
  { id: "m2", label: "Wonder Chat", icon: "🏆" },
  { id: "m3", label: "Make a Wish", icon: "🔮" },
  { id: "m4", label: "Future Lens", icon: "❓" },
  { id: "m5", label: "Contacts", icon: "👥" },
  { id: "m6", label: "Chat History", icon: "🕐" },
  { id: "m7", label: "Deleted Chats", icon: "🗑️" },
];

// Mock chat conversation
const MOCK_CONVERSATION = [
  { id: "msg1", from: "them", text: "Hey! I saw your type analysis post, really insightful 👏", time: "2:30 PM" },
  { id: "msg2", from: "me", text: "Thank you! Type nerds tend to over-analyze everything lol", time: "2:31 PM" },
  { id: "msg3", from: "them", text: "Same here 😄 Do you think we're compatible?", time: "2:32 PM" },
  { id: "msg4", from: "me", text: "According to soul chemistry, we're actually a great match!", time: "2:33 PM" },
  { id: "msg5", from: "them", text: "That's so cool, I love this app 🔮", time: "2:34 PM" },
];

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { mode, profile, joinedCommunities, toggleCommunity } = useApp();

  // Sample contacts: messages you send get a friendly scripted answer.
  type DM = { id: string; from: "me" | "them"; text: string; time: string };
  const [dmSent, setDmSent] = useState<Record<string, DM[]>>({});
  const [dmTyping, setDmTyping] = useState<string | null>(null);
  const REPLIES = ["Haha, I was thinking the same thing 😄", "Tell me more!", "That's a great point.", "Ha, fair enough 🙌", "Love that. Talk soon!"];
  const sendDm = (contactId: string, body: string) => {
    const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const mine: DM = { id: `me-${Date.now()}`, from: "me", text: body, time: now() };
    setDmSent((cur) => ({ ...cur, [contactId]: [...(cur[contactId] ?? []), mine] }));
    setDmTyping(contactId);
    setTimeout(() => {
      const reply: DM = {
        id: `them-${Date.now()}`,
        from: "them",
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        time: now(),
      };
      setDmSent((cur) => ({ ...cur, [contactId]: [...(cur[contactId] ?? []), reply] }));
      setDmTyping((t) => (t === contactId ? null : t));
    }, 1300);
  };

  // Real member counts for accounts; the demo shows sample numbers.
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    if (mode !== "account" || !supabase) return;
    void supabase
      .from("community_stats")
      .select("community_id, members")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data ?? []).forEach((r: { community_id: string; members: number }) => (map[r.community_id] = r.members));
        setMemberCounts(map);
      });
  }, [mode, joinedCommunities]);
  const [section, setSection] = useState<Section>("chats");
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState<typeof CHAT_MESSAGES[0] | null>(null);
  const [message, setMessage] = useState("");
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [viewOnceVisible, setViewOnceVisible] = useState(false);
  const [recordingVisible, setRecordingVisible] = useState(false);
  const [recording, setRecording] = useState(false);
  const recordAnim = useRef(new Animated.Value(1)).current;

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchSection = (s: Section) => {
    Haptics.selectionAsync();
    setSection(s);
    Animated.spring(slideAnim, {
      toValue: s === "chats" ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const startRecording = () => {
    setRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(recordAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopRecording = () => {
    setRecording(false);
    recordAnim.setValue(1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const filteredChats = CHAT_MESSAGES.filter(
    (c) => !search || c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCommunities = COMMUNITIES.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AvatarCircle name={profile.name} size={30} mbti={profile.mbti} />
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="flash" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>
          {section === "chats" ? "Chats" : "Communities"}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="paw" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true); }}
          >
            <Feather name="plus" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Switcher */}
      <View style={styles.switcher}>
        <Animated.View style={[styles.switcherIndicator, { left: indicatorLeft }]} />
        <TouchableOpacity style={styles.switcherBtn} onPress={() => switchSection("chats")}>
          <Ionicons name="chatbubble-outline" size={14} color={section === "chats" ? "#FFF" : COLORS.textTertiary} />
          <Text style={[styles.switcherText, section === "chats" && styles.switcherTextActive]}>
            Chats
            <Text style={styles.switcherBadge}> 6</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.switcherBtn} onPress={() => switchSection("communities")}>
          <Ionicons name="people-outline" size={14} color={section === "communities" ? "#FFF" : COLORS.textTertiary} />
          <Text style={[styles.switcherText, section === "communities" && styles.switcherTextActive]}>
            Communities
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={section === "chats" ? "Search conversations..." : "Search communities..."}
            placeholderTextColor={COLORS.textTertiary}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {section === "chats" ? (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chatRow, item.isPinned && styles.chatRowPinned]}
              activeOpacity={0.7}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setChatOpen(item); }}
            >
              <AvatarCircle name={item.user.name} size={52} mbti={item.user.mbti} isOnline={item.user.isOnline} />
              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <View style={styles.chatNameRow}>
                    <Text style={styles.chatName}>{item.user.name}</Text>
                    <View style={[styles.typePill, { backgroundColor: COLORS.typeColor + "18", borderColor: COLORS.typeColor + "40" }]}>
                      <Text style={[styles.typePillText, { color: COLORS.typeColor }]}>{item.user.mbti}</Text>
                    </View>
                  </View>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredCommunities}
          keyExtractor={(c) => c.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No communities found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isJoined = joinedCommunities.includes(item.id);
            return (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/community/${item.id}` as never); }}>
                <GlassCard style={styles.communityCard}>
                  <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                  <View style={styles.commContent}>
                    <View style={styles.commTop}>
                      <View style={[styles.commIcon, { backgroundColor: item.color + "25", borderColor: item.color + "50" }]}>
                        <Text style={[styles.commIconText, { color: item.color }]}>{item.code}</Text>
                      </View>
                      <View style={styles.commInfo}>
                        <Text style={styles.commName}>{item.name}</Text>
                        <Text style={styles.commDesc} numberOfLines={2}>{item.description}</Text>
                      </View>
                    </View>
                    <View style={styles.commBottom}>
                      <View style={styles.commStats}>
                        <Ionicons name="people" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.commStatText}>{(mode === "account" ? memberCounts[item.id] ?? 0 : item.members).toLocaleString()}</Text>
                        <Ionicons name="time" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.commStatText}>{item.recentActivity}</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleCommunity(item.id); }}
                      >
                        <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
                          {isJoined ? "✓ Joined" : "Join"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>
            );
          }}
        />
      )}

      {/* Plus Menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            {MENU_OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.menuItem, idx < MENU_OPTIONS.length - 1 && styles.menuItemBorder]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(false); }}
              >
                <Text style={styles.menuLabel}>{opt.label}</Text>
                <Text style={styles.menuIcon}>{opt.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Chat Detail Modal */}
      <Modal visible={!!chatOpen} transparent animationType="slide" onRequestClose={() => setChatOpen(null)}>
        {chatOpen && (
          <View style={styles.chatModal}>
            {/* Chat Header */}
            <View style={[styles.chatModalHeader, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity onPress={() => setChatOpen(null)}>
                <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <AvatarCircle name={chatOpen.user.name} size={36} mbti={chatOpen.user.mbti} isOnline={chatOpen.user.isOnline} />
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName}>{chatOpen.user.name}</Text>
                <Text style={styles.chatHeaderType}>{chatOpen.user.mbti} · {chatOpen.user.isOnline ? "Online" : "Offline"}</Text>
              </View>
              <View style={styles.chatHeaderActions}>
                <TouchableOpacity style={styles.chatActionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setViewOnceVisible(true); }}>
                  <Ionicons name="eye-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatActionBtn}>
                  <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Messages */}
            <ScrollView style={styles.messagesList} contentContainerStyle={{ padding: 16, gap: 10 }}>
              {[...MOCK_CONVERSATION, ...(dmSent[chatOpen.id] ?? [])].map((msg) => (
                <View key={msg.id} style={[styles.msgRow, msg.from === "me" && styles.msgRowMe]}>
                  {msg.from !== "me" && (
                    <AvatarCircle name={chatOpen.user.name} size={28} mbti={chatOpen.user.mbti} />
                  )}
                  <View style={[styles.msgBubble, msg.from === "me" ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                    <Text style={[styles.msgText, msg.from === "me" && styles.msgTextMe]}>{msg.text}</Text>
                    <Text style={styles.msgTime}>{msg.time}</Text>
                  </View>
                </View>
              ))}
              {/* Typing indicator, only while a reply is on its way */}
              {dmTyping === chatOpen.id && (
                <View style={styles.typingRow}>
                  <AvatarCircle name={chatOpen.user.name} size={24} mbti={chatOpen.user.mbti} />
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, { opacity: 0.6 }]} />
                    <View style={[styles.typingDot, { opacity: 0.3 }]} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input bar */}
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
              <TouchableOpacity
                style={styles.inputAction}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMediaPickerVisible(true); }}
              >
                <Feather name="plus-circle" size={24} color={COLORS.accent} />
              </TouchableOpacity>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Message..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
              />
              {message.length > 0 ? (
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); if (chatOpen) sendDm(chatOpen.id, message.trim()); setMessage(""); }}
                >
                  <Ionicons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.inputAction, recording && { opacity: 0.7 }]}
                  onLongPress={startRecording}
                  onPressOut={stopRecording}
                >
                  <Animated.View style={{ transform: [{ scale: recording ? recordAnim : 1 }] }}>
                    <Ionicons name="mic" size={24} color={recording ? COLORS.accentRed : COLORS.textSecondary} />
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Modal>

      {/* Media Picker */}
      <Modal visible={mediaPickerVisible} transparent animationType="slide" onRequestClose={() => setMediaPickerVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMediaPickerVisible(false)}>
          <View style={styles.mediaPickerSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.mediaSheetTitle}>Attach Media</Text>
            <View style={styles.mediaGrid}>
              {[
                { icon: "camera", label: "Camera", color: COLORS.accent },
                { icon: "image", label: "Gallery", color: COLORS.accentBlue },
                { icon: "video", label: "Record Video", color: COLORS.accentOrange },
                { icon: "eye", label: "View Once Photo", color: COLORS.accentGold },
                { icon: "film", label: "View Once Video", color: "#EC407A" },
                { icon: "mic", label: "Voice Note", color: COLORS.accentGreen },
                { icon: "map-pin", label: "Location", color: COLORS.accentRed },
                { icon: "file", label: "Document", color: COLORS.textSecondary },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={styles.mediaOption}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMediaPickerVisible(false);
                    if (opt.label === "Record Video") setRecordingVisible(true);
                    if (opt.label.includes("View Once")) setViewOnceVisible(true);
                  }}
                >
                  <View style={[styles.mediaOptionIcon, { backgroundColor: opt.color + "20", borderColor: opt.color + "40" }]}>
                    <Feather name={opt.icon as any} size={22} color={opt.color} />
                  </View>
                  <Text style={styles.mediaOptionLabel}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* View Once Modal */}
      <Modal visible={viewOnceVisible} transparent animationType="fade" onRequestClose={() => setViewOnceVisible(false)}>
        <View style={styles.viewOnceOverlay}>
          <View style={styles.viewOnceContent}>
            <Ionicons name="eye" size={48} color={COLORS.accentGold} />
            <Text style={styles.viewOnceTitle}>View Once</Text>
            <Text style={styles.viewOnceSub}>This photo/video can only be viewed once and then disappears forever</Text>
            <View style={styles.viewOnceMediaPlaceholder}>
              <View style={styles.viewOnceBlur}>
                <Ionicons name="lock-closed" size={36} color={COLORS.accentGold} />
                <Text style={styles.viewOnceBlurText}>Tap to reveal (1 time only)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewOnceBtn}
              onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); setViewOnceVisible(false); }}
            >
              <Text style={styles.viewOnceBtnText}>View & Disappear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewOnceVisible(false)} style={{ paddingVertical: 12 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Record Video Modal */}
      <Modal visible={recordingVisible} transparent animationType="fade" onRequestClose={() => setRecordingVisible(false)}>
        <View style={styles.recordOverlay}>
          <View style={styles.recordViewfinder}>
            <View style={styles.recordBg}>
              <Text style={{ fontSize: 48 }}>📹</Text>
            </View>
            <View style={styles.recordCornerTL} />
            <View style={styles.recordCornerTR} />
            <View style={styles.recordCornerBL} />
            <View style={styles.recordCornerBR} />
          </View>
          <Text style={styles.recordHint}>Hold to record · Release to send</Text>
          <View style={styles.recordActions}>
            <TouchableOpacity style={styles.recordCloseBtn} onPress={() => setRecordingVisible(false)}>
              <Feather name="x" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.recordBtn, recording && styles.recordBtnActive]}
              onLongPress={startRecording}
              onPressOut={() => { stopRecording(); setRecordingVisible(false); }}
            >
              <Animated.View style={[styles.recordBtnInner, { transform: [{ scale: recording ? recordAnim : 1 }] }]}>
                <View style={styles.recordBtnCenter} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recordFlipBtn}>
              <Ionicons name="camera-reverse" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, width: 80 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end", width: 80 },
  headerIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  switcher: { flexDirection: "row", marginHorizontal: 16, marginBottom: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 3, borderWidth: 1, borderColor: COLORS.glassBorder, position: "relative", overflow: "hidden" },
  switcherIndicator: { position: "absolute", top: 3, bottom: 3, width: "50%", backgroundColor: COLORS.accent, borderRadius: 11 },
  switcherBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, zIndex: 1 },
  switcherText: { color: COLORS.textTertiary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  switcherTextActive: { color: "#FFF" },
  switcherBadge: { color: COLORS.accentRed, fontFamily: "Inter_700Bold", fontSize: 12 },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15 },
  listContent: {},
  chatRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  chatRowPinned: { backgroundColor: COLORS.bgSecondary },
  chatInfo: { flex: 1, gap: 5 },
  chatTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  chatName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  typePillText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  chatTime: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  lastMessage: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accentGreen, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  separator: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 16 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 14 },
  emptyText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 16 },
  communityCard: { padding: 0, overflow: "hidden", marginHorizontal: 16 },
  colorBar: { height: 4, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  commContent: { padding: 14, gap: 10 },
  commTop: { flexDirection: "row", gap: 12 },
  commIcon: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  commIconText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  commInfo: { flex: 1, gap: 3 },
  commName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  commDesc: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  commBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commStats: { flexDirection: "row", alignItems: "center", gap: 6 },
  commStatText: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  joinBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent },
  joinBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  joinBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  joinBtnTextActive: { color: COLORS.textPrimary },
  menuBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: { position: "absolute", top: 60, right: 16, width: 240, backgroundColor: "#1E1E26", borderRadius: 18, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 15 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  menuLabel: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 15 },
  menuIcon: { fontSize: 18 },
  chatModal: { flex: 1, backgroundColor: COLORS.bg },
  chatModalHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard },
  chatHeaderInfo: { flex: 1, gap: 2 },
  chatHeaderName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  chatHeaderType: { color: COLORS.typeColor, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  chatHeaderActions: { flexDirection: "row", gap: 6 },
  chatActionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bgTertiary },
  messagesList: { flex: 1 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  msgRowMe: { flexDirection: "row-reverse" },
  msgBubble: { maxWidth: "72%", borderRadius: 18, padding: 12, gap: 4 },
  msgBubbleThem: { backgroundColor: COLORS.bgCard, borderBottomLeftRadius: 4 },
  msgBubbleMe: { backgroundColor: COLORS.accent, borderBottomRightRadius: 4 },
  msgText: { color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  msgTextMe: { color: "#FFF" },
  msgTime: { color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular", fontSize: 10, alignSelf: "flex-end" },
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typingBubble: { flexDirection: "row", gap: 4, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 12 },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.textTertiary },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard },
  inputAction: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  messageInput: { flex: 1, backgroundColor: COLORS.bgTertiary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 40, maxHeight: 120 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  mediaPickerSheet: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center" },
  mediaSheetTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  mediaOption: { width: "22%", alignItems: "center", gap: 6 },
  mediaOptionIcon: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  mediaOptionLabel: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 10, textAlign: "center" },
  viewOnceOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", alignItems: "center", justifyContent: "center", padding: 24 },
  viewOnceContent: { alignItems: "center", gap: 14, width: "100%" },
  viewOnceTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24 },
  viewOnceSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
  viewOnceMediaPlaceholder: { width: "100%", height: 240, backgroundColor: COLORS.bgCard, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accentGold + "40", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  viewOnceBlur: { alignItems: "center", gap: 10 },
  viewOnceBlurText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  viewOnceBtn: { backgroundColor: COLORS.accentGold, borderRadius: 50, paddingVertical: 15, paddingHorizontal: 40, width: "100%", alignItems: "center" },
  viewOnceBtnText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 16 },
  cancelText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
  recordOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.97)", alignItems: "center", justifyContent: "space-between", paddingVertical: 60 },
  recordViewfinder: { width: 280, height: 360, borderRadius: 20, overflow: "hidden", position: "relative" },
  recordBg: { flex: 1, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  recordCornerTL: { position: "absolute", top: 0, left: 0, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.accentOrange, borderTopLeftRadius: 8 },
  recordCornerTR: { position: "absolute", top: 0, right: 0, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.accentOrange, borderTopRightRadius: 8 },
  recordCornerBL: { position: "absolute", bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.accentOrange, borderBottomLeftRadius: 8 },
  recordCornerBR: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.accentOrange, borderBottomRightRadius: 8 },
  recordHint: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  recordActions: { flexDirection: "row", alignItems: "center", gap: 40 },
  recordCloseBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", justifyContent: "center" },
  recordBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: "#FFF", alignItems: "center", justifyContent: "center" },
  recordBtnActive: { borderColor: COLORS.accentRed },
  recordBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#FFF", alignItems: "center", justifyContent: "center" },
  recordBtnCenter: { width: 20, height: 20, borderRadius: 4, backgroundColor: COLORS.accentRed },
  recordFlipBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", justifyContent: "center" },
});
