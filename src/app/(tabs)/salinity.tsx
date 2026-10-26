import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  formatSalinityValue,
  salinityToSpecificGravity,
  salinityUnitLabels,
} from "@/constants/salinity";
import { useSalinityUnit } from "@/hooks/use-salinity-unit";
import { useTheme } from "@/hooks/use-theme";
import { getReadings, saveReading } from "@/lib/readings";

const INITIAL_SALINITY_PPT = 35;
const SALINITY_STATISTIC = "salinity";

function specificGravityToSalinity(specificGravity: number): number {
  let low = 0;
  let high = 50;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const converted = salinityToSpecificGravity(mid);

    if (converted < specificGravity) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return (low + high) / 2;
}

export default function SalinityScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { unit } = useSalinityUnit();

  const [salinityPpt, setSalinityPpt] = useState(INITIAL_SALINITY_PPT);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSavedSalinity() {
      try {
        const savedReadings = await getReadings();
        const latest = savedReadings.find(
          (reading) => reading.parameter === SALINITY_STATISTIC,
        );

        if (mounted && latest) {
          const pptValue =
            latest.unit === "sg"
              ? specificGravityToSalinity(latest.value)
              : latest.value;

          setSalinityPpt(pptValue);
        }
      } catch (error) {
        console.error("Could not load salinity reading:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSavedSalinity();

    return () => {
      mounted = false;
    };
  }, []);

  const displayedValue = formatSalinityValue(salinityPpt, unit);

  const openEditor = () => {
    setInputValue(String(displayedValue));
    setEditing(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditing(false);
    setInputValue("");
  };

  const saveValue = async () => {
    const trimmedValue = inputValue.trim();
    const numericValue = Number(trimmedValue);

    if (trimmedValue === "" || !Number.isFinite(numericValue)) {
      Alert.alert("Invalid reading", "Please enter a valid number.");
      return;
    }

    if (numericValue < 0) {
      Alert.alert("Invalid reading", "Salinity cannot be negative.");
      return;
    }

    let newPpt: number;

    if (unit === "sg") {
      if (numericValue < 0.99 || numericValue > 1.04) {
        Alert.alert(
          "Invalid reading",
          "Please enter a specific gravity between 0.99 and 1.04.",
        );
        return;
      }

      newPpt = specificGravityToSalinity(numericValue);
    } else {
      if (numericValue > 50) {
        Alert.alert(
          "Invalid reading",
          "Please enter a salinity value between 0 and 50.",
        );
        return;
      }

      newPpt = numericValue;
    }

    setSaving(true);

    try {
      await saveReading({
        parameter: SALINITY_STATISTIC,
        value: newPpt,
        unit: "ppt",
      });

      setSalinityPpt(newPpt);
      setEditing(false);
      setInputValue("");
    } catch (error) {
      console.error("Could not save salinity reading:", error);
      Alert.alert(
        "Could not save reading",
        "Your reading could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openHistory = () => {
    router.push({
      pathname: "/statistic/[statistic]",
      params: { statistic: SALINITY_STATISTIC },
    });
  };

  const colors = {
    background: theme.background,
    card: theme.backgroundElement,
    text: theme.text,
    muted: theme.textSecondary,
    border: theme.backgroundSelected,
    tint: "#148A91",
  };

  const unitLabel = salinityUnitLabels[unit] ?? `Salinity (${unit})`;

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.heading}>
          Salinity
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
          Monitor the concentration of dissolved salts in your aquarium.
        </ThemedText>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={{ color: colors.muted }}>
              Loading your reading...
            </ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardTitleContainer}>
              <ThemedText type="smallBold">{unitLabel}</ThemedText>
              <ThemedText
                style={[styles.description, { color: colors.muted }]}
              >
                Salt concentration in your aquarium water
              </ThemedText>
            </View>

            <View style={styles.valueRow}>
              <ThemedText type="title" style={styles.value}>
                {Number(displayedValue).toFixed(unit === "sg" ? 4 : 1)}
              </ThemedText>
              <ThemedText style={[styles.unit, { color: colors.muted }]}>
                {unit.toUpperCase()}
              </ThemedText>
            </View>

            <ThemedText style={[styles.conversion, { color: colors.muted }]}>
              {salinityPpt.toFixed(1)} ppt ≈ {salinityPpt.toFixed(1)} PSU
              {" ≈ "}
              {salinityToSpecificGravity(salinityPpt).toFixed(4)} SG
              {" at 25°C"}
            </ThemedText>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={openEditor}
                style={[styles.button, { backgroundColor: colors.tint }]}
              >
                <ThemedText style={styles.primaryButtonText}>
                  Edit reading
                </ThemedText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={openHistory}
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                ]}
              >
                <ThemedText style={{ color: colors.text }}>
                  View history
                </ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        <View
          style={[
            styles.note,
            {
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
        >
          <ThemedText type="smallBold">About Salinity</ThemedText>
          <ThemedText style={[styles.noteText, { color: colors.muted }]}>
            Marine aquariums commonly target around 35 ppt, but the appropriate
            range depends on the animals you keep. Specific gravity varies with
            temperature, so use a calibrated instrument and its temperature
            guidance when testing.
          </ThemedText>
        </View>
      </ScrollView>

      <Modal
        visible={editing}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText type="title" style={styles.modalTitle}>
              Edit reading
            </ThemedText>

            <ThemedText style={styles.inputLabel}>{unitLabel}</ThemedText>

            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="Enter measurement"
              placeholderTextColor={colors.muted}
              selectTextOnFocus
              editable={!saving}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={closeEditor}
                disabled={saving}
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: colors.border },
                ]}
              >
                <ThemedText style={{ color: colors.text }}>
                  Cancel
                </ThemedText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={saveValue}
                disabled={saving}
                style={[
                  styles.button,
                  { backgroundColor: colors.tint },
                  saving && styles.disabledButton,
                ]}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {saving ? "Saving..." : "Save reading"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    gap: 16,
  },
  heading: {
    color: "#148A91",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: -8,
  },
  loading: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cardTitleContainer: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  value: {
    fontSize: 34,
    lineHeight: 42,
  },
  unit: {
    fontSize: 14,
  },
  conversion: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  note: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "100%",
    maxWidth: 440,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});