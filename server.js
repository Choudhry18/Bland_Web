const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pty = require("node-pty");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const interpreter = "./bland"
app.use(express.static("public")); // Serves frontend files

// Create PTY (Pseudo-terminal)
const shell = process.platform === "win32" ? "cmd.exe" : "bash"; // Use a shell
const ptyProcess = pty.spawn(interpreter, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: process.cwd(),
  env: process.env,
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send PTY output to the client
  ptyProcess.on("data", (data) => {
    ws.send(data);
  });

  // Receive input from the client and send it to the PTY
  ws.on("message", (msg) => {
    ptyProcess.write(msg + "\n");
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});