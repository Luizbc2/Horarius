import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "../../../shared/api/client";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";
import { useAuth } from "../AuthProvider";
import type { AccountType } from "../types";

export function AuthScreen() {
  const { colors, mode, toggleTheme } = useAppTheme();
  const { signIn, signUp } = useAuth();
  const [screen, setScreen] = useState<"login" | "signup">("login");
  const [accountType, setAccountType] = useState<AccountType>("business");
  const [form, setForm] = useState({ name: "", cpf: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (screen === "login") {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp({ ...form, accountType });
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível acessar sua conta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View><Text style={[styles.brand, { color: colors.text }]}>Schedra</Text><Text style={[styles.tagline, { color: colors.textMuted }]}>Agenda inteligente</Text></View>
            <Pressable onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name={mode === "dark" ? "sunny-outline" : "moon-outline"} size={20} color={colors.text} /></Pressable>
          </View>
          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>{screen === "login" ? "ÁREA DA EQUIPE" : "COMECE AGORA"}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{screen === "login" ? "Entrar no Schedra" : "Crie sua rotina"}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>{screen === "login" ? "Continue de onde sua operação parou." : "Escolha a experiência que combina com o seu dia."}</Text>
          </View>
          {screen === "signup" && (
            <View style={[styles.segment, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(["business", "personal"] as AccountType[]).map((type) => <Pressable key={type} onPress={() => setAccountType(type)} style={[styles.segmentOption, accountType === type && { backgroundColor: colors.accentSoft }]}><Ionicons name={type === "business" ? "briefcase-outline" : "person-outline"} size={18} color={accountType === type ? colors.accent : colors.textMuted} /><Text style={[styles.segmentText, { color: accountType === type ? colors.accent : colors.textMuted }]}>{type === "business" ? "Empresarial" : "Pessoal"}</Text></Pressable>)}
            </View>
          )}
          <View style={styles.form}>
            {screen === "signup" && <><Field label="Nome" value={form.name} onChangeText={(value) => update("name", value)} colors={colors} /><Field label="CPF" value={form.cpf} onChangeText={(value) => update("cpf", value)} keyboardType="numeric" colors={colors} /></>}
            <Field label="E-mail" value={form.email} onChangeText={(value) => update("email", value)} keyboardType="email-address" autoCapitalize="none" colors={colors} />
            <Field label="Senha" value={form.password} onChangeText={(value) => update("password", value)} secureTextEntry colors={colors} />
            {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
            <Pressable disabled={submitting} onPress={submit} style={[styles.submit, { backgroundColor: colors.accent, opacity: submitting ? 0.65 : 1 }]}>{submitting ? <ActivityIndicator color="#FFF" /> : <><Text style={styles.submitText}>{screen === "login" ? "Entrar" : "Criar conta"}</Text><Ionicons name="arrow-forward" color="#FFF" size={19} /></>}</Pressable>
            <Pressable onPress={() => { setScreen(screen === "login" ? "signup" : "login"); setError(""); }}><Text style={[styles.switchText, { color: colors.text }]}>{screen === "login" ? "Ainda não tem acesso? Criar conta" : "Já possui uma conta? Entrar"}</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, colors, ...props }: { label: string; colors: ReturnType<typeof useAppTheme>["colors"] } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.text }]}>{label}</Text><TextInput placeholderTextColor={colors.textMuted} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} {...props} /></View>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1 }, flex: { flex: 1 }, content: { flexGrow: 1, padding: 24, gap: 28 }, brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, brand: { fontFamily: fonts.bodyBold, fontSize: 23 }, tagline: { fontFamily: fonts.bodyMedium, fontSize: 12 }, iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" }, heading: { gap: 8, marginTop: 24 }, eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11 }, title: { fontFamily: fonts.displayBold, fontSize: 42 }, description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 }, segment: { flexDirection: "row", padding: 4, borderRadius: 8, borderWidth: 1 }, segmentOption: { flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 6 }, segmentText: { fontFamily: fonts.bodyBold, fontSize: 13 }, form: { gap: 18 }, field: { gap: 7 }, label: { fontFamily: fonts.bodyBold, fontSize: 13 }, input: { minHeight: 54, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontFamily: fonts.body, fontSize: 15 }, error: { fontFamily: fonts.bodyMedium, fontSize: 13 }, submit: { minHeight: 56, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }, submitText: { color: "#FFF", fontFamily: fonts.bodyBold, fontSize: 15 }, switchText: { fontFamily: fonts.bodyBold, fontSize: 13, textAlign: "center" } });
