const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Sample Route
app.get("/api/questions", (_, res) => {
  res.json([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Madrid", "Rome"],
      correct: 0,
    },
    {
      id: 2,
      question: 'Who wrote "To Kill a Mockingbird"?',
      options: ["Harper Lee", "J.K. Rowling", "Ernest Hemingway", "Mark Twain"],
      correct: 0,
    },
    {
      id: 3,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1,
    },
    {
      id: 4,
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Jupiter", "Saturn"],
      correct: 1,
    },
    {
      id: 5,
      question: "What is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "Maldives"],
      correct: 1,
    },
    {
      id: 6,
      question: "What is the largest mammal in the world?",
      options: ["Elephant", "Blue Whale", "Giraffe"],
      correct: 1,
    },
    {
      id: 7,
      question: "What is the largest ocean in the world?",
      options: ["Atlantic", "Indian", "Pacific"],
      correct: 2,
    },
    {
      id: 8,
      question: "What is the largest animal in the world?",
      options: ["Elephant", "Blue Whale", "Giraffe"],
      correct: 1,
    },
    {
      id: 9,
      question: "What is the largest bird in the world?",
      options: ["Ostrich", "Eagle", "Albatross"],
      correct: 0,
    },
    {
      id: 10,
      question: "What is the largest continent in the world?",
      options: ["Africa", "Asia", "Europe"],
      correct: 1,
    },
  ]);
});

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Track connected WebSocket clients
const connectedClients = new Set();

let buttonState = ""; // Global variable to store the button state

// Handle incoming WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected via WebSocket");
  connectedClients.add(socket);

  // Send the current button state to the newly connected client
  if (buttonState) {
    socket.emit("buttonState", buttonState);
  }

  socket.on("message", (message) => {
    try {
      console.log("Message received from client:", message);
      const parsedMessage = JSON.parse(message);
      // Handle specific message types if needed
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      socket.emit("error", "Invalid message format");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from WebSocket");
    connectedClients.delete(socket);
  });
});

// Function to broadcast messages to all connected WebSocket clients
function broadcastToClients(message) {
  io.emit("buttonState", message);
}

// GET Method to retrieve the button state
app.get("/update", (req, res) => {
  try {
    // Check if buttonState has been set
    if (buttonState && buttonState.length > 0) {
      console.log(`Current button state: ${buttonState}`);

      // Send the current button state to the client
      res.status(200).json({
        success: true,
        message: "Button state retrieved",
        data: buttonState,
      });
    } else {
      // If no button state is available
      console.log("No button state available");

      // Return an empty state message
      res.status(200).json({
        success: true,
        message: "No button state available",
        data: "",
      });
    }
  } catch (error) {
    console.error("Error handling /update GET request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// POST Method to update the button state
app.post("/update", (req, res) => {
  try {
    const payload = req.body; // Get the full payload sent from the client
    const controllerId = payload.controller_id || "";
    const inputs = payload.inputs || {};
    const buttons = inputs.buttons || {};

    // Check if there are buttons in the payload
    if (Object.keys(buttons).length > 0) {
      // Update the button state for each button
      let buttonStates = [];
      for (let button in buttons) {
        const action = buttons[button].state; // Get the button state (pressed, released)
        buttonStates.push(`Button: ${button}, Action: ${action}`);
      }
      buttonState = buttonStates.join(', '); // Combine all button states into a string

      console.log(`Button states updated: ${buttonState}`);

      // Broadcast the updated button state to all WebSocket clients
      broadcastToClients(buttonState);

      // Respond back to the client
      res.status(200).json({
        success: true,
        message: `Button states updated for ${controllerId}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No button states provided in the request body",
      });
    }
  } catch (error) {
    console.error("Error handling POST /update:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Error handling middleware for Express
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start the Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
