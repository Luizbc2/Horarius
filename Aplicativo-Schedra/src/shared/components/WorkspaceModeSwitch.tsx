import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

import { useAuth } from "../../features/auth/AuthProvider";
import { useAppTheme } from "../../theme/ThemeProvider";

const KNOB_SIZE = 34;
const TRACK_PADDING = 4;
const TRACK_WIDTH = 82;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - TRACK_PADDING * 2;

export function WorkspaceModeSwitch() {
  const { workspaceMode, setWorkspaceMode } = useAuth();
  const { colors } = useAppTheme();
  const progress = useRef(new Animated.Value(workspaceMode === "personal" ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: workspaceMode === "personal" ? 1 : 0,
      damping: 17,
      stiffness: 210,
      mass: 0.72,
      useNativeDriver: true,
    }).start();
  }, [progress, workspaceMode]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, KNOB_TRAVEL] });
  const nextMode = workspaceMode === "business" ? "personal" : "business";

  return (
    <Pressable
      accessibilityLabel={`Ativar modo ${nextMode === "personal" ? "pessoal" : "empresarial"}`}
      accessibilityRole="switch"
      accessibilityState={{ checked: workspaceMode === "personal" }}
      onPress={() => void setWorkspaceMode(nextMode)}
      style={({ pressed }) => [
        styles.track,
        { backgroundColor: colors.surfaceRaised, borderColor: colors.border, opacity: pressed ? 0.76 : 1 },
      ]}
    >
      <Animated.View
        style={[
          styles.knob,
          { backgroundColor: colors.accent, transform: [{ translateX }] },
        ]}
      />
      <View style={styles.iconSlot}>
        <Ionicons name="briefcase-outline" size={16} color={workspaceMode === "business" ? "#FFF" : colors.textMuted} />
      </View>
      <View style={styles.iconSlot}>
        <Ionicons name="person-outline" size={16} color={workspaceMode === "personal" ? "#FFF" : colors.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: TRACK_WIDTH, height: 42, padding: TRACK_PADDING, borderWidth: 1, borderRadius: 21, flexDirection: "row", position: "relative" },
  knob: { position: "absolute", left: TRACK_PADDING, top: TRACK_PADDING - 1, width: KNOB_SIZE, height: KNOB_SIZE, borderRadius: KNOB_SIZE / 2 },
  iconSlot: { flex: 1, alignItems: "center", justifyContent: "center", zIndex: 1 },
});
