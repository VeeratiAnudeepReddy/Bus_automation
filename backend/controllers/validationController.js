const Ticket = require('../models/Ticket');
const ValidationLog = require('../models/ValidationLog');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parseScannedPayload = (input) => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Backward-compatible: if scanner sends plain ticketId UUID
  if (uuidRegex.test(input.trim())) {
    return { ticketId: input.trim() };
  }

  try {
    const parsed = JSON.parse(input);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      ticketId: parsed.ticketId,
      userId: parsed.userId,
      timestamp: parsed.timestamp
    };
  } catch (error) {
    return null;
  }
};

/**
 * Validate a ticket
 * POST /api/validate
 * FIXED: Faster queries, proper logging, race condition handling
 */
exports.validateTicket = async (req, res) => {
  try {
    const { ticketId, scannedData } = req.body;
    const parsedPayload = parseScannedPayload(scannedData || ticketId);

    // Validate input
    if (!parsedPayload?.ticketId) {
      return res.status(400).json({ error: 'Valid ticket QR data is required' });
    }

    if (!uuidRegex.test(parsedPayload.ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }

    let status;
    let ticket = null;
    const now = new Date();

    // Find ticket by ticketId (optimized lean query)
    ticket = await Ticket.findOne({ ticketId: parsedPayload.ticketId })
      .select('ticketId userId used status qrPayload')
      .lean();

    if (!ticket) {
      // Case 1: Ticket not found
      status = 'INVALID';
    } else if (ticket.used === true || ticket.status === 'USED') {
      // Case 2: Ticket already used
      status = 'ALREADY_USED';
    } else if (
      parsedPayload.userId &&
      String(ticket.userId) !== String(parsedPayload.userId)
    ) {
      status = 'INVALID';
    } else if (
      parsedPayload.timestamp &&
      ticket.qrPayload?.timestamp &&
      parsedPayload.timestamp !== ticket.qrPayload.timestamp
    ) {
      status = 'INVALID';
    } else {
      // Case 3: Valid ticket - mark as used
      // Use findOneAndUpdate to avoid race conditions
      const updated = await Ticket.findOneAndUpdate(
        { ticketId: parsedPayload.ticketId, used: false, status: 'UNUSED' }, // Only update if still unused
        {
          $set: {
            used: true,
            status: 'USED',
            usedAt: now
          }
        },
        { new: true }
      );

      if (updated) {
        status = 'VALID';
      } else {
        // Race condition: ticket was used between find and update
        status = 'ALREADY_USED';
      }
    }

    // Log validation asynchronously (don't wait)
    ValidationLog.create({
      ticketId: parsedPayload.ticketId,
      userId: ticket?.userId || null,
      status,
      scannedAt: now
    }).catch(err => console.error('Validation log error:', err.message));

    // Return status immediately
    return res.status(200).json({
      status,
      ticketId: parsedPayload.ticketId,
      userId: ticket?.userId || null
    });

  } catch (error) {
    console.error('Validation error:', error.message);
    return res.status(500).json({ error: 'Validation failed. Please try again.' });
  }
};

/**
 * Get recent validation history
 * GET /api/validation-history
 */
exports.getValidationHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const logs = await ValidationLog.find({})
      .sort({ scannedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      total: logs.length,
      logs: logs.map((log) => ({
        ticketId: log.ticketId,
        userId: log.userId,
        status: log.status,
        scannedAt: log.scannedAt || log.createdAt
      }))
    });
  } catch (error) {
    console.error('Validation history error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch validation history' });
  }
};
