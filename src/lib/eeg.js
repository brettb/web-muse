// src/services/eeg.js

const SAMPLE_RATE = 256; // Assuming 256Hz sample rate
const WINDOW_SIZE = 3 * SAMPLE_RATE; // 3 seconds of data
const CHANNELS = 4;

let recordingBuffer = [];
let isRecording = false;
let recordingStartTime = null;

// Sanitize and interpolate data
function sanitizeAndInterpolate(data) {
  const validData = data.filter(
    (val) => val !== null && !isNaN(val) && typeof val === "number"
  );
  if (validData.length === 0) return new Array(data.length).fill(0);

  let lastValidValue = validData[0];
  return data.map((val) => {
    if (val !== null && !isNaN(val) && typeof val === "number") {
      lastValidValue = val;
      return val;
    }
    return lastValidValue;
  });
}

// Calculate power spectrum using periodogram method
function calculatePowerSpectrum(data) {
  const n = data.length;
  const spectrum = new Array(n / 2).fill(0);

  for (let k = 0; k < n / 2; k++) {
    let real = 0;
    let imag = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * t * k) / n;
      real += data[t] * Math.cos(angle);
      imag -= data[t] * Math.sin(angle);
    }
    spectrum[k] = (real * real + imag * imag) / n;
  }

  return spectrum;
}

// Define frequency bands
const bands = {
  delta: [0.5, 4],
  theta: [4, 8],
  alpha: [8, 13],
  beta: [13, 30],
  gamma: [30, 100],
};

// Calculate power by band
function powerByBand(powerSpectrumData) {
  const result = {};
  const freqResolution = SAMPLE_RATE / WINDOW_SIZE;

  for (const [band, [low, high]] of Object.entries(bands)) {
    const lowIndex = Math.max(1, Math.floor(low / freqResolution));
    const highIndex = Math.min(
      powerSpectrumData.length - 1,
      Math.ceil(high / freqResolution)
    );
    result[band] = powerSpectrumData
      .slice(lowIndex, highIndex)
      .reduce((a, b) => a + b, 0);
  }

  return result;
}

/**
 * Sets up a pipeline to continuously fetch EEG data from a Muse device and update the raw EEG data state.
 *
 * @param {Object} muse - The Muse device object.
 * @param {Function} setRawEEG - A function to set the raw EEG data state.
 * @return {Function} A function to stop the pipeline by clearing the interval subscription.
 */
export const setupPipeline = (muse, setRawEEG) => {
  const subscription = setInterval(() => {
    const eegData = muse.eeg.slice(0, CHANNELS).map((buffer) => buffer.read());
    setRawEEG(eegData);

    if (isRecording) {
      recordingBuffer.push(eegData);
    }
  }, 1000 / SAMPLE_RATE);

  return () => clearInterval(subscription);
};

/**
 * Initiates the recording process by clearing the recording buffer, setting the recording flag to true, and capturing the start time.
 *
 * @return {void} No return value
 */
export const startRecording = () => {
  console.log("Starting recording");
  recordingBuffer = [];
  isRecording = true;
  recordingStartTime = Date.now();
};

/**
 * Stops the recording process, calculates the recording duration, checks if enough data is recorded,
 * and processes the recorded data.
 *
 * @return {object | null} The processed recorded data or null if conditions are not met.
 */
export const stopRecording = () => {
  isRecording = false;

  const recordingDuration = (Date.now() - recordingStartTime) / 1000; // duration in seconds
  if (
    recordingBuffer.length < WINDOW_SIZE &&
    recordingBuffer.length > WINDOW_SIZE / 2
  ) {
    recordingBuffer = recordingBuffer.concat(
      Array(WINDOW_SIZE - recordingBuffer.length).fill(
        recordingBuffer[recordingBuffer.length - 1]
      )
    );
  }
  if (recordingDuration < 3 || recordingBuffer.length < WINDOW_SIZE) {
    console.log(
      "Not enough data recorded. Please record for at least 3 seconds."
    );
    // console.log("Recorded data:", recordingBuffer);
    return null;
  }

  return processRecordedData(recordingBuffer);
};

/**
 * Processes the recorded data buffer to extract sanitized data, power spectra, power by band, and alpha band power.
 *
 * @param {Array<Array<number>>} dataBuffer - The recorded data buffer containing EEG data samples.
 * @return {object | null} An object containing sanitized data, power spectra, power by band, and alpha band power, or null if an error occurs during processing.
 */
const processRecordedData = (dataBuffer) => {
  if (dataBuffer.length < WINDOW_SIZE) {
    console.log(
      "Not enough data to process. Needed: " +
        WINDOW_SIZE +
        ", Got: " +
        dataBuffer.length
    );
    return null;
  }

  // Use the last WINDOW_SIZE samples
  const windowData = dataBuffer.slice(-WINDOW_SIZE);

  try {
    // Transpose the data to group by channel
    const channelData = Array(CHANNELS)
      .fill()
      .map(() => []);
    windowData.forEach((sample) => {
      sample.forEach((value, channelIndex) => {
        channelData[channelIndex].push(value);
      });
    });

    // Sanitize and interpolate data for each channel
    const sanitizedData = channelData.map(sanitizeAndInterpolate);

    // Compute power spectra for each channel
    const spectraData = sanitizedData.map(calculatePowerSpectrum);

    // Compute power by band for each channel
    const powerData = spectraData.map(powerByBand);

    // Extract alpha band power for each channel
    const alphaData = powerData.map((pd) => pd.alpha);

    return {
      rawEEG: sanitizedData.map((channel) => channel[channel.length - 1]), // Latest sample
      spectraData,
      powerData,
      alphaData,
    };
  } catch (error) {
    console.error("Error processing EEG data:", error);
    console.error("Problematic data:", dataBuffer);
    return null;
  }
};
