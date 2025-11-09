const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const candidatesRoute = require('./routes/candidates');

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = 'mongodb://localhost:27017/candidate_portal';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use('/api/candidates', candidatesRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
