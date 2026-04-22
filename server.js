require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/allocate',     require('./routes/allocate'));
app.use('/api/sessions',     require('./routes/sessions'));
app.use('/api/participants', require('./routes/participants'));

app.get('/', (req, res) => res.json({ status: 'Seat Allocation API running 🚀' }));

app.listen(process.env.PORT, () =>
  console.log(`Server on http://localhost:${process.env.PORT}`)
);