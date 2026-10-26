import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { salinityUnitLabels, type SalinityUnit } from "@/constants/salinity";
import {
  temperatureUnitLabels,
  type TemperatureUnit,
} from "@/constants/temperature";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useSalinityUnit } from "@/hooks/use-salinity-unit";
import { useTemperatureUnit } from "@/hooks/use-temperature-unit";

const salinityUnits: SalinityUnit[] = ["ppt", "sg", "psu"];
const temperatureUnits: TemperatureUnit[] = ["celsius", "fahrenheit"];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { unit, setUnit } = useSalinityUnit();
  const { unit: temperatureUnit, setUnit: setTemperatureUnit } =
    useTemperatureUnit();

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
      >
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle" style={styles.heading}>
            Settings
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.description}>
            Personalise how your aquarium readings are displayed.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.settingCard}>
            <ThemedText type="smallBold">Salinity unit</ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              Choose your preferred unit for salinity readings throughout the
              app.
            </ThemedText>

            <View style={styles.options}>
              {salinityUnits.map((option) => {
                const isSelected = option === unit;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setUnit(option)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <ThemedText
                        type="smallBold"
                        themeColor={isSelected ? "text" : "textSecondary"}
                      >
                        {salinityUnitLabels[option]}
                      </ThemedText>

                      <ThemedText type="small" themeColor="textSecondary">
                        {option === "ppt"
                          ? "Parts per thousand"
                          : option === "sg"
                            ? "Specific gravity"
                            : "Practical salinity units"}
                      </ThemedText>
                    </View>

                    {isSelected && <ThemedText type="smallBold">✓</ThemedText>}
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.settingCard}>
            <ThemedText type="smallBold">Temperature unit</ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              Choose whether water temperature is displayed in Celsius or
              Fahrenheit throughout the app.
            </ThemedText>

            <View style={styles.options}>
              {temperatureUnits.map((option) => {
                const isSelected = option === temperatureUnit;

                return (
                  <Pressable
                    key={option}
                    onPress={() => setTemperatureUnit(option)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.selectedOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionContent}>
                      <ThemedText
                        type="smallBold"
                        themeColor={isSelected ? "text" : "textSecondary"}
                      >
                        {temperatureUnitLabels[option]}
                      </ThemedText>

                      <ThemedText type="small" themeColor="textSecondary">
                        {option === "celsius"
                          ? "Metric temperature scale"
                          : "Imperial temperature scale"}
                      </ThemedText>
                    </View>

                    {isSelected && <ThemedText type="smallBold">✓</ThemedText>}
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold">About Your Settings</ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              Your selected salinity and temperature units are shared with their
              respective tabs. Changing a preference updates how readings are
              displayed.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignItems: "center",
    padding: Spacing.four,
    gap: Spacing.two,
  },

  heading: {
    color: "#737B87",
  },

  description: {
    textAlign: "center",
    maxWidth: 420,
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },

  settingCard: {
    width: "100%",
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },

  options: {
    gap: Spacing.one,
    marginTop: Spacing.one,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },

  optionContent: {
    flex: 1,
    gap: Spacing.one,
  },

  selectedOption: {
    backgroundColor: "rgba(128, 128, 128, 0.2)",
  },

  infoCard: {
    width: "100%",
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },

  pressed: {
    opacity: 0.7,
  },
});
