export type SalinityUnit = "ppt" | "sg" | "psu";

export const salinityUnitLabels: Record<SalinityUnit, string> = {
  ppt: "Salinity (ppt)",
  sg: "Specific Gravity (SG)",
  psu: "Practical Salinity Units (PSU)",
};

const WATER_DENSITY_COEFFICIENTS = [
  999.842594, 0.06793952, -0.00909529, 0.0001001685, -0.000001120083,
  0.000000006536332,
];

function freshwaterDensity(temperatureCelsius: number) {
  return WATER_DENSITY_COEFFICIENTS.reduce(
    (density, coefficient, index) =>
      density + coefficient * temperatureCelsius ** index,
    0,
  );
}

function seawaterDensity(salinityPpt: number, temperatureCelsius = 25) {
  const temperature = temperatureCelsius;
  const salinity = salinityPpt;
  const waterDensity = freshwaterDensity(temperature);
  const salinityCoefficient =
    0.824493 -
    0.0040899 * temperature +
    0.000076438 * temperature ** 2 -
    0.00000082467 * temperature ** 3 +
    0.0000000053875 * temperature ** 4;
  const salinityPowerCoefficient =
    -0.00572466 + 0.00010227 * temperature - 0.0000016546 * temperature ** 2;

  return (
    waterDensity +
    salinityCoefficient * salinity +
    salinityPowerCoefficient * salinity ** 1.5 +
    0.00048314 * salinity ** 2
  );
}

export function salinityToSpecificGravity(salinityPpt: number) {
  return seawaterDensity(salinityPpt) / freshwaterDensity(25);
}

export function formatSalinityValue(salinityPpt: number, unit: SalinityUnit) {
  if (unit === "sg") {
    return salinityToSpecificGravity(salinityPpt).toFixed(4);
  }

  return salinityPpt.toFixed(1);
}
