# API Documentation

## Core API

### `connectMuse()`

Connects to a Muse device using Web Bluetooth API.

```javascript
const muse = await connectMuse();
```

Returns a `Muse` instance.

### Class: `Muse`

The main class for interacting with the Muse device.

#### Properties

- `eeg`: Array of `MuseCircularBuffer` instances for EEG channels
- `ppg`: Array of `MuseCircularBuffer` instances for PPG channels
- `accelerometer`: Array of `MuseCircularBuffer` instances for accelerometer data
- `gyroscope`: Array of `MuseCircularBuffer` instances for gyroscope data
- `batteryLevel`: Current battery level
- `state`: Connection state (0: disconnected, 1: connecting, 2: connected)

#### Methods

- `connect()`: Initiates connection to the device
- `disconnect()`: Disconnects from the device
- `start()`: Starts data streaming
- `pause()`: Pauses data streaming
- `resume()`: Resumes data streaming

### EEG Processing

#### `startRecording()`

Starts recording EEG data.

#### `stopRecording()`

Stops recording and returns processed data:

```javascript
const data = await stopRecording();
// Returns:
{
  rawEEG: number[][],       // Raw EEG data
  spectraData: number[][],  // Power spectra
  powerData: object[],      // Power by frequency band
  alphaData: number[]       // Alpha band power
}
```

## React Integration

### `EEGProvider`

React context provider for EEG functionality.

```jsx
<EEGProvider>
  <App />
</EEGProvider>
```

### `useEEG` Hook

React hook for accessing EEG functionality.

```javascript
const {
  muse, // Muse instance
  isConnected, // Connection status
  isMockData, // Whether using mock data
  rawEEG, // Latest EEG readings
  connectMuse, // Function to connect to Muse
  connectMockData, // Function to use mock data
  disconnectEEG, // Function to disconnect
  startRecording, // Start recording function
  stopRecording, // Stop recording function
} = useEEG();
```

## Signal Processing

### Frequency Bands

The library processes EEG data into the following frequency bands:

- Delta: 0.5-4 Hz
- Theta: 4-8 Hz
- Alpha: 8-13 Hz
- Beta: 13-30 Hz
- Gamma: 30-100 Hz

### Data Processing Pipeline

1. Raw data collection (256 Hz sampling rate)
2. Signal filtering and artifact removal
3. Power spectrum calculation using periodogram method
4. Frequency band power extraction
5. Real-time data streaming to application

## Error Handling

The library includes comprehensive error handling for:

- Bluetooth connection issues
- Data processing errors
- Device disconnection events

Errors can be caught using standard try-catch blocks:

```javascript
try {
  await connectMuse();
} catch (error) {
  console.error("Connection error:", error);
}
```
