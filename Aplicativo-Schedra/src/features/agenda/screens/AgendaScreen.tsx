import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "../../../shared/components/AppHeader";
import { Screen } from "../../../shared/components/Screen";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";
import { useAuth } from "../../auth/AuthProvider";
import { agendaApi, type Appointment, type EntityOption, type PersonalEvent } from "../api/agenda-api";

type AgendaItem = { id: number; title: string; detail: string; at: string; status: string; raw: Appointment | PersonalEvent };
const addHour = (date: Date) => new Date(date.getTime() + 60 * 60 * 1000);

export function AgendaScreen() {
  const { colors } = useAppTheme();
  const { token, user } = useAuth();
  const personal = user.accountType === "personal";
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (personal) {
        const response = await agendaApi.listPersonal(token);
        setItems(response.items.map((event) => ({ id: event.id, title: event.title, detail: event.location || event.notes || "Compromisso pessoal", at: event.startsAt, status: event.completed ? "Concluído" : "Programado", raw: event })));
      } else {
        const response = await agendaApi.listAppointments(token);
        setItems(response.data.map((appointment) => ({ id: appointment.id, title: appointment.clientName, detail: `${appointment.serviceName} · ${appointment.professionalName}`, at: appointment.scheduledAt, status: appointment.status, raw: appointment })));
      }
    } finally { setLoading(false); }
  }, [personal, token]);

  useEffect(() => { void load(); }, [load]);
  const todayCount = items.filter((item) => new Date(item.at).toDateString() === new Date().toDateString()).length;

  const openEditor = (item: AgendaItem | null = null) => { setEditing(item); setEditorOpen(true); };

  return (
    <Screen header={<AppHeader eyebrow={personal ? "AGENDA PESSOAL" : "GESTÃO DIÁRIA"} title={`Olá, ${user.name.split(" ")[0]}`} />} floatingAction={<Pressable accessibilityLabel="Novo compromisso" onPress={() => openEditor()} style={[styles.fab, { backgroundColor: colors.accent }]}><Ionicons name="add" color="#FFF" size={28} /></Pressable>}>
      <View><Text style={[styles.kicker, { color: colors.accent }]}>{personal ? "MINHA ROTINA" : "VISÃO DO DIA"}</Text><Text style={[styles.pageTitle, { color: colors.text }]}>{personal ? "Seus compromissos" : "Agenda da equipe"}</Text><Text style={[styles.description, { color: colors.textMuted }]}>{personal ? "Organize trabalho, saúde e vida pessoal em um só lugar." : "Atendimentos e horários da operação em tempo real."}</Text></View>
      <View style={styles.metrics}><Metric label="HOJE" value={String(todayCount).padStart(2, "0")} color={colors.accent} /><Metric label="PRÓXIMOS" value={String(items.length).padStart(2, "0")} color={colors.amber} /></View>
      <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.listHeader}><Text style={[styles.listTitle, { color: colors.text }]}>Próximos horários</Text><Pressable accessibilityLabel="Recarregar" onPress={load}><Ionicons name="refresh" size={20} color={colors.textMuted} /></Pressable></View>
        {loading ? <ActivityIndicator style={styles.loader} color={colors.accent} /> : items.length === 0 ? <View style={styles.empty}><Ionicons name="calendar-outline" size={28} color={colors.textMuted} /><Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum compromisso por aqui.</Text></View> : items.map((item, index) => <Pressable key={item.id} onPress={() => openEditor(item)} style={[styles.row, index > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}><Text style={[styles.time, { color: colors.textMuted }]}>{new Date(item.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Text><View style={[styles.accent, { backgroundColor: colors.accent }]} /><View style={styles.rowBody}><Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text><Text numberOfLines={1} style={[styles.itemDetail, { color: colors.textMuted }]}>{item.detail}</Text><Text style={[styles.status, { color: colors.accent }]}>{item.status}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></Pressable>)}
      </View>
      <AgendaEditor visible={editorOpen} item={editing} personal={personal} onClose={() => setEditorOpen(false)} onSaved={async () => { setEditorOpen(false); await load(); }} />
    </Screen>
  );

  function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <View style={[styles.metric, { backgroundColor: colors.surface, borderColor: colors.border, borderLeftColor: color }]}><Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text><Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text></View>; }
}

function AgendaEditor({ visible, item, personal, onClose, onSaved }: { visible: boolean; item: AgendaItem | null; personal: boolean; onClose: () => void; onSaved: () => void }) {
  const { colors } = useAppTheme();
  const { token } = useAuth();
  const initialDate = useMemo(() => item ? new Date(item.at) : addHour(new Date()), [item, visible]);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [options, setOptions] = useState<{ clients: EntityOption[]; professionals: EntityOption[]; services: EntityOption[] }>({ clients: [], professionals: [], services: [] });
  const [selected, setSelected] = useState({ clientId: 0, professionalId: 0, serviceId: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDate(initialDate);
    if (personal && item) { const event = item.raw as PersonalEvent; setTitle(event.title); setLocation(event.location); setNotes(event.notes); }
    else if (!personal && item) { const appointment = item.raw as Appointment; setSelected({ clientId: appointment.clientId, professionalId: appointment.professionalId, serviceId: appointment.serviceId }); setNotes(appointment.notes); }
    else { setTitle(""); setLocation(""); setNotes(""); setSelected({ clientId: 0, professionalId: 0, serviceId: 0 }); }
    if (visible && !personal) void agendaApi.listOptions(token).then(setOptions);
  }, [initialDate, item, personal, token, visible]);

  const save = async () => {
    setSaving(true);
    try {
      if (personal) {
        await agendaApi.savePersonal(token, { title, startsAt: date.toISOString(), endsAt: addHour(date).toISOString(), location, notes, reminderMinutes: 30, completed: false }, item?.id);
      } else {
        await agendaApi.saveAppointment(token, { ...selected, scheduledAt: date.toISOString(), status: "pendente", notes }, item?.id);
      }
      onSaved();
    } finally { setSaving(false); }
  };

  const remove = () => {
    if (!item) return;
    const execute = async () => {
      setSaving(true);
      try {
        if (personal) await agendaApi.deletePersonal(token, item.id);
        else await agendaApi.deleteAppointment(token, item.id);
        onSaved();
      } finally { setSaving(false); }
    };
    if (Platform.OS === "web") {
      if (window.confirm("Excluir compromisso?\n\nEsta acao nao pode ser desfeita.")) void execute();
      return;
    }
    Alert.alert("Excluir compromisso?", "Esta acao nao pode ser desfeita.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => void execute() },
    ]);
  };

  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}><SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}><View style={styles.modalHeader}><View><Text style={[styles.modalEyebrow, { color: colors.accent }]}>{item ? "EDITAR" : "NOVO"}</Text><Text style={[styles.modalTitle, { color: colors.text }]}>{personal ? "Compromisso" : "Agendamento"}</Text></View><Pressable accessibilityLabel="Fechar" onPress={onClose}><Ionicons name="close" size={25} color={colors.text} /></Pressable></View><ScrollView contentContainerStyle={styles.form}>{personal ? <><Field label="Título" value={title} onChangeText={setTitle} /><Field label="Local" value={location} onChangeText={setLocation} /></> : <>{(["clients", "professionals", "services"] as const).map((group) => <OptionSelector key={group} title={group === "clients" ? "Cliente" : group === "professionals" ? "Profissional" : "Serviço"} options={options[group]} value={selected[group === "clients" ? "clientId" : group === "professionals" ? "professionalId" : "serviceId"]} onChange={(value) => setSelected((current) => ({ ...current, [group === "clients" ? "clientId" : group === "professionals" ? "professionalId" : "serviceId"]: value }))} />)}</>}<Text style={[styles.fieldLabel, { color: colors.text }]}>Data e horário</Text><DateTimePicker value={date} mode="datetime" minimumDate={new Date()} onChange={(_event, value) => value && setDate(value)} themeVariant={colors.background === "#121115" ? "dark" : "light"} /><Field label="Observações" value={notes} onChangeText={setNotes} multiline /><Pressable disabled={saving} onPress={save} style={[styles.saveButton, { backgroundColor: colors.accent, opacity: saving ? 0.6 : 1 }]}>{saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Salvar compromisso</Text>}</Pressable>{item ? <Pressable disabled={saving} onPress={remove} style={[styles.deleteButton, { borderColor: colors.danger }]}><Ionicons name="trash-outline" size={18} color={colors.danger} /><Text style={[styles.deleteText, { color: colors.danger }]}>Excluir compromisso</Text></Pressable> : null}</ScrollView></SafeAreaView></Modal>;

  function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text><TextInput placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} {...props} /></View>; }
  function OptionSelector({ title, options: values, value, onChange }: { title: string; options: EntityOption[]; value: number; onChange: (id: number) => void }) { return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.text }]}>{title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{values.map((option) => <Pressable key={option.id} onPress={() => onChange(option.id)} style={[styles.chip, { borderColor: value === option.id ? colors.accent : colors.border, backgroundColor: value === option.id ? colors.accentSoft : colors.surface }]}><Text style={[styles.chipText, { color: value === option.id ? colors.accent : colors.text }]}>{option.name}</Text></Pressable>)}</ScrollView></View>; }
}

const styles = StyleSheet.create({ kicker: { fontFamily: fonts.bodyBold, fontSize: 11, marginBottom: 6 }, pageTitle: { fontFamily: fonts.displayBold, fontSize: 34 }, description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, marginTop: 8 }, metrics: { flexDirection: "row", gap: 10 }, metric: { flex: 1, minHeight: 92, padding: 14, borderRadius: 8, borderWidth: 1, borderLeftWidth: 3 }, metricLabel: { fontFamily: fonts.bodyBold, fontSize: 10 }, metricValue: { fontFamily: fonts.displayBold, fontSize: 31, marginTop: 7 }, list: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16 }, listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18 }, listTitle: { fontFamily: fonts.display, fontSize: 23 }, loader: { margin: 36 }, empty: { alignItems: "center", gap: 10, padding: 34 }, emptyText: { fontFamily: fonts.body, fontSize: 13 }, row: { minHeight: 98, flexDirection: "row", alignItems: "center", paddingVertical: 14 }, time: { width: 52, fontFamily: fonts.bodyBold, fontSize: 12 }, accent: { width: 2, alignSelf: "stretch", marginRight: 13 }, rowBody: { flex: 1, gap: 4 }, itemTitle: { fontFamily: fonts.bodyBold, fontSize: 15 }, itemDetail: { fontFamily: fonts.body, fontSize: 12 }, status: { fontFamily: fonts.bodyBold, fontSize: 11, textTransform: "capitalize" }, fab: { position: "absolute", right: 22, bottom: 18, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 7 }, modal: { flex: 1 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 22 }, modalEyebrow: { fontFamily: fonts.bodyBold, fontSize: 10 }, modalTitle: { fontFamily: fonts.displayBold, fontSize: 32 }, form: { gap: 19, paddingHorizontal: 22, paddingBottom: 40 }, field: { gap: 7 }, fieldLabel: { fontFamily: fonts.bodyBold, fontSize: 13 }, input: { minHeight: 52, borderWidth: 1, borderRadius: 8, padding: 14, fontFamily: fonts.body, fontSize: 14 }, chips: { gap: 8 }, chip: { minHeight: 42, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, justifyContent: "center" }, chipText: { fontFamily: fonts.bodyMedium, fontSize: 13 }, saveButton: { minHeight: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 10 }, saveText: { color: "#FFF", fontFamily: fonts.bodyBold, fontSize: 15 }, deleteButton: { minHeight: 50, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, deleteText: { fontFamily: fonts.bodyBold, fontSize: 14 } });
