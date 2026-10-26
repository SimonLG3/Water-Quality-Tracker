import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { convertTemperature } from "@/constants/temperature";
import { Spacing } from "@/constants/theme";
import { useTemperatureUnit } from "@/hooks/use-temperature-unit";
import { useTheme } from "@/hooks/use-theme";
import { getReadings, saveReading } from "@/lib/readings";

type ReadingType = "temperature" | "oxygen";

type Reading = {
  label: string;
  value: number;
  unit: string;
  note: string;
  min: number;
  max: number;
  decimals: number;
};

const INITIAL_READINGS: Record<ReadingType, Reading> = {
  temperature: {
    label: "Temperature",
    value: 25.0,
    unit: "°C",
    note: "Water temperature",
    min: 0,
    max: 40,
    decimals: 1,
  },
  oxygen: {
    label: "Dissolved Oxygen",
    value: 7.5,
    unit: "mg/L",
    note: "Dissolved oxygen concentration",
    min: 0,
    max: 20,
    decimals: 1,
  },
};

export default function TemperatureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { unit: temperatureUnit } = useTemperatureUnit();

  const [readings, setReadings] =
    useState<Record<ReadingType, Reading>>(INITIAL_READINGS);

  const [loading, setLoading] = useState(true);
  const [editingReading, setEditingReading] = useState<ReadingType | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReadings() {
      try {
        const savedReadings = await getReadings();

        if (!active) return;

        setReadings((current) => {
          const updated = { ...current };

          (["temperature", "oxygen"] as ReadingType[]).forEach((type) => {
            const latest = savedReadings.find(
              (item) => item.parameter === type,
            );

            if (latest) {
              updated[type] = {
                ...updated[type],
                value: latest.value,
              };
            }
          });

          return updated;
        });
      } catch {
        if (active) {
          Alert.alert(
            "Unable to load readings",
            "Your saved readings could not be loaded. Please try again later.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReadings();

    return () => {
      active = false;
    };
  }, []);

  const getDisplayValue = (type: ReadingType, value: number): number => {
    if (type !== "temperature") {
      return value;
    }

    return convertTemperature(value, "celsius", temperatureUnit);
  };

  const getDisplayUnit = (type: ReadingType): string => {
    if (type === "temperature") {
      return temperatureUnit === "celsius" ? "°C" : "°F";
    }

    return readings.oxygen.unit;
  };

  const getValidRange = (type: ReadingType) => {
    if (type === "temperature" && temperatureUnit === "fahrenheit") {
      return { min: 32, max: 104 };
    }

    return {
      min: readings[type].min,
      max: readings[type].max,
    };
  };

  const openEditor = (type: ReadingType) => {
    const reading = readings[type];
    const displayValue = getDisplayValue(type, reading.value);

    setEditingReading(type);
    setInputValue(displayValue.toFixed(reading.decimals));
  };

  const closeEditor = () => {
    if (saving) return;

    setEditingReading(null);
    setInputValue("");
  };

  const editingReadingData = editingReading ? readings[editingReading] : null;

  const editingUnit = editingReading ? getDisplayUnit(editingReading) : "";

  const editingRange = editingReading ? getValidRange(editingReading) : null;

  const parsedValue = Number(inputValue);

  const inputIsValid =
    editingReadingData !== null &&
    editingRange !== null &&
    inputValue.trim() !== "" &&
    Number.isFinite(parsedValue) &&
    parsedValue >= editingRange.min &&
    parsedValue <= editingRange.max;

  const saveValue = async () => {
    if (!editingReading || !editingReadingData || !inputIsValid) {
      return;
    }

    setSaving(true);

    try {
      // Keep temperature records stored in Celsius, regardless of
      // which unit the user has selected for display.
      const valueToSave =
        editingReading === "temperature"
          ? convertTemperature(parsedValue, temperatureUnit, "celsius")
          : parsedValue;

      const unitToSave =
        editingReading === "temperature" ? "°C" : editingReadingData.unit;

      await saveReading({
        parameter: editingReading,
        value: valueToSave,
        unit: unitToSave,
      });

      setReadings((current) => ({
        ...current,
        [editingReading]: {
          ...current[editingReading],
          value: valueToSave,
        },
      }));

      setEditingReading(null);
      setInputValue("");
    } catch {
      Alert.alert(
        "Unable to save reading",
        "Your reading could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openHistory = (type: ReadingType) => {
    router.push({
      pathname: "/statistic/[statistic]",
      params: { statistic: type },
    });
  };

  const renderReadingCard = (type: ReadingType) => {
    const reading = readings[type];
    const displayValue = getDisplayValue(type, reading.value);
    const displayUnit = getDisplayUnit(type);

    return (
      <ThemedView key={type} type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">{reading.label}</ThemedText>

        <ThemedText type="title" style={styles.value}>
          {displayValue.toFixed(reading.decimals)} {displayUnit}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {reading.note}
        </ThemedText>

        <View style={styles.actions}>
          <Pressable
            onPress={() => openEditor(type)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold">Edit reading</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => openHistory(type)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              {
                borderColor: theme.backgroundSelected,
              },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold">View history</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  };

  return (
    <>
      <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="subtitle" style={styles.heading}>
            Temperature
          </ThemedText>

          <ThemedText themeColor="textSecondary" style={styles.description}>
            Monitor water temperature and dissolved oxygen levels in your
            aquarium.
          </ThemedText>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.text}
              style={styles.loader}
            />
          ) : (
            <>
              {renderReadingCard("temperature")}
              {renderReadingCard("oxygen")}
            </>
          )}

          <ThemedView type="backgroundElement" style={styles.referenceCard}>
            <ThemedText type="smallBold">About Water Temperature</ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              Temperature affects aquarium health, metabolism, and the amount of
              oxygen water can hold.
            </ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              Dissolved oxygen measures the oxygen available in the water for
              fish, invertebrates, plants, and microorganisms.
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </ThemedView>

      <Modal
        visible={editingReading !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <ThemedText type="subtitle">
              Edit {editingReadingData?.label}
            </ThemedText>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.modalDescription}
            >
              Enter the current {editingReadingData?.label.toLowerCase()} in{" "}
              {editingUnit}.
            </ThemedText>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.backgroundSelected,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder={`e.g. ${
                editingReadingData
                  ? getDisplayValue(
                      editingReading!,
                      editingReadingData.value,
                    ).toFixed(editingReadingData.decimals)
                  : ""
              }`}
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText type="small" themeColor="textSecondary">
              Valid range: {editingRange?.min}–{editingRange?.max} {editingUnit}
            </ThemedText>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={closeEditor}
                disabled={saving}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold">Cancel</ThemedText>
              </Pressable>

              <Pressable
                onPress={saveValue}
                disabled={!inputIsValid || saving}
                style={({ pressed }) => [
                  styles.button,
                  styles.primaryButton,
                  (!inputIsValid || saving) && styles.disabledButton,
                  pressed && inputIsValid && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold">
                  {saving ? "Saving..." : "Save"}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },

  heading: {
    color: "#C66A24",
  },

  description: {
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },

  loader: {
    marginVertical: Spacing.four,
  },

  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },

  value: {
    fontSize: 36,
    marginTop: Spacing.one,
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },

  button: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: "#C66A24",
  },

  secondaryButton: {
    borderWidth: 1,
  },

  cancelButton: {
    opacity: 0.8,
  },

  pressed: {
    opacity: 0.65,
  },

  disabledButton: {
    opacity: 0.4,
  },

  referenceCard: {
    marginTop: Spacing.two,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  modalCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
  },

  modalDescription: {
    lineHeight: 20,
  },

  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 20,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
