import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
  useFonts as useOswaldFonts,
} from "@expo-google-fonts/oswald";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  useFonts as useRobotoFonts,
} from "@expo-google-fonts/roboto";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeProvider, useAppTheme } from "./src/theme/ThemeProvider";

function Application() {
  const { colors, navigationTheme, mode } = useAppTheme();
  const [oswaldLoaded] = useOswaldFonts({
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });
  const [robotoLoaded] = useRobotoFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!oswaldLoaded || !robotoLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Application />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
