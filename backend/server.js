const express = require("express");
const cors = require("cors");
require("./db"); // connect to MongoDB
const Participant = require("./models/Participant");
const Session = require("./models/Session");
const { assignParticipant } = require("./models/Allocation");
const { seedData } = require("./seed");

const app = express();
app.use(cors());
app.use(express.json());

// Seed initial data
seedData();

// Routes
app.post("/participants", async (req, res) => {
  try {
    const { id, name, department } = req.body;
    const participant = new Participant({ id, name, department });
    await participant.save();
    res.json({ message: "Participant added", participant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/assign", async (req, res) => {
  try {
    const { participantId, sessionId } = req.body;
    const result = await assignParticipant(participantId, sessionId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/sessions", async (req, res) => {
  const sessions = await Session.find();
  res.json(sessions.map(s => ({
    id: s.id,
    time: s.time,
    capacity: s.capacity,
    remainingSeats: s.capacity - s.allocations.length,
    allocations: s.allocations
  })));
});

app.get("/participants", async (req, res) => {
  const participants = await Participant.find();
  res.json(participants);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
