import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { Colors, SectionColors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{
        default: { color: colors.textSecondary },
        selected: { color: colors.text },
      }}
    >
      <NativeTabs.Trigger name="chemistry">
        <NativeTabs.Trigger.Label
          selectedStyle={{ color: SectionColors.chemistry }}
        >
          Water Chemistry
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="testtube.2"
          md="science"
          selectedColor={SectionColors.chemistry}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="nitrogen">
        <NativeTabs.Trigger.Label
          selectedStyle={{ color: SectionColors.nitrogen }}
        >
          Nitrogen Cycle
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="arrow.triangle.2.circlepath"
          md="autorenew"
          selectedColor={SectionColors.nitrogen}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="salinity">
        <NativeTabs.Trigger.Label
          selectedStyle={{ color: SectionColors.salinity }}
        >
          Salinity
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "drop", selected: "drop.fill" }}
          md="water_drop"
          selectedColor={SectionColors.salinity}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="temperature">
        <NativeTabs.Trigger.Label
          selectedStyle={{ color: SectionColors.temperature }}
        >
          Temperature
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="thermometer.medium"
          md="device_thermostat"
          selectedColor={SectionColors.temperature}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label
          selectedStyle={{ color: SectionColors.settings }}
        >
          Settings
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
          selectedColor={SectionColors.settings}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
