import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

import { type SalinityUnit } from "@/constants/salinity";

type SalinityUnitContextValue = {
  unit: SalinityUnit;
  setUnit: (unit: SalinityUnit) => void;
};

const SalinityUnitContext = createContext<SalinityUnitContextValue | null>(
  null,
);

export function SalinityUnitProvider({ children }: PropsWithChildren) {
  const [unit, setUnit] = useState<SalinityUnit>("ppt");

  return (
    <SalinityUnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </SalinityUnitContext.Provider>
  );
}

export function useSalinityUnit() {
  const context = useContext(SalinityUnitContext);

  if (!context) {
    throw new Error("useSalinityUnit must be used within SalinityUnitProvider");
  }

  return context;
}
