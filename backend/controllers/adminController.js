const Ticket = require('../models/Ticket');

exports.getAnalytics = async (req, res) => {
  try {
    const [totalScannedTickets, dailyScannedStats] = await Promise.all([
      Ticket.countDocuments({ scannedBy: req.user._id, status: 'USED' }),
      Ticket.aggregate([
        {
          $match: {
            scannedBy: req.user._id,
            status: 'USED',
            scannedAt: { $ne: null, $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' } },
            scanned: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return res.status(200).json({
      totalScannedTickets,
      dailyScannedStats
    });
  } catch (error) {
    console.error('Admin analytics error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
