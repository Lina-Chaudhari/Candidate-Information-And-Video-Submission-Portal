const express = require('express');
const multer = require('multer');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const stream = require('stream');
const Candidate = require('../models/Candidate');
const router = express.Router();

const mongoUri = 'mongodb://localhost:27017/candidate_portal';
let gridfsBucket;

MongoClient.connect(mongoUri)
  .then(client => {
    gridfsBucket = new GridFSBucket(client.db());
    console.log('GridFS initialized');
  })
  .catch(console.error);

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Resume required' });
  if (req.file.mimetype !== 'application/pdf')
    return res.status(400).json({ message: 'Only PDF allowed' });

  const readable = new stream.Readable();
  readable.push(req.file.buffer);
  readable.push(null);

  const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
    contentType: 'application/pdf'
  });
  readable.pipe(uploadStream).on('finish', () =>
    res.json({ fileId: uploadStream.id.toString() })
  );
});

router.get('/resume/:id', (req, res) => {
  gridfsBucket.openDownloadStream(new ObjectId(req.params.id)).pipe(res);
});

router.post('/submit', upload.single('video'), async (req, res) => {
  const { firstName, lastName, positionAppliedFor, currentPosition, experience, resumeId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Video required' });

  const readable = new stream.Readable();
  readable.push(req.file.buffer);
  readable.push(null);

  const uploadStream = gridfsBucket.openUploadStream(req.file.originalname || 'video.webm');
  readable.pipe(uploadStream).on('finish', async () => {
    const candidate = new Candidate({
      firstName,
      lastName,
      positionAppliedFor,
      currentPosition,
      experience,
      resumeFileId: resumeId,
      videoFileId: uploadStream.id.toString()
    });
    await candidate.save();
    res.json({ success: true });
  });
});

module.exports = router;
