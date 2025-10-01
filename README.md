After attempting to install this project from the parent repo, I discovered that the project wasn't complete and the instructions did not function. I've updated the project to make it installable and runnable.

Here's a list of changes from the previous version:

- Add comprehensive build system with Rollup
- Generate ESM and CommonJS builds with source maps
- Add production-ready minified versions
- Create interactive demo page with real-time EEG visualization
- Update package.json with proper exports and build scripts
- Add comprehensive .gitignore for clean version control
- Enhance README with setup instructions and troubleshooting
- Add Muse S pairing guide and multi-point Bluetooth notes
- Include React component entry point

I'm not sure of the direction the auther would like to take the project so didn't make these changes as a pull requiest, I'm happy to make one if the author desires.

# web-muse

A modern JavaScript library for connecting to Muse EEG devices using Web Bluetooth API. This project aims to provide a maintained alternative to [muse-js](https://github.com/urish/muse-js) which is no longer actively maintained.

## Why web-muse?

- 🔄 **Active Development**: Unlike muse-js, web-muse is actively maintained and works with current Muse firmware
- 🌐 **Web Bluetooth**: Direct browser connection without additional software
- ⚛️ **React Integration**: Built-in React hooks and context for easy integration
- 🧪 **Mock Data**: Development support with mock data capabilities
- 📊 **Signal Processing**: Built-in EEG processing utilities

## Features

- Direct connection to Muse EEG devices via Web Bluetooth
- Real-time EEG data streaming at 256Hz
- Built-in signal processing utilities
- React hooks and context for easy integration
- Mock data support for development
- Support for:
  - EEG data (4 channels)
  - PPG data (3 channels)
  - Accelerometer data
  - Gyroscope data
  - Battery level monitoring

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/itayinbarr/web-muse.git
cd web-muse
```

2. Install dependencies:

```bash
npm install
```

3. Build the library:

```bash
npm run build
```

### Using in Your Project

You can install web-muse using one of these methods:

#### Method 1: Using `npm link` (for development)

```bash
# In web-muse directory
npm link

# In your project directory
npm link web-muse
```

#### Method 2: Direct local path in package.json

Add this to your project's package.json:

```json
{
  "dependencies": {
    "web-muse": "file:../path/to/web-muse"
  }
}
```

Then run `npm install`

#### Method 3: Using GitHub URL

Add this to your project's package.json:

```json
{
  "dependencies": {
    "web-muse": "github:itayinbarr/web-muse"
  }
}
```

Then run `npm install`

## Distribution Formats

The library is built into multiple formats for maximum compatibility:

- **ES Module** (`dist/web-muse.esm.js`) - For modern browsers and bundlers with tree-shaking support
- **CommonJS** (`dist/web-muse.cjs.js`) - For Node.js and older bundlers
- **Minified versions** of both formats for production use

## Quick Start

### Basic Usage (Vanilla JavaScript)

```javascript
// For modern bundlers (recommended)
import { connectMuse } from "web-muse";

// For Node.js or older bundlers
const { connectMuse } = require("web-muse");

async function connectToMuse() {
  const muse = await connectMuse();
  console.log("Connected to Muse device:", muse);

  // Start receiving EEG data
  setInterval(() => {
    const eegData = muse.eeg.map((buffer) => buffer.read());
    console.log("EEG Data:", eegData);
  }, 1000 / 256); // 256Hz sampling rate
}
```

### React Usage

```jsx
// Import React components (when available)
import { useEEG, EEGProvider } from "web-muse/react";

// Wrap your app with the provider
function App() {
  return (
    <EEGProvider>
      <YourComponent />
    </EEGProvider>
  );
}

// Use the hook in your components
function YourComponent() {
  const { isConnected, connectMuse, rawEEG } = useEEG();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectMuse}>Connect to Muse</button>
      ) : (
        <div>EEG Data: {JSON.stringify(rawEEG)}</div>
      )}
    </div>
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Build library (creates dist files)
npm run build

# Run tests (when available)
npm test
```

## Requirements

- A Muse headband (tested with Muse 2 and Muse S)
- A Web Bluetooth-compatible browser:
  - Chrome (desktop & android)
  - Edge (desktop)
  - Opera (desktop & android)
  - Samsung Internet (android)

Note: Safari and iOS devices do not currently support Web Bluetooth.

## Hardware Setup

### Pairing Your Muse S Headband

Before using web-muse with your Muse S headband, you need to pair it with the official Muse mobile app first:

#### Step-by-Step Pairing Instructions

1. **Prepare your Muse S**: Press and hold the power button on your Muse S headband for six seconds until all the indicator lights are blinking.

2. **Enable Bluetooth & Location Services**: On your smartphone or tablet, go to your device's main settings and make sure Bluetooth and location services are turned on.

3. **Open the Muse App**: Open the Muse app on your mobile device.

4. **Start the Pairing Process**: Tap the Bluetooth icon in the top-left corner of the app's screen.

5. **Connect to Your Muse S**: Your Muse ID should appear in a list of available devices; tap on it to complete the pairing process.

**Note**: Once paired with the mobile app, your Muse S should be discoverable by web browsers that support Web Bluetooth. You typically only need to do this initial pairing once.

**⚠️ Important**: Muse headbands do not support multi-point Bluetooth connectivity at this time. Muse can only connect to one device at a time. If you're having connection issues, make sure your Muse is not connected to any other devices (including the Muse mobile app) before attempting to connect via web-muse.

### Browser Compatibility

Web Bluetooth API is required. Check [browser compatibility](https://caniuse.com/web-bluetooth) for the latest support status.

## Documentation

- [API Documentation](./docs/API.md)
- [Examples](./examples/)


## License

MIT

## Acknowledgments

- Thanks to [muse-js](https://github.com/urish/muse-js) for pioneering Web Bluetooth support for Muse devices
- Thanks to Interaxon for creating the Muse headband
