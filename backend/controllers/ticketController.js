const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const sendNotification = require('../utils/sendNotification');

exports.createTicket = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    let attachment = null;
    if (req.file) {
      attachment = `/uploads/${req.file.filename}`;
    }
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Validate category exists
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    // Validate user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' });
    }
    const ticket = new Ticket({
      title,
      description,
      category,
      createdBy: req.user.id,
      attachment,
    });
    await ticket.save();
    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (err) {
    console.error('Ticket creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    // Filter by status, assignedTo, createdBy, etc.
    const { status, assigned, mine } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (assigned === 'me') filter.assignedTo = req.user.id;
    if (mine === 'true') filter.createdBy = req.user.id;
    const tickets = await Ticket.find(filter)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error('updateTicket: req.user or req.user.id missing', req.user);
      return res.status(401).json({ message: 'User authentication failed. Please log in again.' });
    }
    const { id } = req.params;
    const { status, comment, assignedTo } = req.body;
    const ticket = await Ticket.findById(id).populate('createdBy assignedTo');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Only agent or admin or ticket creator can update
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Agent' &&
      String(ticket.createdBy._id) !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    let notifyUsers = [];
    if (status && status !== ticket.status) {
      ticket.status = status;
      notifyUsers.push(ticket.createdBy);
      if (ticket.assignedTo) notifyUsers.push(ticket.assignedTo);
    }
    if (assignedTo && (!ticket.assignedTo || String(ticket.assignedTo._id) !== assignedTo)) {
      const agent = await User.findById(assignedTo);
      if (agent) {
        ticket.assignedTo = agent._id;
        notifyUsers.push(agent);
      }
    }
    if (comment) {
      ticket.comments.push({ text: comment, author: req.user.id });
      notifyUsers.push(ticket.createdBy);
      if (ticket.assignedTo) notifyUsers.push(ticket.assignedTo);
    }
    await ticket.save();
    res.json({ message: 'Ticket updated', ticket });
    // Send notifications in the background, do not block response
    (async () => {
      for (const u of notifyUsers) {
        if (u && u.email) {
          try {
            await sendNotification(
              u.email,
              `Ticket Update: ${ticket.title}`,
              `Ticket status: ${ticket.status}\n${comment ? 'New comment: ' + comment : ''}`
            );
          } catch (notifyErr) {
            console.error('Notification error:', notifyErr);
          }
        }
      }
    })();
  } catch (err) {
    console.error('updateTicket error:', err, err.stack);
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'Open' });
    const resolved = await Ticket.countDocuments({ status: 'Resolved' });
    const byStatus = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({ total, open, resolved, byStatus });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate({
        path: 'comments.author',
        select: 'name role',
        model: 'User'
      });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
