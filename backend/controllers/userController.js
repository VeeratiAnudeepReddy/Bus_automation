const User = require('../models/User');
const Ticket = require('../models/Ticket');

/**
 * Get user details including balance
 * GET /api/user/:userId
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      balance: user.balance,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get user's ticket history
 * GET /api/user/:userId/tickets
 */
exports.getUserTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tickets = await Ticket.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      userId: user._id,
      userName: user.name,
      totalTickets: tickets.length,
      tickets: tickets.map(ticket => ({
        ticketId: ticket.ticketId,
        used: ticket.used,
        status: ticket.status || (ticket.used ? 'USED' : 'UNUSED'),
        fare: ticket.fare,
        usedAt: ticket.usedAt,
        createdAt: ticket.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all users (for admin purposes)
 * GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      total: users.length,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        balance: user.balance,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
