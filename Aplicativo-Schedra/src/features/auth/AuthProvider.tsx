import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform } from "react-native";

import * as authApi from "./api/auth-api";
import type { AccountType, AuthUser, LoginInput, SignupInput } from "./types";

type StoredSession = { token: string; user: AuthUser; workspaceMode: AccountType };
type AuthContextValue = StoredSession & {
  loading: boolean;
  modeTransition: Animated.Value;
  setWorkspaceMode: (mode: AccountType) => Promise<void>;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
};

const STORAGE_KEY = "schedra.session";
const emptySession: StoredSession = { token: "", user: null as unknown as AuthUser, workspaceMode: "business" };
const AuthContext = createContext<AuthContextValue | null>(null);

const sessionStorage = {
  get: () => Platform.OS === "web" ? AsyncStorage.getItem(STORAGE_KEY) : SecureStore.getItemAsync(STORAGE_KEY),
  set: (value: string) => Platform.OS === "web" ? AsyncStorage.setItem(STORAGE_KEY, value) : SecureStore.setItemAsync(STORAGE_KEY, value),
  remove: () => Platform.OS === "web" ? AsyncStorage.removeItem(STORAGE_KEY) : SecureStore.deleteItemAsync(STORAGE_KEY),
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession>(emptySession);
  const [loading, setLoading] = useState(true);
  const modeTransition = useRef(new Animated.Value(1)).current;
  const modeTransitionLocked = useRef(false);

  useEffect(() => {
    sessionStorage.get().then((stored) => {
      if (stored) {
        const restored = JSON.parse(stored) as Partial<StoredSession> & Pick<StoredSession, "token" | "user">;
        setSession({ ...restored, workspaceMode: restored.workspaceMode ?? restored.user.accountType ?? "business" });
      }
    }).finally(() => setLoading(false));
  }, []);

  const persist = async (nextSession: StoredSession) => {
    setSession(nextSession);
    await sessionStorage.set(JSON.stringify(nextSession));
  };

  const value = useMemo<AuthContextValue>(() => ({
    ...session,
    loading,
    modeTransition,
    setWorkspaceMode: async (workspaceMode) => {
      if (workspaceMode === session.workspaceMode || modeTransitionLocked.current) return;
      modeTransitionLocked.current = true;

      await new Promise<void>((resolve) => {
        Animated.timing(modeTransition, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }).start(async () => {
          try {
            await persist({ ...session, workspaceMode });
          } catch {
            setSession({ ...session, workspaceMode });
          }
          Animated.timing(modeTransition, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            modeTransitionLocked.current = false;
            resolve();
          });
        });
      });
    },
    signIn: async (input) => {
      const response = await authApi.login(input);
      await persist({ token: response.token, user: response.user, workspaceMode: "business" });
    },
    signUp: async (input) => {
      await authApi.signup(input);
      const response = await authApi.login({
        email: input.email,
        password: input.password,
      });
      await persist({ token: response.token, user: response.user, workspaceMode: "business" });
    },
    signOut: async () => {
      setSession(emptySession);
      await sessionStorage.remove();
    },
    setUser: async (user) => persist({ ...session, user }),
  }), [loading, modeTransition, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
