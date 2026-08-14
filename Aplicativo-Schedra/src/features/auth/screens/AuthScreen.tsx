import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiError } from "../../../shared/api/client";
import { useAppTheme } from "../../../theme/ThemeProvider";
import { fonts } from "../../../theme/tokens";
import { useAuth } from "../AuthProvider";

type AuthMode = "login" | "signup";

const getPasswordRequirements = (password: string) => [
  { id: "length", label: "Pelo menos 8 caracteres", met: password.length >= 8 },
  { id: "uppercase", label: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
  { id: "lowercase", label: "Uma letra minúscula", met: /[a-z]/.test(password) },
  { id: "number", label: "Um número", met: /\d/.test(password) },
  { id: "special", label: "Um caractere especial", met: /[^A-Za-z0-9]/.test(password) },
];

export function AuthScreen() {
  const { colors, mode, toggleTheme } = useAppTheme();
  const { signIn, signUp } = useAuth();
  const [screen, setScreen] = useState<AuthMode>("login");
  const [form, setForm] = useState({ name: "", cpf: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [switchWidth, setSwitchWidth] = useState(0);
  const transitionLocked = useRef(false);
  const selectorProgress = useRef(new Animated.Value(0)).current;
  const contentOffset = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentScale = useRef(new Animated.Value(1)).current;

  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const changeScreen = (nextScreen: AuthMode) => {
    if (nextScreen === screen || transitionLocked.current) return;

    transitionLocked.current = true;
    setError("");
    const direction = nextScreen === "signup" ? 1 : -1;

    Animated.timing(selectorProgress, {
      toValue: nextScreen === "signup" ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(contentOffset, {
        toValue: -direction * 34,
        duration: 140,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.985,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScreen(nextScreen);
      contentOffset.setValue(direction * 34);

      Animated.parallel([
        Animated.timing(contentOffset, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(contentScale, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        transitionLocked.current = false;
      });
    });
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (screen === "login") {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp(form);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Não foi possível acessar sua conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectorWidth = Math.max(0, (switchWidth - 8) / 2);
  const selectorTranslate = selectorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, selectorWidth],
  });
  const passwordRequirements = getPasswordRequirements(form.password);
  const passwordIsStrong = passwordRequirements.every((requirement) => requirement.met);
  const submitDisabled = submitting || (screen === "signup" && !passwordIsStrong);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View>
              <Text style={[styles.brand, { color: colors.text }]}>Schedra</Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]}>Agenda inteligente</Text>
            </View>
            <Pressable
              accessibilityLabel="Alternar tema"
              onPress={toggleTheme}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name={mode === "dark" ? "sunny-outline" : "moon-outline"} size={20} color={colors.text} />
            </Pressable>
          </View>

          <View
            onLayout={(event) => setSwitchWidth(event.nativeEvent.layout.width)}
            style={[styles.authSwitch, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {selectorWidth > 0 && (
              <Animated.View
                style={[
                  styles.authSwitchSelector,
                  {
                    width: selectorWidth,
                    backgroundColor: colors.accent,
                    transform: [{ translateX: selectorTranslate }],
                  },
                ]}
              />
            )}
            <AuthSwitchOption label="Entrar" selected={screen === "login"} onPress={() => changeScreen("login")} colors={colors} />
            <AuthSwitchOption label="Criar conta" selected={screen === "signup"} onPress={() => changeScreen("signup")} colors={colors} />
          </View>

          <Animated.View
            style={[
              styles.animatedContent,
              {
                opacity: contentOpacity,
                transform: [{ perspective: 900 }, { translateX: contentOffset }, { scale: contentScale }],
              },
            ]}
          >
            <View style={styles.heading}>
              <Text style={[styles.eyebrow, { color: colors.accent }]}>
                {screen === "signup" ? "COMECE AGORA" : "ACESSO SEGURO"}
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                {screen === "login" ? "Entrar no Schedra" : "Crie sua rotina"}
              </Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>
                {screen === "login"
                  ? "Continue de onde sua rotina parou."
                  : "Uma conta, dois jeitos de organizar o seu dia."}
              </Text>
            </View>

            <View style={styles.form}>
              {screen === "signup" && (
                <>
                  <Field label="Nome" value={form.name} onChangeText={(value) => update("name", value)} colors={colors} />
                  <Field
                    label="CPF"
                    value={form.cpf}
                    onChangeText={(value) => update("cpf", value)}
                    keyboardType="numeric"
                    colors={colors}
                  />
                </>
              )}
              <Field
                label="E-mail"
                value={form.email}
                onChangeText={(value) => update("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
                colors={colors}
              />
              <Field
                label="Senha"
                value={form.password}
                onChangeText={(value) => update("password", value)}
                secureTextEntry
                maxLength={72}
                colors={colors}
              />
              {screen === "signup" && <PasswordChecklist requirements={passwordRequirements} colors={colors} />}
              {!!error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
              <Pressable
                disabled={submitDisabled}
                onPress={submit}
                style={({ pressed }) => [
                  styles.submit,
                  { backgroundColor: colors.accent, opacity: submitDisabled ? 0.5 : pressed ? 0.88 : 1 },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.submitText}>{screen === "login" ? "Entrar" : "Criar conta"}</Text>
                    <Ionicons name="arrow-forward" color="#FFF" size={19} />
                  </>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthSwitchOption({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.authSwitchOption, pressed && styles.pressed]}
    >
      <Text style={[styles.authSwitchText, { color: selected ? "#FFF" : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

function PasswordChecklist({
  requirements,
  colors,
}: {
  requirements: ReturnType<typeof getPasswordRequirements>;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View
      accessibilityLabel="Requisitos da senha"
      style={[styles.passwordChecklist, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
    >
      <Text style={[styles.passwordChecklistTitle, { color: colors.text }]}>Sua senha precisa ter</Text>
      <View style={styles.passwordRequirements}>
        {requirements.map((requirement) => {
          const color = requirement.met ? colors.success : colors.danger;

          return (
            <View key={requirement.id} style={styles.passwordRequirement}>
              <Ionicons
                name={requirement.met ? "checkmark-circle" : "close-circle-outline"}
                size={18}
                color={color}
              />
              <Text style={[styles.passwordRequirementText, { color }]}>{requirement.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Field({
  label,
  colors,
  ...props
}: { label: string; colors: ReturnType<typeof useAppTheme>["colors"] } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, gap: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontFamily: fonts.bodyBold, fontSize: 23 },
  tagline: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  authSwitch: { height: 52, padding: 4, borderRadius: 8, borderWidth: 1, flexDirection: "row", position: "relative" },
  authSwitchSelector: { position: "absolute", left: 4, top: 4, bottom: 4, borderRadius: 6 },
  authSwitchOption: { flex: 1, alignItems: "center", justifyContent: "center", zIndex: 1 },
  authSwitchText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  animatedContent: { gap: 24 },
  heading: { gap: 8, marginTop: 8 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11 },
  title: { fontFamily: fonts.displayBold, fontSize: 42 },
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  form: { gap: 18 },
  field: { gap: 7 },
  label: { fontFamily: fonts.bodyBold, fontSize: 13 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontFamily: fonts.body, fontSize: 15 },
  error: { fontFamily: fonts.bodyMedium, fontSize: 13 },
  passwordChecklist: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 11 },
  passwordChecklistTitle: { fontFamily: fonts.bodyBold, fontSize: 12 },
  passwordRequirements: { gap: 8 },
  passwordRequirement: { flexDirection: "row", alignItems: "center", gap: 8 },
  passwordRequirementText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 12 },
  submit: { minHeight: 56, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitText: { color: "#FFF", fontFamily: fonts.bodyBold, fontSize: 15 },
  pressed: { opacity: 0.72 },
});
