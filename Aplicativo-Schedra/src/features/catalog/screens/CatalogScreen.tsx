import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../../shared/components/AppHeader";
import { Screen } from "../../../shared/components/Screen";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";

export function CatalogScreen({ kind }: { kind: "clients" | "services" }) {
  const { colors } = useAppTheme();
  const isClients = kind === "clients";

  return (
    <Screen header={<AppHeader title={isClients ? "Relacionamentos" : "Catálogo"} />}>
      <View>
        <Text style={[styles.kicker, { color: colors.accent }]}>{isClients ? "CLIENTES" : "SERVIÇOS"}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{isClients ? "Sua carteira" : "O que você oferece"}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{isClients ? "Histórico e informações importantes de cada cliente." : "Duração, preço e disponibilidade dos seus serviços."}</Text>
      </View>
      <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.accentSoft }]}>
          <Ionicons name={isClients ? "people-outline" : "cut-outline"} size={28} color={colors.accent} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Estrutura pronta</Text>
        <Text style={[styles.emptyDescription, { color: colors.textMuted }]}>Os dados reais serão conectados nos próximos módulos.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, marginBottom: 6 },
  title: { fontFamily: fonts.displayBold, fontSize: 34 },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8 },
  emptyState: { alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 32, gap: 10 },
  iconBox: { width: 58, height: 58, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 22 },
  emptyDescription: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, textAlign: "center" },
});
