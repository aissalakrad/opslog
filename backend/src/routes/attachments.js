const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/knex');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post('/:ticketId', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const ticket = await db('tickets').where({ id: req.params.ticketId }).first();
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const [attachment] = await db('attachments')
      .insert({
        ticket_id: ticket.id,
        uploaded_by: req.user.id,
        filename: file.originalname,
        filepath: file.path,
        filetype: file.mimetype,
        filesize: file.size,
      })
      .returning('*');

    res.status(201).json({ message: 'File uploaded', attachment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

router.get('/:ticketId', verifyToken, async (req, res) => {
  try {
    const attachments = await db('attachments')
      .select('attachments.*', 'users.name as uploaded_by_name')
      .leftJoin('users', 'attachments.uploaded_by', 'users.id')
      .where('attachments.ticket_id', req.params.ticketId)
      .orderBy('uploaded_at', 'desc');

    res.json(attachments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching attachments' });
  }
});

module.exports = router;