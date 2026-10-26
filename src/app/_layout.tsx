import { Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SalinityUnitProvider } from "@/hooks/use-salinity-unit";
import { TemperatureUnitProvider } from "@/hooks/use-temperature-unit";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <SalinityUnitProvider>
        <TemperatureUnitProvider>
          <AnimatedSplashOverlay />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="statistic/[statistic]" />
            <Stack.Screen name="pHStats" />
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
          </Stack>
        </TemperatureUnitProvider>
      </SalinityUnitProvider>
    </ThemeProvider>
  );
}