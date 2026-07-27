const Ticket = require('../models/Ticket');
const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const FinancialLedger = require('../models/FinancialLedger');
const WalletTransaction = require('../models/WalletTransaction');
const Coupon = require('../models/Coupon');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const DriverProfile = require('../models/DriverProfile');
const ConductorProfile = require('../models/ConductorProfile');
const Schedule = require('../models/Schedule');
const Post = require('../models/Post');
const SupportTicket = require('../models/SupportTicket');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const csv = (rows) => {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return [keys.join(','), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? '')).join(','))].join('\n');
};

exports.financeDashboard = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const [tickets, refunds, payments, wallet, coupons, ledger] = await Promise.all([
    Ticket.find({ organizationId }).populate('routeId', 'from to').lean(),
    Refund.find({ organizationId }).lean(),
    Payment.find({ organizationId }).sort({ createdAt: -1 }).limit(20).lean(),
    WalletTransaction.find({ organizationId }).lean(),
    Coupon.find({ organizationId }).lean(),
    FinancialLedger.find({ organizationId }).sort({ createdAt: -1 }).limit(500).lean()
  ]);
  const revenue = tickets.filter((t) => !['CANCELLED', 'REFUNDED'].includes(t.status)).reduce((sum, t) => sum + (t.fare || 0), 0);
  const refundTotal = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const debitWalletTypes = new Set(['debit', 'booking_debit']);
  const walletBalance = wallet.reduce((sum, txn) => sum + (debitWalletTypes.has(txn.type) ? -txn.amount : txn.amount), 0);
  const ledgerTotals = ledger.reduce((acc, entry) => {
    const signedAmount = entry.direction === 'debit' ? -entry.amount : entry.amount;
    acc[entry.category] = (acc[entry.category] || 0) + signedAmount;
    acc.total = (acc.total || 0) + signedAmount;
    return acc;
  }, {});
  const routeRevenue = tickets.reduce((acc, ticket) => {
    const label = ticket.routeId ? `${ticket.routeId.from} -> ${ticket.routeId.to}` : `${ticket.from || 'Route'} -> ${ticket.to || ''}`;
    acc[label] = (acc[label] || 0) + (ticket.fare || 0);
    return acc;
  }, {});
  res.json({
    stats: {
      revenue,
      dailyRevenue: revenue,
      monthlyRevenue: revenue,
      yearlyRevenue: revenue,
      bookings: new Set(tickets.map((ticket) => ticket.bookingId || ticket.ticketId)).size,
      refunds: refundTotal,
      ledgerRevenue: ledgerTotals.revenue || 0,
      gatewayRevenue: ledgerTotals.gateway || 0,
      walletRevenue: ledgerTotals.wallet || 0,
      refundLedger: Math.abs(ledgerTotals.refund || 0),
      taxCollected: ledgerTotals.tax || 0,
      couponDiscounts: Math.abs(ledgerTotals.coupon || 0),
      walletBalance,
      couponUsage: coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0),
      averageTicketPrice: tickets.length ? revenue / tickets.length : 0,
      outstandingRefunds: refunds.filter((refund) => !['processed', 'completed'].includes(refund.status)).length,
      pendingPayments: payments.filter((payment) => ['pending', 'created', 'authorized'].includes(payment.status)).length,
      paymentFailures: payments.filter((payment) => payment.status === 'failed').length
    },
    routeRevenue,
    topRoutes: Object.entries(routeRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5),
    recentPayments: payments,
    financialLedger: {
      totals: ledgerTotals,
      recentEntries: ledger.slice(0, 20)
    }
  });
};

exports.auditLogs = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const logs = await AuditLog.find({ organizationId }).sort({ createdAt: -1 }).limit(200).populate('actorId', 'name email role').lean();
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv(logs.map((log) => ({ action: log.action, actor: log.actorId?.email, createdAt: log.createdAt }))));
  }
  res.json({ logs });
};

exports.reports = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const tickets = await Ticket.find({ organizationId }).lean();
  const refunds = await Refund.find({ organizationId }).lean();
  const [payments, ledger] = await Promise.all([
    Payment.find({ organizationId }).lean(),
    FinancialLedger.find({ organizationId }).lean()
  ]);
  const rows = [
    { metric: 'bookings', value: new Set(tickets.map((t) => t.bookingId || t.ticketId)).size },
    { metric: 'tickets', value: tickets.length },
    { metric: 'revenue', value: tickets.reduce((sum, t) => sum + (t.fare || 0), 0) },
    { metric: 'refunds', value: refunds.reduce((sum, r) => sum + r.amount, 0) },
    { metric: 'payments', value: payments.length },
    { metric: 'ledger_entries', value: ledger.length },
    { metric: 'ledger_net', value: ledger.reduce((sum, entry) => sum + (entry.direction === 'debit' ? -entry.amount : entry.amount), 0) }
  ];
  if (['csv', 'excel', 'pdf'].includes(req.query.format)) {
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv(rows));
  }
  res.json({ reports: rows });
};

exports.moduleReport = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const moduleName = req.params.module;
  const [tickets, refunds, payments, ledger, users, routes, buses, drivers, conductors, posts, support] = await Promise.all([
    Ticket.find({ organizationId }).lean(),
    Refund.find({ organizationId }).lean(),
    Payment.find({ organizationId }).lean(),
    FinancialLedger.find({ organizationId }).lean(),
    User.find({ organizationId }).lean(),
    Route.find({ organizationId }).lean(),
    Bus.find({ organizationId }).lean(),
    DriverProfile.find({ organizationId }).lean(),
    ConductorProfile.find({ organizationId }).lean(),
    Post.find({ organizationId, deletedAt: null }).lean(),
    SupportTicket.find({ organizationId }).lean()
  ]);
  const datasets = {
    revenue: [{ metric: 'revenue', value: tickets.reduce((sum, t) => sum + (t.fare || 0), 0) }, { metric: 'averageTicket', value: tickets.length ? tickets.reduce((sum, t) => sum + (t.fare || 0), 0) / tickets.length : 0 }],
    fleet: [{ metric: 'buses', value: buses.length }, { metric: 'drivers', value: drivers.length }, { metric: 'conductors', value: conductors.length }],
    users: [{ metric: 'users', value: users.length }, { metric: 'active', value: users.filter((u) => u.status === 'ACTIVE').length }],
    routes: [{ metric: 'routes', value: routes.length }, { metric: 'active', value: routes.filter((r) => r.active).length }],
    finance: [
      { metric: 'payments', value: payments.length },
      { metric: 'refunds', value: refunds.reduce((sum, r) => sum + r.amount, 0) },
      { metric: 'ledgerNet', value: ledger.reduce((sum, entry) => sum + (entry.direction === 'debit' ? -entry.amount : entry.amount), 0) }
    ],
    support: [{ metric: 'tickets', value: support.length }, { metric: 'open', value: support.filter((t) => t.status === 'open').length }],
    audit: [{ metric: 'posts', value: posts.length }, { metric: 'tickets', value: tickets.length }]
  };
  const rows = datasets[moduleName] || datasets.revenue;
  if (['csv', 'excel', 'pdf'].includes(req.query.format)) {
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv(rows));
  }
  res.json({ module: moduleName, reports: rows });
};

exports.globalSearch = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ groups: [] });
  const search = new RegExp(q, 'i');
  const [users, routes, buses, tickets, payments, posts, support, schedules] = await Promise.all([
    User.find({ organizationId, $or: [{ name: search }, { email: search }, { role: search }] }).limit(8).select('name email role').lean(),
    Route.find({ organizationId, $or: [{ from: search }, { to: search }, { routeCode: search }] }).limit(8).select('from to routeCode').lean(),
    Bus.find({ organizationId, $or: [{ busNumber: search }, { registrationNumber: search }] }).limit(8).select('busNumber registrationNumber status').lean(),
    Ticket.find({ organizationId, $or: [{ ticketId: search }, { bookingId: search }] }).limit(8).select('ticketId bookingId status').lean(),
    Payment.find({ organizationId, $or: [{ razorpayOrderId: search }, { razorpayPaymentId: search }] }).limit(8).select('razorpayOrderId status amount').lean(),
    Post.find({ organizationId, deletedAt: null, $or: [{ title: search }, { body: search }, { tags: search }] }).limit(8).select('title category status').lean(),
    SupportTicket.find({ organizationId, $or: [{ ticketNumber: search }, { title: search }] }).limit(8).select('ticketNumber title status').lean(),
    Schedule.find({ organizationId, $or: [{ tripNumber: search }, { status: search }] }).limit(8).select('tripNumber status').lean()
  ]);
  res.json({
    groups: [
      { type: 'users', items: users },
      { type: 'routes', items: routes },
      { type: 'buses', items: buses },
      { type: 'tickets', items: tickets },
      { type: 'payments', items: payments },
      { type: 'posts', items: posts },
      { type: 'support', items: support },
      { type: 'schedules', items: schedules }
    ].filter((group) => group.items.length)
  });
};
