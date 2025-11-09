const mongoose = require('mongoose');
const CandidateSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  positionAppliedFor: String,
  currentPosition: String,
  experience: Number,
  resumeFileId: String,
  videoFileId: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Candidate', CandidateSchema);
