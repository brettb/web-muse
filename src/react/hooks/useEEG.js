import { startRecording, stopRecording } from "../../lib/eeg";
import { useEEG as EEGContext } from "../context/EEGContext";
/**
 * A function to manage EEG functionality for the application.
 *
 * @return {object} An object containing methods and data related to EEG functionality.
 */
export function useEEG() {
  const { isConnected, isMockData, connectMockData } = EEGContext();

  /**
   * Mock function to start recording.
   */
  const mockStartRecording = () => {
    console.log("Mock recording started");
  };

  /**
   * Mock function to stop recording.
   *
   * @return {any} The classification data based on a random state.
   */
  const mockStopRecording = () => {
    console.log("Mock recording stopped");
    const state = Math.random() < 0.5 ? "action_state" : "resting_state";
    return mockClassificationData[state];
  };

  return {
    connectMockData,
    isConnected,
    startRecording: isMockData ? mockStartRecording : startRecording,
    stopRecording: isMockData ? mockStopRecording : stopRecording,
    isMockData,
    mockCalibrationData,
    mockClassificationData,
  };
}
