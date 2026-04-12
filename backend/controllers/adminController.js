const Ticket = require('../models/Ticket');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalTicketsSold, totalTicketsUsed, dailyStats] = await Promise.all([
      Ticket.countDocuments({}),
      Ticket.countDocuments({ status: 'USED' }),
      Ticket.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sold: { $sum: 1 },
            used: {
              $sum: {
                $cond: [{ $eq: ['$status', 'USED'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return res.status(200).json({
      totalTicketsSold,
      totalTicketsUsed,
      dailyStats
    });
  } catch (error) {
    console.error('Admin analytics error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
