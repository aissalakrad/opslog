const express = require('express');
const db = require('../db/knex');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.get('/summary', verifyToken, async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    let whereClause = '';
    const bindings = [];

    if (role === 'employee') {
      whereClause = 'WHERE created_by = ?';
      bindings.push(userId);
    }

    const sql = `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'open')::int AS open,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'in progress')::int AS in_progress,
        COUNT(*) FILTER (WHERE LOWER(TRIM(status)) = 'closed')::int AS closed
      FROM tickets
      ${whereClause};
    `;

    const result = await db.raw(sql, bindings);
    const summary = result.rows ? result.rows[0] : result[0];

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching summary' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: 'Title and description are required.' });

    const [ticket] = await db('tickets')
      .insert({
        title,
        description,
        created_by: req.user.id,
        status: 'open',
      })
      .returning('*');

    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating ticket' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    let query = db('tickets')
      .select('tickets.*', 'users.name as created_by_name')
      .leftJoin('users', 'tickets.created_by', 'users.id');

    if (req.user.role === 'employee') {
      query = query.where('created_by', req.user.id);
    }

    const tickets = await query.orderBy('created_at', 'desc');
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await db('tickets').where({ id: req.params.id }).first();
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching ticket' });
  }
});

router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { role } = req.user;

    if (!['technician', 'admin'].includes(role)) {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }

    const [updatedTicket] = await db('tickets')
      .where({ id: req.params.id })
      .update({ status })
      .returning('*');

    res.json({ message: 'Status updated successfully', ticket: updatedTicket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status' });
  }

  console.log(`Updating ticket ${req.params.id} to status ${status}`);
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admins can delete tickets' });

    const deleted = await db('tickets').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ message: 'Ticket not found' });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting ticket' });
  }
});

module.exports = router;