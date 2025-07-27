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

You can install web-muse directly from your local clone using one of these methods:

#### Method 1: Using `npm link`

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

## Quick Start

### Basic Usage (Vanilla JavaScript)

```javascript
import { connectMuse } from "web-muse";

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

# Run example
npm run dev

# Build library
npm run build

# Run tests
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

## Browser Support

Web Bluetooth API is required. Check [browser compatibility](https://caniuse.com/web-bluetooth).

## Documentation

- [API Documentation](./docs/API.md)
- [Examples](./examples/)


## License

MIT

## Acknowledgments

- Thanks to [muse-js](https://github.com/urish/muse-js) for pioneering Web Bluetooth support for Muse devices
- Thanks to Interaxon for creating the Muse headband
