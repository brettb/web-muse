import React, { useState, useEffect } from "react";
import { useEEG, EEGProvider } from "muse-web-bluetooth/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// EEG Visualization Component
const EEGVisualizer = () => {
  const { rawEEG, isConnected, connectMuse, startRecording, stopRecording } =
    useEEG();
  const [recordingState, setRecordingState] = useState("idle");
  const [eegHistory, setEegHistory] = useState([]);

  // Update EEG history with new data
  useEffect(() => {
    if (rawEEG && rawEEG.length > 0) {
      setEegHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            time: Date.now(),
            ch1: rawEEG[0],
            ch2: rawEEG[1],
            ch3: rawEEG[2],
            ch4: rawEEG[3],
          },
        ];
        // Keep last 100 samples
        return newHistory.slice(-100);
      });
    }
  }, [rawEEG]);

  const handleStartRecording = () => {
    startRecording();
    setRecordingState("recording");
  };

  const handleStopRecording = async () => {
    const data = await stopRecording();
    setRecordingState("idle");
    console.log("Recording data:", data);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Muse EEG Demo</h1>
        <button
          onClick={connectMuse}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect to Muse
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Muse EEG Data</h1>

      <div className="mb-4">
        <button
          onClick={
            recordingState === "idle"
              ? handleStartRecording
              : handleStopRecording
          }
          className={`px-4 py-2 rounded ${
            recordingState === "idle"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          } text-white`}
        >
          {recordingState === "idle" ? "Start Recording" : "Stop Recording"}
        </button>
      </div>

      <div className="w-full h-96">
        <LineChart width={800} height={400} data={eegHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="ch1" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="ch2" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="ch3" stroke="#ffc658" dot={false} />
          <Line type="monotone" dataKey="ch4" stroke="#ff7300" dot={false} />
        </LineChart>
      </div>

      <div className="mt-4">
        <h2 className="text-xl mb-2">Raw Values:</h2>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(rawEEG, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// App wrapper with provider
const App = () => {
  return (
    <EEGProvider>
      <EEGVisualizer />
    </EEGProvider>
  );
};

export default App;
