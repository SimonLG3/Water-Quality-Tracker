
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AquariumReading = {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  recordedAt: string;
};

const STORAGE_KEY = "water-quality-readings-v1";

export async function getReadings(): Promise<AquariumReading[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as AquariumReading[];
  } catch (error) {
    console.error("Could not load aquarium readings:", error);
    throw error;
  }
}

export async function saveReading(
  reading: Omit<AquariumReading, "id" | "recordedAt">,
): Promise<AquariumReading> {
  const currentReadings = await getReadings();

  const newReading: AquariumReading = {
    ...reading,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    recordedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newReading, ...currentReadings]),
  );

  return newReading;
}

export async function deleteReading(id: string): Promise<void> {
  const currentReadings = await getReadings();

  const updatedReadings = currentReadings.filter(
    (reading) => reading.id !== id,
  );

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReadings),
  );
}