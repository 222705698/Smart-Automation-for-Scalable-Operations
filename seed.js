require('dotenv').config();
const mongoose    = require('mongoose');
const Participant = require('./models/Participant');
const Session     = require('./models/Session');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected — seeding...');

  await Participant.deleteMany({});
  const depts = [
    { dept: 'Division A', count: 24 },
    { dept: 'Division B', count: 18 },
    { dept: 'Division C', count: 18 },
  ];
  let id = 1;
  for (const { dept, count } of depts) {
    for (let i = 1; i <= count; i++) {
      await Participant.create({
        participantId: `P${String(id).padStart(3, '0')}`,
        name: `${dept} Employee ${i}`,
        department: dept,
      });
      id++;
    }
  }

  await Session.deleteMany({});
  await Session.insertMany([
    { sessionId: 'morning',   label: 'Morning',   timeSlot: '09:00 - 10:30', capacity: 20 },
    { sessionId: 'midday',    label: 'Midday',    timeSlot: '11:00 - 12:30', capacity: 20 },
    { sessionId: 'afternoon', label: 'Afternoon', timeSlot: '13:00 - 14:30', capacity: 20 },
  ]);

  console.log(' Seeded 60 participants and 3 sessions');
  process.exit();
};

run().catch(err => { console.error(err); process.exit(1); });