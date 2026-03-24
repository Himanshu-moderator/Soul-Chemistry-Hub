import React, { useState } from "react";
import {
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
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { CONNECTIONS } from "@/data/mockData";
import { AvatarCircle } from "@/components/AvatarCircle";
import { useApp } from "@/context/AppContext";

const CHAT_MESSAGES = CONNECTIONS.map((c, i) => ({
  id: c.id,
  user: c,
  lastMessage: [
    "means what are u here for?",
    "Visit my pages and follow? Sorry if ...",
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
  { id: "m6", label: "Wonder Chat History", icon: "🕐" },
  { id: "m7", label: "Deleted Chats", icon: "🗑️" },
];

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const filtered = CHAT_MESSAGES.filter((c) =>
    !search || c.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMenuOption = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMenuVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerAvatarBtn}>
            <AvatarCircle name={profile.name} size={32} mbti={profile.mbti} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name="flash" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Chats</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name="paw" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setMenuVisible(true);
          }}>
            <Feather name="plus" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
      </View>

      {/* Chat list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item }) => {
          const typeColor = COLORS.typeColor;
          return (
            <TouchableOpacity
              style={[styles.chatRow, item.isPinned && styles.chatRowPinned]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveChat(item.id);
              }}
            >
              <AvatarCircle name={item.user.name} size={52} mbti={item.user.mbti} isOnline={item.user.isOnline} />
              <View style={styles.chatInfo}>
                <View style={styles.chatTop}>
                  <View style={styles.chatNameRow}>
                    <Text style={styles.chatName}>{item.user.name}</Text>
                    <View style={styles.genderIcon}>
                      <Ionicons name="male" size={10} color={COLORS.accentBlue} />
                    </View>
                    <View style={[styles.typePill, { backgroundColor: typeColor + "18", borderColor: typeColor + "40" }]}>
                      <Text style={[styles.typePillText, { color: typeColor }]}>{item.user.mbti}</Text>
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
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Dropdown menu */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            {MENU_OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.menuItem, idx < MENU_OPTIONS.length - 1 && styles.menuItemBorder]}
                onPress={() => handleMenuOption(opt.id)}
              >
                <Text style={styles.menuLabel}>{opt.label}</Text>
                <Text style={styles.menuIcon}>{opt.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
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
  headerAvatarBtn: {},
  headerIconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15 },
  listContent: {},
  chatRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  chatRowPinned: { backgroundColor: COLORS.bgSecondary },
  chatInfo: { flex: 1, gap: 5 },
  chatTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  chatName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  genderIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.accentBlueDim, alignItems: "center", justifyContent: "center" },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  typePillText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  chatTime: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  lastMessage: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accentGreen, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 12 },
  separator: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 16 },
  menuBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: { position: "absolute", top: 60, right: 16, width: 240, backgroundColor: "#1E1E26", borderRadius: 18, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 15 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  menuLabel: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 15 },
  menuIcon: { fontSize: 18 },
});
