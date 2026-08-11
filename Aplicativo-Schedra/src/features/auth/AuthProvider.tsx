import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import * as authApi from "./api/auth-api";
import type { AuthUser, LoginInput, SignupInput } from "./types";

type StoredSession = { token: string; user: AuthUser };
type AuthContextValue = StoredSession & {
  loading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
};

const STORAGE_KEY = "schedra.session";
const emptySession: StoredSession = { token: "", user: null as unknown as AuthUser };
const AuthContext = createContext<AuthContextValue | null>(null);

const sessionStorage = {
  get: () => Platform.OS === "web" ? AsyncStorage.getItem(STORAGE_KEY) : SecureStore.getItemAsync(STORAGE_KEY),
  set: (value: string) => Platform.OS === "web" ? AsyncStorage.setItem(STORAGE_KEY, value) : SecureStore.setItemAsync(STORAGE_KEY, value),
  remove: () => Platform.OS === "web" ? AsyncStorage.removeItem(STORAGE_KEY) : SecureStore.deleteItemAsync(STORAGE_KEY),
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredSession>(emptySession);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStorage.get().then((stored) => {
      if (stored) setSession(JSON.parse(stored) as StoredSession);
    }).finally(() => setLoading(false));
  }, []);

  const persist = async (nextSession: StoredSession) => {
    setSession(nextSession);
    await sessionStorage.set(JSON.stringify(nextSession));
  };

  const value = useMemo<AuthContextValue>(() => ({
    ...session,
    loading,
    signIn: async (input) => {
      const response = await authApi.login(input);
      await persist({ token: response.token, user: response.user });
    },
    signUp: async (input) => {
      await authApi.signup(input);
      const response = await authApi.login({
        email: input.email,
        password: input.password,
        accountType: input.accountType,
      });
      await persist({ token: response.token, user: response.user });
    },
    signOut: async () => {
      setSession(emptySession);
      await sessionStorage.remove();
    },
    setUser: async (user) => persist({ ...session, user }),
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
