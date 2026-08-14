import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Animated, View } from "react-native";

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
  const { user, workspaceMode } = useAuth();

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
      {workspaceMode === "business" && <Tab.Screen name="Clientes">{() => <CatalogScreen kind="clients" />}</Tab.Screen>}
      {workspaceMode === "business" && <Tab.Screen name="Servicos">{() => <CatalogScreen kind="services" />}</Tab.Screen>}
      {user.role === "admin" && <Tab.Screen name="Admin" component={AdminUsersScreen} />}
      <Tab.Screen name="Perfil">
        {() => <ProfileScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { loading, modeTransition, token } = useAuth();
  const { colors } = useAppTheme();

  if (loading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}><ActivityIndicator color={colors.accent} /></View>;

  const translateX = modeTransition.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const scale = modeTransition.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });

  return <Animated.View style={{ flex: 1, opacity: modeTransition, transform: [{ translateX }, { scale }] }}>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      {token ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Welcome" component={AuthScreen} />}
    </Stack.Navigator>
  </Animated.View>;
}
