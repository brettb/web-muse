import { MuseCircularBuffer } from "./CircularBuffer";

/**
 * An abstract base class for interfaces that connect to a Muse headband.
 * Subclasses can implement any of the following abstract methods:
 * - batteryData       - called when an event with battery data is received (use eventBatteryData to get it)
 * - accelerometerData - called when an event with accelerometer data is received (use eventAccelerometerData to get it)
 * - gyroscopeData     - called when an event with gyroscope data is received (use eventGyroscopeData to get it)
 * - controlData       - called when an event with control data is received (use eventControlData to get it)
 * - eegData           - called when an event with EEG data is received (use eventEegData to get it)
 * - ppgData           - called when an event with PPG data is received (use eventPpgData to get it)
 * - disconnected      - called when the Muse headband is disconnected
 */
export class MuseBase {
  #SERVICE = 0xfe8d;
  #CONTROL_CHARACTERISTIC = "273e0001-4c4d-454d-96be-f03bac821358";
  #BATTERY_CHARACTERISTIC = "273e000b-4c4d-454d-96be-f03bac821358";
  #GYROSCOPE_CHARACTERISTIC = "273e0009-4c4d-454d-96be-f03bac821358";
  #ACCELEROMETER_CHARACTERISTIC = "273e000a-4c4d-454d-96be-f03bac821358";
  #PPG1_CHARACTERISTIC = "273e000f-4c4d-454d-96be-f03bac821358";
  #PPG2_CHARACTERISTIC = "273e0010-4c4d-454d-96be-f03bac821358";
  #PPG3_CHARACTERISTIC = "273e0011-4c4d-454d-96be-f03bac821358";
  #EEG1_CHARACTERISTIC = "273e0003-4c4d-454d-96be-f03bac821358";
  #EEG2_CHARACTERISTIC = "273e0004-4c4d-454d-96be-f03bac821358";
  #EEG3_CHARACTERISTIC = "273e0005-4c4d-454d-96be-f03bac821358";
  #EEG4_CHARACTERISTIC = "273e0006-4c4d-454d-96be-f03bac821358";
  #EEG5_CHARACTERISTIC = "273e0007-4c4d-454d-96be-f03bac821358";
  #state = 0;
  #dev = null;
  #controlChar = null;
  #infoFragment = "";

  /**
   * Constructs a new interface for connecting to a Muse headband.
   *
   * @abstract
   * @constructor
   */
  constructor() {
    if (new.target === MuseBase) {
      throw new TypeError("Cannot construct MuseBase instances directly");
    }
  }

  /**
   * The current state of the headband.
   *
   * @type {number} 0 if disconnected, 1 if in the process of connecting, or 2 if connected.
   */
  get state() {
    return this.#state;
  }

  /**
   * Processes the battery level data from the given event.
   *
   * @abstract
   * @param {Event} event - The event containing the battery data.
   * @return {void} This function does not return a value.
   */
  batteryData(event) {}
  /**
   * Processes the accelerometer data from the given event.
   *
   * @abstract
   * @param {Event} event - The event containing the accelerometer data.
   * @return {void} This function does not return a value.
   */
  accelerometerData(event) {}
  /**
   * Processes the gyroscope data from the given event.
   *
   * @abstract
   * @param {Event} event - The event containing the gyroscope data.
   * @return {void} This function does not return a value.
   */
  gyroscopeData(event) {}
  /**
   * A function that processes control data from the given event.
   *
   * @abstract
   * @param {Event} event - The event containing the control data.
   * @return {void} This function does not return a value.
   */
  controlData(event) {}
  /**
   * Processes EEG data from the given event.
   *
   * @abstract
   * @param {number} n - The index of the EEG channel.
   * @param {Event} event - The event containing the EEG data.
   * @return {void} This function does not return a value.
   */
  eegData(n, event) {}
  /**
   * Processes PPG data from the given event.
   *
   * @abstract
   * @param {number} n - The index of the PPG circular buffer to write to.
   * @param {Event} event - The event containing the PPG data.
   * @return {void} This function does not return a value.
   */
  ppgData(n, event) {}
  /**
   * A method that handles the disconnection event.
   *
   * @abstract
   * @param {void} This function does not take any parameters.
   * @return {void} This function does not return a value.
   */
  disconnected() {}

  /**
   * Decodes information from the given bytes array.
   *
   * @param {Uint8Array} bytes - The array of bytes containing information to decode.
   * @return {string} The decoded information as a string.
   */
  #decodeInfo(bytes) {
    return new TextDecoder().decode(bytes.subarray(1, 1 + bytes[0]));
  }

  /**
   * Decodes unsigned 24-bit data from the given samples array.
   *
   * @param {Array} samples - The array of samples to decode.
   * @return {Array} The decoded 24-bit data array.
   */
  #decodeUnsigned24BitData(samples) {
    const samples24Bit = [];
    for (let i = 0; i < samples.length; i += 3) {
      samples24Bit.push(
        (samples[i] << 16) | (samples[i + 1] << 8) | samples[i + 2]
      );
    }
    return samples24Bit;
  }

  /**
   * Decodes unsigned 12-bit data from the given samples array.
   *
   * @param {Array} samples - The array of samples to decode.
   * @return {Array} The decoded 12-bit data array.
   */
  #decodeUnsigned12BitData(samples) {
    const samples12Bit = [];
    for (let i = 0; i < samples.length; i++) {
      if (i % 3 === 0) {
        samples12Bit.push((samples[i] << 4) | (samples[i + 1] >> 4));
      } else {
        samples12Bit.push(((samples[i] & 0xf) << 8) | samples[i + 1]);
        i++;
      }
    }
    return samples12Bit;
  }

  /**
   * Encodes a command by converting it to bytes and adding a length prefix.
   *
   * @param {string} cmd - The command to encode.
   * @return {Uint8Array} The encoded command as bytes.
   */
  #encodeCommand(cmd) {
    const encoded = new TextEncoder().encode(`X${cmd}\n`);
    encoded[0] = encoded.length - 1;
    return encoded;
  }

  /**
   * Returns the battery level from a given event.
   *
   * @param {object} event - The event containing the battery data.
   * @return {number} A number between 0 and 100.
   */
  eventBatteryData(event) {
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    return data.getUint16(2) / 512;
  }

  /**
   * Returns an array of motion data based on the DataView, scale, and offset provided.
   *
   * @param {DataView} dv - The DataView containing the motion data.
   * @param {number} scale - The scale factor to apply to the motion data.
   * @param {number} ofs - The offset for accessing motion data within the DataView.
   * @return {[number, number, number]} An triple of scaled motion data values.
   */
  motionData(dv, scale, ofs) {
    return [
      scale * dv.getInt16(ofs),
      scale * dv.getInt16(ofs + 2),
      scale * dv.getInt16(ofs + 4),
    ];
  }

  /**
   * Returns the accelerometer data from a given event.
   *
   * @param {object} event - The event containing the accelerometer data.
   * @return {[number[], number[], number[]]} An triple of accelerometer sample arrays,
   *                                          each sample a number between 0 and 1.
   */
  eventAccelerometerData(event) {
    const scale = 0.0000610352; // 1 / 2^14
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    let accelerometer = [[], [], []];
    for (let ofs = 2; ofs <= 14; ofs += 6) {
      const vals = this.motionData(data, scale, ofs);
      accelerometer[0].push(vals[0]);
      accelerometer[1].push(vals[1]);
      accelerometer[2].push(vals[2]);
    }
    return accelerometer;
  }

  /**
   * Returns the gyroscope data from a given event.
   *
   * @param {object} event - The event containing the gyroscope data.
   * @return {[number[], number[], number[]]} An triple of gyroscope sample arrays,
   *                                          each sample a number between 0 and 1.
   */
  eventGyroscopeData(event) {
    const scale = 0.0074768; // 1 / 2^7
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    let gyroscope = [[], [], []];
    for (let ofs = 2; ofs <= 14; ofs += 6) {
      const vals = this.motionData(data, scale, ofs);
      gyroscope[0].push(vals[0]);
      gyroscope[1].push(vals[1]);
      gyroscope[2].push(vals[2]);
    }
    return gyroscope;
  }

  /**
   * Returns the control data from a given event.
   *
   * @param {object} event - The event containing the control data.
   * @return {object} A dictionary of control data values.
   */
  eventControlData(event) {
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    const buf = new Uint8Array(data.buffer);
    const str = this.#decodeInfo(buf);
    let info = {};
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      this.#infoFragment = this.#infoFragment + c;
      if (c === "}") {
        const tmp = JSON.parse(this.#infoFragment);
        this.#infoFragment = "";
        for (const key in tmp) {
          info[key] = tmp[key];
        }
      }
    }
    return info;
  }

  /**
   * Returns the EEG data from a given event.
   *
   * @param {object} event - The event containing the EEG data.
   * @return {number[]} An array of samples, each a number between 0 and 2^12.
   */
  eventEEGData(event) {
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    return this.#decodeUnsigned12BitData(
      new Uint8Array(data.buffer).subarray(2)
    );
  }

  /**
   * Returns the PPG data from a given event.
   *
   * @param {object} event - The event containing the PPG data.
   * @return {number[]} An array of samples, each a number between 0 and 2^24.
   */
  eventPPGData(event) {
    let data = event.target.value;
    data = data.buffer ? data : new DataView(data);
    return this.#decodeUnsigned24BitData(
      new Uint8Array(data.buffer).subarray(2)
    );
  }

  /**
   * Asynchronously sends a command to the control character.
   *
   * @param {string} cmd - The command to send.
   * @return {Promise<void>} A promise that resolves when the command has been sent.
   */
  async #sendCommand(cmd) {
    await this.#controlChar["writeValue"](this.#encodeCommand(cmd));
  }
  /**
   * Pauses the operation by sending a command.
   *
   * @return {Promise<void>} A promise that resolves when the pause command is sent.
   */
  async #pause() {
    await this.#sendCommand("h");
  }
  /**
   * Resumes the operation by sending a command to the control character.
   *
   * @return {Promise<void>} A promise that resolves when the command to resume has been sent.
   */
  async #resume() {
    await this.#sendCommand("d");
  }
  /**
   * Starts the process by pausing, sending a command to set the priority to 50,
   * sending a command to start, and resuming.
   *
   * @return {Promise<void>} A promise that resolves when the process is started.
   */
  async #start() {
    await this.#pause();
    await this.#sendCommand("p50");
    await this.#sendCommand("s");
    await this.#resume();
  }
  /**
   * Disconnects from the device by calling the `disconnect` method on the `gatt` object of the `dev` property.
   * Sets the `dev` property to `null` and the `state` property to `0`.
   *
   * @return {void} This function does not return a value.
   */
  disconnect() {
    if (this.#dev) this.#dev["gatt"]["disconnect"]();
    this.#dev = null;
    this.#state = 0;
    this.disconnected();
  }
  /**
   * Asynchronously connects to a characteristic in a BLE service and sets up a hook for characteristic value changes.
   *
   * @param {Object} service - The BLE service to connect to.
   * @param {string} cid - The UUID of the characteristic to connect to.
   * @param {Function} hook - The function to call when the characteristic value changes.
   * @return {Promise<Object>} A promise that resolves to the connected characteristic.
   */
  async #connectChar(service, cid, hook) {
    const c = await service["getCharacteristic"](cid);
    c["oncharacteristicvaluechanged"] = hook;
    c["startNotifications"]();
    return c;
  }
  /**
   * Asynchronously connects to a BLE device and sets up characteristic value change hooks.
   *
   * @return {Promise<void>} A promise that resolves when the connection is established.
   * @throws {Error} If the connection fails at any step.
   */
  async connect() {
    if (this.#dev || this.#state !== 0) {
      return;
    }
    this.#state = 1;
    try {
      this.#dev = await navigator["bluetooth"]["requestDevice"]({
        filters: [{ services: [this.#SERVICE] }],
      });
    } catch (error) {
      this.#dev = null;
      this.#state = 0;
      return;
    }
    let gatt = undefined;
    try {
      gatt = await this.#dev["gatt"]["connect"]();
    } catch (error) {
      this.#dev = null;
      this.#state = 0;
      return;
    }
    const service = await gatt["getPrimaryService"](this.#SERVICE);
    const that = this;
    this.#dev.addEventListener("gattserverdisconnected", function () {
      this.#dev = null;
      this.#state = 0;
      that.disconnected();
    });
    this.#controlChar = await this.#connectChar(
      service,
      this.#CONTROL_CHARACTERISTIC,
      function (event) {
        that.controlData(event);
      }
    );
    await this.#connectChar(
      service,
      this.#BATTERY_CHARACTERISTIC,
      function (event) {
        that.batteryData(event);
      }
    );
    await this.#connectChar(
      service,
      this.#GYROSCOPE_CHARACTERISTIC,
      function (event) {
        that.gyroscopeData(event);
      }
    );
    await this.#connectChar(
      service,
      this.#ACCELEROMETER_CHARACTERISTIC,
      function (event) {
        that.accelerometerData(event);
      }
    );
    await this.#connectChar(service, this.#PPG1_CHARACTERISTIC, function (event) {
      that.ppgData(0, event);
    });
    await this.#connectChar(service, this.#PPG2_CHARACTERISTIC, function (event) {
      that.ppgData(1, event);
    });
    await this.#connectChar(service, this.#PPG3_CHARACTERISTIC, function (event) {
      that.ppgData(2, event);
    });
    await this.#connectChar(service, this.#EEG1_CHARACTERISTIC, function (event) {
      that.eegData(0, event);
    });
    await this.#connectChar(service, this.#EEG2_CHARACTERISTIC, function (event) {
      that.eegData(1, event);
    });
    await this.#connectChar(service, this.#EEG3_CHARACTERISTIC, function (event) {
      that.eegData(2, event);
    });
    await this.#connectChar(service, this.#EEG4_CHARACTERISTIC, function (event) {
      that.eegData(3, event);
    });
    await this.#connectChar(service, this.#EEG5_CHARACTERISTIC, function (event) {
      that.eegData(4, event);
    });
    await this.#start();
    await this.#sendCommand("v1");
    this.#state = 2;
  }
}

/**
 * An interface for connecting with a Muse headband based on circular buffers of size 256.
 * Note: EEG data is mapped into the range [-1000, 1000).
 *
 * @extends MuseBase
 */
export class Muse extends MuseBase {
  /**
   * Constructs a new instance of the Muse class.
   *
   * @constructor
   */
  constructor() {
    super();
    const BUFFER_SIZE = 256;
    this.batteryLevel = null;
    this.info = {};
    this.eeg = [
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
    ];
    this.ppg = [
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
    ];
    this.accelerometer = [
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
    ];
    this.gyroscope = [
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
      new MuseCircularBuffer(BUFFER_SIZE),
    ];
  }
  /**
   * Updates the battery level based on the received event.
   *
   * @param {Event} event - The event containing the battery data.
   * @return {void} This function does not return a value.
   */
  batteryData(event) {
    this.batteryLevel = this.eventBatteryData(event);
  }
  /**
   * Processes the accelerometer data from the given event.
   *
   * @param {Event} event - The event containing the accelerometer data.
   * @return {void} This function does not return a value.
   */
  accelerometerData(event) {
    const vals = this.eventAccelerometerData(event);
    for (let i = 0; i < 3; i++) {
      this.accelerometer[0].write(vals[0][i]);
      this.accelerometer[1].write(vals[1][i]);
      this.accelerometer[2].write(vals[2][i]);
    }
  }
  /**
   * Processes the gyroscope data from the given event.
   *
   * @param {Event} event - The event containing the gyroscope data.
   * @return {void} This function does not return a value.
   */
  gyroscopeData(event) {
    const vals = this.eventAccelerometerData(event);
    for (let i = 0; i < 3; i++) {
      this.gyroscope[0].write(vals[0][i]);
      this.gyroscope[1].write(vals[1][i]);
      this.gyroscope[2].write(vals[2][i]);
    }
  }
  /**
   * A function that processes control data from the given event.
   *
   * @param {Event} event - The event containing the control data.
   * @return {void} This function does not return a value.
   */
  controlData(event) {
    const tmp = this.eventControlData(event);
    for (const key in tmp) {
      this.info[key] = tmp[key];
    }
  }
  /**
   * Processes EEG data from the given event, scales it to the range [-1000, 1000),
   * and writes it to the corresponding PPG circular buffer.
   *
   * @param {number} n - The index of the EEG channel.
   * @param {Event} event - The event containing the EEG data.
   * @return {void} This function does not return a value.
   */
  eegData(n, event) {
    let samples = this.eventEEGData(event);
    samples = samples.map(function (x) {
      return 0.48828125 * (x - 0x800);
    });
    for (let i = 0; i < samples.length; i++) {
      this.eeg[n].write(samples[i]);
    }
  }
  /**
   * Processes PPG data received from the event and writes it to the corresponding PPG circular buffer.
   *
   * @param {number} n - The index of the PPG circular buffer to write to.
   * @param {Event} event - The event containing the PPG data.
   * @return {void} This function does not return a value.
   */
  ppgData(n, event) {
    const samples = this.eventPPGData(event);
    for (let i = 0; i < samples.length; i++) {
      this.ppg[n].write(samples[i]);
    }
  }
}

/**
 * Connects to a Muse device and returns the connected Muse object.
 *
 * @return {Muse} The connected Muse object.
 */
export const connectMuse = async () => {
  const muse = new Muse();
  console.log("Attempting to connect to Muse...");
  await muse.connect();
  console.log("Muse connected:", muse);
  return muse;
};
