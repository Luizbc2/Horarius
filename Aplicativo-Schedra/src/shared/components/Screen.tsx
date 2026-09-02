import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppTheme } from "../../theme/ThemeProvider";

type ScreenProps = PropsWithChildren<{
  floatingAction?: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
}>;

export function Screen({ children, floatingAction, header, scroll = true }: ScreenProps) {
  const { colors } = useAppTheme();
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {floatingAction}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, gap: 20, paddingHorizontal: 20, paddingBottom: 30 },
  scrollContent: { flexGrow: 1 },
});
