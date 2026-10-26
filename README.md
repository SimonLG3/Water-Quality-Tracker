# Water Quality Tracker

This mobile app was built with React Native, Expo and with the TypeScript language. Its aim is to help aquariums and fish keepers record important information about their water and review historical readings.

## Features

- **Water chemistry:** Record pH, carbonate hardness (KH), and general hardness (GH).
- **Nitrogen cycle:** Track ammonia, nitrite, and nitrate levels.
- **Salinity:** Record salinity readings and choose your preferred display unit.
- **Temperature:** Track water temperature in Celsius or Fahrenheit.
- **Dissolved oxygen:** Record dissolved oxygen measurements.
- **Reading history:** Save readings locally and view historical statistics and trends.
- **Settings:** Configure supported measurement preferences.

## Technology Stack

- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage

## Screenshots

Screenshots of the app will be added here.

<!-- Add screenshots here, for example:
![Water Chemistry screen](screenshots/water-chemistry.png)
![Nitrogen Cycle screen](screenshots/nitrogen-cycle.png)
-->

## Getting Started

### Prerequisites

- Node.js and npm
- A compatible development environment
- Expo Go or an appropriate emulator, depending on the features you use

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/SimonLG3/Water-Quality-Tracker.git
   ```

2. Enter the project directory:

   ```bash
   cd Water-Quality-Tracker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npx expo start
   ```

Follow the Expo CLI instructions to open the app on a supported device or emulator.

## Data Storage

This app uses local storage through AsyncStorage in order to save readings on the device. As this project is intended as a water quality tracking tool, recorded values should be interpreted alongside appropriate aquarium care guidance and testing procedures.

## Licence

This project is licensed under the MIT License. See the `LICENSE` file for details.
