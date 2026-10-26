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
import { useTheme } from "@/hooks/use-theme";
import { getReadings, saveReading } from "@/lib/readings";

type NitrogenReading = {
  statistic: string;
  title: string;
  value: number;
  unit: string;
  description: string;
  decimals: number;
};

const initialReadings: NitrogenReading[] = [
  {
    statistic: "nitrate",
    title: "Nitrate (NO₃)",
    value: 20,
    unit: "ppm",
    description: "End product of the aquarium nitrogen cycle",
    decimals: 1,
  },
  {
    statistic: "nitrite",
    title: "Nitrite (NO₂)",
    value: 0,
    unit: "ppm",
    description: "Toxic intermediate produced during nitrification",
    decimals: 1,
  },
  {
    statistic: "ammonia",
    title: "Ammonia (NH₃/NH₄⁺)",
    value: 0,
    unit: "ppm",
    description: "Waste product that can be toxic to aquatic life",
    decimals: 2,
  },
];

export default function NitrogenScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [readings, setReadings] = useState<NitrogenReading[]>(initialReadings);
  const [loading, setLoading] = useState(true);
  const [selectedReading, setSelectedReading] =
    useState<NitrogenReading | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSavedReadings() {
      try {
        const savedReadings = await getReadings();

        if (!mounted) return;

        setReadings((currentReadings) =>
          currentReadings.map((reading) => {
            const latest = savedReadings.find(
              (saved) => saved.parameter === reading.statistic,
            );

            return latest
              ? { ...reading, value: latest.value, unit: latest.unit }
              : reading;
          }),
        );
      } catch (error) {
        console.error("Could not load nitrogen readings:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSavedReadings();

    return () => {
      mounted = false;
    };
  }, []);

  const openEditor = (reading: NitrogenReading) => {
    setSelectedReading(reading);
    setInputValue(String(reading.value));
  };

  const closeEditor = () => {
    if (saving) return;
    setSelectedReading(null);
    setInputValue("");
  };

  const saveValue = async () => {
    if (!selectedReading) return;

    const trimmedValue = inputValue.trim();
    const numericValue = Number(trimmedValue);

    if (trimmedValue === "" || !Number.isFinite(numericValue)) {
      Alert.alert("Invalid reading", "Please enter a valid number.");
      return;
    }

    if (numericValue < 0) {
      Alert.alert("Invalid reading", "The reading cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const savedReading = await saveReading({
        parameter: selectedReading.statistic,
        value: numericValue,
        unit: selectedReading.unit,
      });

      setReadings((currentReadings) =>
        currentReadings.map((reading) =>
          reading.statistic === selectedReading.statistic
            ? { ...reading, value: savedReading.value }
            : reading,
        ),
      );

      setSelectedReading(null);
      setInputValue("");
    } catch (error) {
      console.error("Could not save nitrogen reading:", error);
      Alert.alert(
        "Could not save reading",
        "Your reading could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openHistory = (statistic: string) => {
    router.push({
      pathname: "/statistic/[statistic]",
      params: { statistic },
    });
  };

  const colors = {
    background: theme.background,
    card: theme.backgroundElement,
    text: theme.text,
    muted: theme.textSecondary,
    border: theme.backgroundSelected,
    tint: "#27845A",
  };

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.heading}>
          Nitrogen Cycle
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
          Monitor your aquarium's ammonia, nitrite, and nitrate to help assess
          your aquarium&apos;s biological filtration.
        </ThemedText>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={{ color: colors.muted }}>
              Loading your readings...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.cards}>
            {readings.map((reading) => (
              <View
                key={reading.statistic}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <ThemedText type="default">{reading.title}</ThemedText>
                    <ThemedText
                      style={[styles.description, { color: colors.muted }]}
                    >
                      {reading.description}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.valueRow}>
                  <ThemedText type="title" style={styles.value}>
                    {reading.value.toFixed(reading.decimals)}
                  </ThemedText>
                  <ThemedText style={[styles.unit, { color: colors.muted }]}>
                    {reading.unit}
                  </ThemedText>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openEditor(reading)}
                    style={[styles.button, { backgroundColor: colors.tint }]}
                  >
                    <ThemedText style={styles.primaryButtonText}>
                      Edit reading
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openHistory(reading.statistic)}
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
            ))}
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
          <ThemedText type="smallBold">About The Nitrogen Cycle</ThemedText>
          <ThemedText style={[styles.noteText, { color: colors.muted }]}>
            Ammonia and nitrite should generally remain at zero in an
            established aquarium. Nitrate tolerance varies by species and
            aquarium type. Use your livestock&apos;s requirements when
            interpreting results.
          </ThemedText>
        </View>
      </ScrollView>

      <Modal
        visible={selectedReading !== null}
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

            {selectedReading && (
              <>
                <ThemedText style={styles.inputLabel}>
                  {selectedReading.title} ({selectedReading.unit})
                </ThemedText>

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
              </>
            )}
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
    color: "#27845A",
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
  cards: {
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
