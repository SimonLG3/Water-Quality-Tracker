export type TemperatureUnit = "celsius" | "fahrenheit";

export const temperatureUnitLabels: Record<TemperatureUnit, string> = {
  celsius: "°C Celsius",
  fahrenheit: "°F Fahrenheit",
};

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit,
): number {
  if (from === to) {
    return value;
  }

  return from === "celsius"
    ? celsiusToFahrenheit(value)
    : fahrenheitToCelsius(value);
}
