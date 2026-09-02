import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";

export function WelcomeScreen({ onPreview }: { onPreview: () => void }) {
  const { colors, mode, toggleTheme } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.brand, { color: colors.text }]}>Schedra</Text>
          <Text style={[styles.tagline, { color: colors.textMuted }]}>Agenda inteligente</Text>
        </View>
        <Pressable onPress={toggleTheme} style={[styles.themeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name={mode === "dark" ? "sunny-outline" : "moon-outline"} color={colors.text} size={20} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: colors.lime }]}>SUA ROTINA EM MOVIMENTO</Text>
        <Text style={[styles.headline, { color: colors.text }]}>Clareza para o dia inteiro.</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>Compromissos, clientes e horários reunidos em uma experiência feita para o celular.</Text>
      </View>

      <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.previewHeader}>
          <View>
            <Text style={[styles.previewEyebrow, { color: colors.textMuted }]}>PRÓXIMO HORÁRIO</Text>
            <Text style={[styles.previewTitle, { color: colors.text }]}>09:30 · Camila Rocha</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: colors.lime }]} />
        </View>
        <View style={[styles.previewLine, { backgroundColor: colors.border }]} />
        <View style={styles.previewMeta}>
          <Text style={[styles.previewText, { color: colors.textMuted }]}>Corte + finalização</Text>
          <Text style={[styles.confirmed, { color: colors.accent }]}>Confirmado</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onPreview}
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
        >
          <Text style={styles.primaryButtonText}>Explorar aplicativo</Text>
          <Ionicons name="arrow-forward" color="#FFFFFF" size={20} />
        </Pressable>
        <Text style={[styles.hint, { color: colors.textMuted }]}>A autenticação real entra na próxima entrega.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 24, paddingBottom: 24 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16 },
  brand: { fontFamily: fonts.bodyBold, fontSize: 23 },
  tagline: { fontFamily: fonts.bodyMedium, fontSize: 12, marginTop: 2 },
  themeButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  hero: { flex: 1, justifyContent: "center", gap: 14, maxWidth: 420 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 12 },
  headline: { fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 58 },
  description: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25 },
  preview: { borderWidth: 1, borderRadius: 12, padding: 18, gap: 14, marginBottom: 24 },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  previewEyebrow: { fontFamily: fonts.bodyBold, fontSize: 10 },
  previewTitle: { fontFamily: fonts.bodyBold, fontSize: 17, marginTop: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  previewLine: { height: 1 },
  previewMeta: { flexDirection: "row", justifyContent: "space-between" },
  previewText: { fontFamily: fonts.body, fontSize: 13 },
  confirmed: { fontFamily: fonts.bodyBold, fontSize: 13 },
  footer: { gap: 12 },
  primaryButton: { minHeight: 56, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  primaryButtonText: { color: "#FFFFFF", fontFamily: fonts.bodyBold, fontSize: 16 },
  hint: { textAlign: "center", fontFamily: fonts.body, fontSize: 12 },
});
