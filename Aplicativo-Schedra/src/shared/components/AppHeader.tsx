import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../theme/ThemeProvider";
import { fonts } from "../../theme/tokens";
import { WorkspaceModeSwitch } from "./WorkspaceModeSwitch";

type AppHeaderProps = {
  eyebrow?: string;
  title?: string;
};

export function AppHeader({ eyebrow = "SCHEDRA", title = "Sua agenda, no ritmo certo" }: AppHeaderProps) {
  const { colors, mode, toggleTheme } = useAppTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text>
        <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.controls}>
        <WorkspaceModeSwitch />
        <Pressable
          accessibilityLabel={mode === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name={mode === "dark" ? "sunny-outline" : "moon-outline"} size={20} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20 },
  titleGroup: { flex: 1, minWidth: 0, gap: 2, paddingRight: 10 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11 },
  title: { fontFamily: fonts.display, fontSize: 20 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
