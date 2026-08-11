import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { AppHeader } from "../../../shared/components/AppHeader";
import { Screen } from "../../../shared/components/Screen";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";
import { resolveApiAsset } from "../../../shared/api/client";
import { uploadAvatar } from "../../auth/api/auth-api";
import { useAuth } from "../../auth/AuthProvider";

export function ProfileScreen() {
  const { colors } = useAppTheme();
  const { signOut, setUser, token, user } = useAuth();
  const avatarUri = resolveApiAsset(user.avatarUrl);
  const chooseAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const response = await uploadAvatar(token, result.assets[0].uri, result.assets[0].mimeType);
    await setUser(response.user);
  };

  return (
    <Screen header={<AppHeader title="Conta e preferências" />}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={chooseAvatar} style={[styles.avatar, { backgroundColor: colors.lime }]}>{avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{user.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</Text>}</Pressable>
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
          <Text style={[styles.accountType, { color: colors.accent }]}>{user.accountType === "personal" ? "CONTA PESSOAL" : "CONTA EMPRESARIAL"}</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[
          ["person-outline", "Dados pessoais"],
          ["notifications-outline", "Notificações"],
          ["shield-checkmark-outline", "Segurança"],
        ].map(([icon, label], index) => (
          <View key={label} style={[styles.infoRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        ))}
      </View>

      <Pressable onPress={signOut} style={[styles.exitButton, { borderColor: colors.danger, backgroundColor: `${colors.danger}14` }]}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.exitText, { color: colors.danger }]}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: "row", gap: 14, alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 18 },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 58, height: 58, borderRadius: 29 },
  avatarText: { color: "#1C2410", fontFamily: fonts.bodyBold, fontSize: 17 },
  profileCopy: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.bodyBold, fontSize: 16 },
  email: { fontFamily: fonts.body, fontSize: 12 },
  accountType: { fontFamily: fonts.bodyBold, fontSize: 10, marginTop: 5 },
  infoCard: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 },
  infoRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 12 },
  infoLabel: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14 },
  exitButton: { minHeight: 52, borderWidth: 1, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  exitText: { fontFamily: fonts.bodyBold, fontSize: 14 },
});
