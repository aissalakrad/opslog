const express = require('express');
const db = require('../db/knex');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/:ticketId', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const ticket = await db('tickets').where({ id: req.params.ticketId }).first();
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const [comment] = await db('comments')
      .insert({
        ticket_id: ticket.id,
        user_id: req.user.id,
        content,
      })
      .returning('*');

    res.status(201).json({ message: 'Comment added', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

router.get('/:ticketId', verifyToken, async (req, res) => {
  try {
    const comments = await db('comments')
      .select(
        'comments.*',
        'users.name as author_name',
        'users.role as author_role'
      )
      .leftJoin('users', 'comments.user_id', 'users.id')
      .where('comments.ticket_id', req.params.ticketId)
      .orderBy('comments.created_at', 'asc');

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

module.exports = router;