import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { AgendaScreen } from "../features/agenda/screens/AgendaScreen";
import { AuthScreen } from "../features/auth/screens/AuthScreen";
import { useAuth } from "../features/auth/AuthProvider";
import { CatalogScreen } from "../features/catalog/screens/CatalogScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";
import { AdminUsersScreen } from "../features/admin/screens/AdminUsersScreen";
import { useAppTheme } from "../theme/ThemeProvider";
import { AnimatedTabBar } from "./AnimatedTabBar";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        animation: "shift",
      }}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      {user.accountType === "business" && <Tab.Screen name="Clientes">{() => <CatalogScreen kind="clients" />}</Tab.Screen>}
      {user.accountType === "business" && <Tab.Screen name="Servicos">{() => <CatalogScreen kind="services" />}</Tab.Screen>}
      {user.role === "admin" && <Tab.Screen name="Admin" component={AdminUsersScreen} />}
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
