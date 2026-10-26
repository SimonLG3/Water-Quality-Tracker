import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

import { type TemperatureUnit } from "@/constants/temperature";

type TemperatureUnitContextValue = {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
};

const TemperatureUnitContext =
  createContext<TemperatureUnitContextValue | null>(null);

export function TemperatureUnitProvider({ children }: PropsWithChildren) {
  const [unit, setUnit] = useState<TemperatureUnit>("celsius");

  return (
    <TemperatureUnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </TemperatureUnitContext.Provider>
  );
}

export function useTemperatureUnit() {
  const context = useContext(TemperatureUnitContext);

  if (!context) {
    throw new Error(
      "useTemperatureUnit must be used within TemperatureUnitProvider",
    );
  }

  return context;
}
