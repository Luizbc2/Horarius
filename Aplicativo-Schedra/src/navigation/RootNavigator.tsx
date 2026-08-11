import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Platform, View } from "react-native";

import { AgendaScreen } from "../features/agenda/screens/AgendaScreen";
import { AuthScreen } from "../features/auth/screens/AuthScreen";
import { useAuth } from "../features/auth/AuthProvider";
import { CatalogScreen } from "../features/catalog/screens/CatalogScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { useAppTheme } from "../theme/ThemeProvider";
import { fonts } from "../theme/tokens";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Agenda: "time-outline",
  Clientes: "people-outline",
  Servicos: "cut-outline",
  Perfil: "person-outline",
};

function MainTabs() {
  const { colors } = useAppTheme();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 86 : 70,
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={focused ? tabIcons[route.name].replace("-outline", "") as keyof typeof Ionicons.glyphMap : tabIcons[route.name]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      {user.accountType === "business" && <Tab.Screen name="Clientes">{() => <CatalogScreen kind="clients" />}</Tab.Screen>}
      {user.accountType === "business" && <Tab.Screen name="Servicos">{() => <CatalogScreen kind="services" />}</Tab.Screen>}
      <Tab.Screen name="Perfil">
        {() => <ProfileScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { loading, token } = useAuth();
  const { colors } = useAppTheme();

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.accent} /></View>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Welcome" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
