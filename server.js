const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const pty = require("node-pty");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const interpreter = "./bland"; // Path to your interpreter binary

app.use(express.static("public")); // Serves frontend files

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Spawn a new PTY instance per client
  const ptyProcess = pty.spawn(interpreter, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  // Forward output from the PTY process to the client
  ptyProcess.on("data", (data) => {
    ws.send(data);
  });

  // Send client input to the PTY process
  ws.on("message", (msg) => {
    ptyProcess.write(msg + "\n");
  });

  // Kill the PTY process when the client disconnects
  ws.on("close", () => {
    console.log("Client disconnected");
    ptyProcess.kill();
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});