import React, { Component } from "react";
import "./App.css";
import { RtcClient, SignalingPromiseClient } from "@formant/realtime-sdk";

const formantApiUrl = "https://api-dev.formant.io";

// This app is meant to run as a custom web view in Formant
// with url e.g. http://localhost:3000/?auth={auth}&device={device_id}
class App extends Component {
  constructor() {
    super();
    this.deviceId = new URLSearchParams(window.location.search).get("device");
    this.dataChannel = undefined;
    this.canvas = undefined;
    this.state = {
      currentMessage: "",
      drawerWarning: "",
    };
    this.h264BytestreamCanvasDrawer =
      new window.Formant.H264BytestreamCanvasDrawer(
        this.setWebglYUVSupported,
        this.setWarningText,
        this.handleCanvasDrawerWarning,
        {
          Stream: "",
        }
      );
  }

  setWebglYUVSupported = (value) => {
    this.webglYUVSupported = value;
  };

  setWarningText = (warning) => {
    this.setState(() => ({ ...this.state, drawerWarning: warning }));
  };

  handleCanvasDrawerWarning = (warning) => {
    this.setState(() => ({ ...this.state, drawerWarning: warning }));
  };

  async onConnect() {
    this.h264BytestreamCanvasDrawer.start();
    this.setState(() => ({ ...this.state, currentMessage: "connecting" }));

    // Create an instance of the real-time communication client
    const rtcClient = new RtcClient({
      signalingClient: new SignalingPromiseClient(formantApiUrl, null, null),
      getToken: () => new URLSearchParams(window.location.search).get("auth"),
      receive: (_peerId, message) => {
        console.log("hey");
        this.h264BytestreamCanvasDrawer.receiveEncodedFrame(
          message.payload.h264VideoFrame
        );
      },
    });

    while (!rtcClient.isReady()) {
      this.setState(() => ({
        ...this.state,
        currentMessage: "Waiting for RTC client to initialize...",
      }));
      await delay(100);
    }

    // Each online device and user has a peer in the system
    const peers = await rtcClient.getPeers();

    this.setState(() => ({
      ...this.state,
      currentMessage: `Found ${peers.length} peers`,
    }));

    // Find the device peer corresponding to the device's ID
    const devicePeer = peers.find((_) => _.deviceId !== undefined);
    if (!devicePeer) {
      // If the device is offline, we won't be able to find its peer.
      this.setState(() => ({
        ...this.state,
        currentMessage: "Failed to find device peer.",
      }));
      return;
    }

    // We can connect our real-time communication client to device peers by their ID
    const devicePeerId = devicePeer.id;
    await rtcClient.connect(devicePeerId);

    // WebRTC requires a signaling phase when forming a new connection.
    // Wait for the signaling process to complete...
    while (rtcClient.getConnectionStatus(devicePeerId) !== "connected") {
      await delay(100);
      this.setState(() => ({
        ...this.state,
        currentMessage: "Waiting for connection ...",
      }));
    }

    this.setState(() => ({
      ...this.state,
      currentMessage: "Connected",
    }));

    rtcClient.controlRemoteStream(devicePeerId, {
      streamName: "Integrated Camera Integrated C - dev.video0",
      enable: true,
      pipeline: "rtc",
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <formant-button primary onClick={this.onConnect.bind(this)}>
            Connect
          </formant-button>
          <p>Live video viewer</p>
          <p>{this.state.currentMessage}</p>
          <p>{this.state.drawerWarning}</p>
          <canvas
            ref={(_) =>
              this.h264BytestreamCanvasDrawer.setCanvas(_ || undefined)
            }
          />
        </header>
      </div>
    );
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default App;
