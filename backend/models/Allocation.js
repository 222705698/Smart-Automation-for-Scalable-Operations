const Participant = require("./Participant");
const Session = require("./Session");

async function assignParticipant(participantId, sessionId) {
  const participant = await Participant.findOne({ id: participantId });
  const session = await Session.findOne({ id: sessionId });

  if (!participant) throw new Error("Participant not found");
  if (!session) throw new Error("Session not found");

  // Rule 1: Session capacity
  if (session.allocations.length >= session.capacity) {
    throw new Error("Session full");
  }

  // Rule 2: Unique assignment
  if (participant.assignedSession) {
    throw new Error("Participant already assigned");
  }

  // Rule 3: Department quota
  const used = await Participant.countDocuments({
    assignedSession: sessionId,
    department: participant.department
  });

  if (used >= session.departmentSeats.get(participant.department)) {
    throw new Error(`${participant.department} quota exceeded`);
  }

  // Assign
  participant.assignedSession = sessionId;
  session.allocations.push(participantId);

  await participant.save();
  await session.save();

  return {
    message: `Success: ${participant.name} assigned to ${sessionId}`,
    remainingSeats: session.capacity - session.allocations.length,
    remainingDeptSeats: session.departmentSeats.get(participant.department) - (used + 1)
  };
}

module.exports = { assignParticipant };
