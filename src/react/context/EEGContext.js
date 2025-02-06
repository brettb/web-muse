import React, { createContext, useContext, useState, useEffect } from "react";
import { connectMuse, setupPipeline } from "../services/eeg";

const EEGContext = createContext();

export const useEEG = () => useContext(EEGContext);

export const EEGProvider = ({ children }) => {
  const [muse, setMuse] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [rawEEG, setRawEEG] = useState([]);

  const connectMuseDevice = async () => {
    try {
      const museDevice = await connectMuse();
      setMuse(museDevice);
      setIsConnected(true);
      setIsMockData(false);
    } catch (error) {
      console.error("Error connecting to Muse:", error);
    }
  };

  useEffect(() => {
    if (muse && !isMockData) {
      const cleanup = setupPipeline(muse, setRawEEG);
      return cleanup;
    }
  }, [muse, isMockData]);

  const connectMockData = () => {
    setIsConnected(true);
    setIsMockData(true);
  };

  const disconnectEEG = () => {
    if (muse) {
      muse.disconnect();
    }
    setMuse(null);
    setIsConnected(false);
    setIsMockData(false);
  };

  const value = {
    muse,
    isConnected,
    isMockData,
    rawEEG,
    connectMuse: connectMuseDevice,
    connectMockData,
    disconnectEEG,
  };

  return <EEGContext.Provider value={value}>{children}</EEGContext.Provider>;
};
