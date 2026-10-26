import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  formatSalinityValue,
  salinityToSpecificGravity,
  salinityUnitLabels,
  type SalinityUnit,
} from "@/constants/salinity";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useSalinityUnit } from "@/hooks/use-salinity-unit";
import { useTheme } from "@/hooks/use-theme";
import { getReadings, type AquariumReading } from "@/lib/readings";

type StatisticDefinition = {
  title: string;
  unit: string;
  decimals: number;
};

const statistics: Record<string, StatisticDefinition> = {
  ph: {
    title: "pH",
    unit: "pH",
    decimals: 1,
  },
  kh: {
    title: "kH",
    unit: "dKH",
    decimals: 1,
  },
  gh: {
    title: "gH",
    unit: "dGH",
    decimals: 1,
  },
  nitrate: {
    title: "Nitrate",
    unit: "ppm",
    decimals: 0,
  },
  nitrite: {
    title: "Nitrite",
    unit: "ppm",
    decimals: 1,
  },
  ammonia: {
    title: "Ammonia",
    unit: "ppm",
    decimals: 1,
  },
  salinity: {
    title: "Salinity",
    unit: "ppt",
    decimals: 1,
  },
  temperature: {
    title: "Temperature",
    unit: "°C",
    decimals: 1,
  },
  oxygen: {
    title: "Dissolved oxygen",
    unit: "mg/L",
    decimals: 1,
  },
};

function valueForUnit(value: number, statistic: string, unit: SalinityUnit) {
  if (statistic === "salinity" && unit === "sg") {
    return salinityToSpecificGravity(value);
  }

  return value;
}

function displayUnit(statistic: string, unit: SalinityUnit) {
  if (statistic === "salinity") {
    return salinityUnitLabels[unit].replace(/^.*\(/, "").replace(/\)$/, "");
  }

  return statistics[statistic]?.unit ?? "";
}

function formatDateLabel(recordedAt: string) {
  const date = new Date(recordedAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

function formatTimestamp(recordedAt: string) {
  const date = new Date(recordedAt);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrendChart({
  readings,
  statistic,
  definition,
  unit,
}: {
  readings: AquariumReading[];
  statistic: string;
  definition: StatisticDefinition;
  unit: SalinityUnit;
}) {
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(0);

  const chartHeight = 220;

  const values = readings.map((reading) =>
    valueForUnit(reading.value, statistic, unit),
  );

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const padding = Math.max(
    (maximum - minimum) * 0.25,
    statistic === "salinity" ? 0.05 : 0.1,
  );

  const minY = minimum - padding;
  const maxY = maximum + padding;

  const pointX = (index: number) => {
    if (values.length <= 1) {
      return chartWidth / 2;
    }

    return (chartWidth * index) / (values.length - 1);
  };

  const pointY = (value: number) =>
    chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <ThemedView type="backgroundElement" style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <ThemedText type="smallBold">Recorded measurements</ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {displayUnit(statistic, unit)}
        </ThemedText>
      </View>

      <View onLayout={handleLayout} style={styles.chart}>
        {[0, 1, 2, 3].map((line) => (
          <View
            key={line}
            style={[
              styles.gridLine,
              {
                top: (chartHeight * line) / 3,
                backgroundColor: theme.backgroundSelected,
              },
            ]}
          />
        ))}

        {chartWidth > 0 &&
          values.slice(0, -1).map((value, index) => {
            const startX = pointX(index);
            const startY = pointY(value);
            const endX = pointX(index + 1);
            const endY = pointY(values[index + 1]);

            const length = Math.sqrt(
              (endX - startX) ** 2 + (endY - startY) ** 2,
            );

            const angle =
              (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

            return (
              <View
                key={readings[index].id}
                style={[
                  styles.segment,
                  {
                    backgroundColor: "#208AEF",
                    left: startX,
                    top: startY,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}

        {chartWidth > 0 &&
          values.map((value, index) => (
            <View
              key={readings[index].id}
              style={[
                styles.point,
                {
                  backgroundColor: "#208AEF",
                  left: pointX(index) - 5,
                  top: pointY(value) - 5,
                },
              ]}
            />
          ))}
      </View>

      <View style={styles.axisLabels}>
        {readings.map((reading) => (
          <ThemedText
            key={reading.id}
            type="small"
            themeColor="textSecondary"
            style={styles.axisLabel}
            numberOfLines={1}
          >
            {formatDateLabel(reading.recordedAt)}
          </ThemedText>
        ))}
      </View>

      <View style={styles.valueLabels}>
        <ThemedText type="small" themeColor="textSecondary">
          {maxY.toFixed(definition.decimals)}
        </ThemedText>

        <ThemedText type="small" themeColor="textSecondary">
          {minY.toFixed(definition.decimals)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

export default function StatisticTrendScreen() {
  const router = useRouter();

  const { statistic: statisticParam } = useLocalSearchParams<{
    statistic?: string | string[];
  }>();

  const statistic = Array.isArray(statisticParam)
    ? statisticParam[0]
    : statisticParam;

  const { unit } = useSalinityUnit();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [allReadings, setAllReadings] = useState<AquariumReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const definition = statistic ? statistics[statistic] : undefined;

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      setIsLoading(true);
      setLoadError(false);

      try {
        const savedReadings = await getReadings();

        if (isActive) {
          setAllReadings(savedReadings);
        }
      } catch (error) {
        console.error("Could not load reading history:", error);

        if (isActive) {
          setLoadError(true);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isActive = false;
    };
  }, [statistic]);

  const readings = allReadings
    .filter(
      (reading) =>
        reading.parameter === statistic &&
        Number.isFinite(reading.value) &&
        !Number.isNaN(new Date(reading.recordedAt).getTime()),
    )
    .sort(
      (a, b) =>
        new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
    );

  const chartReadings = readings.slice(-7);
  const latestReading = readings[readings.length - 1];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback to the main tab layout if no previous screen exists.
      router.replace("/");
    }
  };

  if (!definition || !statistic) {
    return (
      <ThemedView
        style={[
          styles.emptyState,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ThemedText type="subtitle">Statistic not found</ThemedText>

        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to readings"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <ThemedText type="smallBold">← Back to readings</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const currentValue = latestReading
    ? valueForUnit(latestReading.value, statistic, unit)
    : null;

  const currentValueLabel =
    latestReading && statistic === "salinity"
      ? formatSalinityValue(latestReading.value, unit)
      : currentValue !== null
        ? currentValue.toFixed(definition.decimals)
        : "—";

  return (
    <ThemedView style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
      >
        <ThemedView style={styles.container}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">{definition.title}</ThemedText>

            <ThemedText themeColor="textSecondary">
              Historical measurements and recent readings
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.currentCard}>
            <ThemedText type="smallBold">Latest recorded reading</ThemedText>

            <ThemedText type="title" style={styles.currentValue}>
              {currentValueLabel}
            </ThemedText>

            <ThemedText type="small" themeColor="textSecondary">
              {displayUnit(statistic, unit)}
            </ThemedText>

            {latestReading && (
              <ThemedText type="small" themeColor="textSecondary">
                Recorded {formatTimestamp(latestReading.recordedAt)}
              </ThemedText>
            )}
          </ThemedView>

          {isLoading ? (
            <ThemedView style={styles.messageCard}>
              <ThemedText>Loading reading history...</ThemedText>
            </ThemedView>
          ) : loadError ? (
            <ThemedView style={styles.messageCard}>
              <ThemedText type="smallBold">Couldn't load history</ThemedText>

              <ThemedText themeColor="textSecondary">
                Please return to the previous screen and try again.
              </ThemedText>
            </ThemedView>
          ) : readings.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.messageCard}>
              <ThemedText type="smallBold">No readings recorded yet</ThemedText>

              <ThemedText themeColor="textSecondary">
                Save a measurement for {definition.title} to begin building your
                history and trend chart. Sample data is not shown here.
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {chartReadings.length >= 2 ? (
                <TrendChart
                  readings={chartReadings}
                  statistic={statistic}
                  definition={definition}
                  unit={unit}
                />
              ) : (
                <ThemedView type="backgroundElement" style={styles.messageCard}>
                  <ThemedText type="smallBold">
                    Your trend is just beginning
                  </ThemedText>

                  <ThemedText themeColor="textSecondary">
                    Record at least two measurements to see a line chart. Your
                    first measurement has been saved.
                  </ThemedText>
                </ThemedView>
              )}

              <ThemedView style={styles.historySection}>
                <ThemedText type="subtitle">Reading history</ThemedText>

                {[...readings].reverse().map((reading) => {
                  const convertedValue = valueForUnit(
                    reading.value,
                    statistic,
                    unit,
                  );

                  const valueLabel =
                    statistic === "salinity"
                      ? formatSalinityValue(reading.value, unit)
                      : convertedValue.toFixed(definition.decimals);

                  return (
                    <ThemedView
                      key={reading.id}
                      type="backgroundElement"
                      style={styles.historyItem}
                    >
                      <View style={styles.historyText}>
                        <ThemedText type="smallBold">
                          {valueLabel} {displayUnit(statistic, unit)}
                        </ThemedText>

                        <ThemedText type="small" themeColor="textSecondary">
                          {formatTimestamp(reading.recordedAt)}
                        </ThemedText>
                      </View>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </>
          )}

          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back to readings"
            style={({ pressed }) => [
              styles.bottomBackButton,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold">← Back to readings</ThemedText>
          </Pressable>
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
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  backButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    alignSelf: "flex-start",
    borderRadius: Spacing.two,
  },
  bottomBackButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignSelf: "flex-start",
    borderRadius: Spacing.two,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  pressed: {
    opacity: 0.65,
  },
  header: {
    gap: Spacing.one,
    paddingVertical: Spacing.four,
  },
  currentCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  currentValue: {
    fontSize: 36,
  },
  chartCard: {
    marginTop: Spacing.two,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chart: {
    height: 220,
    marginTop: Spacing.three,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  segment: {
    height: 3,
    position: "absolute",
    transformOrigin: "left center",
  },
  point: {
    borderRadius: 5,
    height: 10,
    position: "absolute",
    width: 10,
  },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.one,
    gap: 2,
  },
  axisLabel: {
    textAlign: "center",
    flexShrink: 1,
    fontSize: 10,
  },
  valueLabels: {
    position: "absolute",
    right: Spacing.three,
    top: 58,
    gap: 180,
  },
  messageCard: {
    marginTop: Spacing.two,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  historySection: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  historyItem: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  historyText: {
    gap: Spacing.one,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
});
