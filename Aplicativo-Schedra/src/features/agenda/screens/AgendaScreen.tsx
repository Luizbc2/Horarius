import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "../../../shared/components/AppHeader";
import { Screen } from "../../../shared/components/Screen";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";

const metrics = [
  { label: "HOJE", value: "08", detail: "atendimentos", color: "accent" as const },
  { label: "CONFIRMADOS", value: "06", detail: "clientes", color: "amber" as const },
  { label: "OCUPAÇÃO", value: "82%", detail: "da equipe", color: "coral" as const },
];

const appointments = [
  { time: "09:30", name: "Camila Rocha", service: "Corte + finalização", status: "Confirmado", color: "lime" as const },
  { time: "10:45", name: "Lucas Martins", service: "Barba completa", status: "Em atendimento", color: "coral" as const },
  { time: "13:00", name: "Marina Alves", service: "Coloração", status: "Confirmado", color: "teal" as const },
];

export function AgendaScreen() {
  const { colors } = useAppTheme();

  return (
    <Screen
      header={<AppHeader eyebrow="TERÇA-FEIRA, 11 DE AGOSTO" title="Bom dia, Luiz" />}
      floatingAction={
        <Pressable style={({ pressed }) => [styles.fab, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}>
          <Ionicons name="add" color="#FFFFFF" size={28} />
        </Pressable>
      }
    >
      <View>
        <Text style={[styles.kicker, { color: colors.accent }]}>VISÃO DO DIA</Text>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Agenda de hoje</Text>
        <Text style={[styles.pageDescription, { color: colors.textMuted }]}>Acompanhe o ritmo da operação e encontre rapidamente o próximo espaço livre.</Text>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: colors[metric.color] }]}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{metric.label}</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
            <Text style={[styles.metricDetail, { color: colors.textMuted }]}>{metric.detail}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.agendaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionEyebrow, { color: colors.textMuted }]}>TIMELINE</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Próximos horários</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
        </View>
        {appointments.map((appointment, index) => (
          <View key={`${appointment.time}-${appointment.name}`} style={[styles.appointment, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <Text style={[styles.time, { color: colors.textMuted }]}>{appointment.time}</Text>
            <View style={[styles.appointmentAccent, { backgroundColor: colors.accent }]} />
            <View style={styles.appointmentBody}>
              <Text style={[styles.appointmentName, { color: colors.text }]}>{appointment.name}</Text>
              <Text style={[styles.appointmentService, { color: colors.textMuted }]}>{appointment.service}</Text>
              <Text style={[styles.appointmentStatus, { color: colors.accent }]}>{appointment.status}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors[appointment.color] }]} />
          </View>
        ))}
        <View style={[styles.availableSlot, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.availableTime, { color: colors.textMuted }]}>14:30</Text>
          <Text style={[styles.availableLabel, { color: colors.accent }]}>Horário disponível</Text>
        </View>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, marginBottom: 6 },
  pageTitle: { fontFamily: fonts.displayBold, fontSize: 34 },
  pageDescription: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8 },
  metricsGrid: { flexDirection: "row", gap: 8 },
  metricCard: { flex: 1, minHeight: 120, padding: 12, borderRadius: 8, borderWidth: 1, borderLeftWidth: 3 },
  metricLabel: { fontFamily: fonts.bodyBold, fontSize: 9 },
  metricValue: { fontFamily: fonts.displayBold, fontSize: 31, marginTop: 8 },
  metricDetail: { fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  agendaCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 8 },
  sectionEyebrow: { fontFamily: fonts.bodyBold, fontSize: 10 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 23, marginTop: 4 },
  appointment: { minHeight: 100, flexDirection: "row", alignItems: "flex-start", paddingVertical: 16 },
  time: { width: 52, fontFamily: fonts.bodyBold, fontSize: 13, paddingTop: 2 },
  appointmentAccent: { width: 2, alignSelf: "stretch", marginRight: 14 },
  appointmentBody: { flex: 1, gap: 4 },
  appointmentName: { fontFamily: fonts.bodyBold, fontSize: 15 },
  appointmentService: { fontFamily: fonts.body, fontSize: 13 },
  appointmentStatus: { fontFamily: fonts.bodyBold, fontSize: 12, marginTop: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  availableSlot: { flexDirection: "row", alignItems: "center", minHeight: 52, borderWidth: 1, borderStyle: "dashed", borderRadius: 8, paddingHorizontal: 12 },
  availableTime: { width: 66, fontFamily: fonts.bodyBold, fontSize: 13 },
  availableLabel: { fontFamily: fonts.bodyBold, fontSize: 13 },
  fab: { position: "absolute", right: 22, bottom: 18, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});
