import { useRouter } from "expo-router";
import { useState } from "react";
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
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

const readings = [7.0, 7.1, 7.2, 7.2, 7.3, 7.2, 7.2];
const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];
const chartHeight = 220;

export default function PHStatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [chartWidth, setChartWidth] = useState(0);
  const minimum = Math.min(...readings);
  const maximum = Math.max(...readings);
  const padding = 0.1;
  const minY = minimum - padding;
  const maxY = maximum + padding;
  const pointX = (index: number) =>
    (chartWidth * index) / (readings.length - 1);
  const pointY = (value: number) =>
    chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
  const contentInset = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const handleChartLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={contentInset}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="smallBold">Back</ThemedText>
        </Pressable>

        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">pH history</ThemedText>
          <ThemedText themeColor="textSecondary">
            Observe your pH trend over the past week.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.currentCard}>
          <ThemedText type="smallBold">Current reading</ThemedText>
          <ThemedText type="title" style={styles.currentValue}>
            7.2
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            pH
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.chartCard}>
          <ThemedView style={styles.chartHeader}>
            <ThemedText type="smallBold">Past 7 days</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              pH
            </ThemedText>
          </ThemedView>

          <View onLayout={handleChartLayout} style={styles.chart}>
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
              readings.slice(0, -1).map((reading, index) => {
                const startX = pointX(index);
                const startY = pointY(reading);
                const endX = pointX(index + 1);
                const endY = pointY(readings[index + 1]);
                const length = Math.sqrt(
                  (endX - startX) ** 2 + (endY - startY) ** 2,
                );
                const angle =
                  (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI;

                return (
                  <View
                    key={`${days[index]}-${days[index + 1]}`}
                    style={[
                      styles.segment,
                      {
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
              readings.map((reading, index) => (
                <View
                  key={`${days[index]}-point`}
                  style={[
                    styles.point,
                    {
                      left: pointX(index) - 5,
                      top: pointY(reading) - 5,
                    },
                  ]}
                />
              ))}
          </View>

          <View style={styles.axisLabels}>
            {days.map((day) => (
              <ThemedText key={day} type="small" themeColor="textSecondary">
                {day}
              </ThemedText>
            ))}
          </View>

          <View style={styles.valueLabels}>
            <ThemedText type="small" themeColor="textSecondary">
              {maxY.toFixed(1)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {minY.toFixed(1)}
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  contentContainer: { flexDirection: "row", justifyContent: "center" },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  backButton: { paddingVertical: Spacing.two, alignSelf: "flex-start" },
  header: { gap: Spacing.one, paddingVertical: Spacing.four },
  currentCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  currentValue: { fontSize: 36 },
  chartCard: {
    marginTop: Spacing.two,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between" },
  chart: {
    height: chartHeight,
    marginTop: Spacing.three,
    position: "relative",
  },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  segment: {
    backgroundColor: "#208AEF",
    height: 3,
    position: "absolute",
    transformOrigin: "left center",
  },
  point: {
    backgroundColor: "#208AEF",
    borderRadius: 5,
    height: 10,
    position: "absolute",
    width: 10,
  },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.one,
  },
  valueLabels: {
    position: "absolute",
    right: Spacing.three,
    top: 58,
    gap: 180,
  },
});
