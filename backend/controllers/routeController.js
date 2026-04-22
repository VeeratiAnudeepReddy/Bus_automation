const Route = require('../models/Route');
const FareHistory = require('../models/FareHistory');

const HYDERABAD = 'Hyderabad';
const hyderabadSeedRoutes = [
  {
    from: 'Ameerpet',
    to: 'Koti',
    fare: 25,
    fromCoords: { lat: 17.4375, lng: 78.4483 },
    toCoords: { lat: 17.385, lng: 78.4867 }
  },
  {
    from: 'Kukatpally',
    to: 'Hitech City',
    fare: 30,
    fromCoords: { lat: 17.4948, lng: 78.3996 },
    toCoords: { lat: 17.4435, lng: 78.3772 }
  },
  {
    from: 'Secunderabad',
    to: 'LB Nagar',
    fare: 35,
    fromCoords: { lat: 17.4399, lng: 78.4983 },
    toCoords: { lat: 17.3457, lng: 78.5522 }
  },
  {
    from: 'Miyapur',
    to: 'Gachibowli',
    fare: 30,
    fromCoords: { lat: 17.4969, lng: 78.3562 },
    toCoords: { lat: 17.4399, lng: 78.3489 }
  },
  {
    from: 'Charminar',
    to: 'Mehdipatnam',
    fare: 20,
    fromCoords: { lat: 17.3616, lng: 78.4747 },
    toCoords: { lat: 17.3984, lng: 78.4382 }
  },
  {
    from: 'Uppal',
    to: 'Tarnaka',
    fare: 18,
    fromCoords: { lat: 17.4058, lng: 78.5591 },
    toCoords: { lat: 17.4283, lng: 78.5386 }
  }
];

const normalizeStop = (value) => String(value || '').trim();
const normalizeStopLower = (value) => normalizeStop(value).toLowerCase();

const parseCoords = (coords, label) => {
  if (!coords || typeof coords !== 'object') {
    return null;
  }

  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`Invalid ${label} coordinates`);
  }

  return { lat, lng };
};

const serializeRoute = (route) => ({
  _id: route._id,
  from: route.from,
  to: route.to,
  fare: route.fare,
  city: route.city,
  active: route.active,
  fromCoords: route.fromCoords,
  toCoords: route.toCoords,
  createdAt: route.createdAt,
  updatedAt: route.updatedAt
});

const ensureHyderabadSeedRoutes = async () => {
  const operations = hyderabadSeedRoutes.map((seed) => ({
    updateOne: {
      filter: {
        city: HYDERABAD,
        fromNormalized: normalizeStopLower(seed.from),
        toNormalized: normalizeStopLower(seed.to)
      },
      update: {
        $setOnInsert: {
          from: seed.from,
          to: seed.to,
          fromNormalized: normalizeStopLower(seed.from),
          toNormalized: normalizeStopLower(seed.to),
          fare: seed.fare,
          city: HYDERABAD,
          active: true,
          fromCoords: seed.fromCoords,
          toCoords: seed.toCoords
        }
      },
      upsert: true
    }
  }));

  if (operations.length) {
    await Route.bulkWrite(operations, { ordered: false });
  }
};

exports.getRoutesForUser = async (req, res) => {
  try {
    await ensureHyderabadSeedRoutes();
    const city = normalizeStop(req.query.city || HYDERABAD) || HYDERABAD;
    const from = normalizeStop(req.query.from);
    const to = normalizeStop(req.query.to);

    const query = { active: true, city };
    if (from) {
      query.fromNormalized = normalizeStopLower(from);
    }
    if (to) {
      query.toNormalized = normalizeStopLower(to);
    }

    const routes = await Route.find(query).sort({ from: 1, to: 1 }).lean();
    const activeRoutesInCity = await Route.find({ city, active: true })
      .select('from to fromCoords toCoords')
      .sort({ from: 1, to: 1 })
      .lean();

    const stopMap = new Map();
    activeRoutesInCity.forEach((route) => {
      if (!stopMap.has(route.from)) {
        stopMap.set(route.from, route.fromCoords);
      }
      if (!stopMap.has(route.to)) {
        stopMap.set(route.to, route.toCoords);
      }
    });

    const stops = [...stopMap.entries()].map(([name, coords]) => ({
      name,
      coords
    }));

    return res.status(200).json({
      city,
      routes: routes.map(serializeRoute),
      stops,
      popularRoutes: routes.slice(0, 6).map(serializeRoute)
    });
  } catch (error) {
    console.error('Get routes error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch routes' });
  }
};

exports.getAdminRoutes = async (req, res) => {
  try {
    await ensureHyderabadSeedRoutes();
    const city = normalizeStop(req.query.city || HYDERABAD) || HYDERABAD;
    const search = normalizeStop(req.query.search);
    const status = normalizeStop(req.query.status).toLowerCase();

    const query = { city };
    if (status === 'active') {
      query.active = true;
    } else if (status === 'inactive') {
      query.active = false;
    }

    if (search) {
      query.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } }
      ];
    }

    const routes = await Route.find(query).sort({ from: 1, to: 1 }).lean();
    return res.status(200).json({ routes: routes.map(serializeRoute) });
  } catch (error) {
    console.error('Admin get routes error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch admin routes' });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const from = normalizeStop(req.body.from);
    const to = normalizeStop(req.body.to);
    const city = normalizeStop(req.body.city || HYDERABAD) || HYDERABAD;
    const fare = Number(req.body.fare);
    const fromCoords = parseCoords(req.body.fromCoords, 'from');
    const toCoords = parseCoords(req.body.toCoords, 'to');

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to are required' });
    }
    if (normalizeStopLower(from) === normalizeStopLower(to)) {
      return res.status(400).json({ error: 'from and to cannot be the same' });
    }
    if (!Number.isFinite(fare) || fare <= 0) {
      return res.status(400).json({ error: 'fare must be a positive number' });
    }
    if (!fromCoords || !toCoords) {
      return res.status(400).json({ error: 'fromCoords and toCoords are required' });
    }

    const created = await Route.create({
      from,
      to,
      fromNormalized: normalizeStopLower(from),
      toNormalized: normalizeStopLower(to),
      fare,
      city,
      active: req.body.active !== false,
      fromCoords,
      toCoords
    });

    return res.status(201).json(serializeRoute(created.toObject()));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Route already exists in this city' });
    }
    if (error.message.includes('coordinates')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Create route error:', error.message);
    return res.status(500).json({ error: 'Failed to create route' });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const existing = await Route.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const updates = {};
    const nextFrom = req.body.from !== undefined ? normalizeStop(req.body.from) : existing.from;
    const nextTo = req.body.to !== undefined ? normalizeStop(req.body.to) : existing.to;

    if (!nextFrom || !nextTo) {
      return res.status(400).json({ error: 'from and to are required' });
    }
    if (normalizeStopLower(nextFrom) === normalizeStopLower(nextTo)) {
      return res.status(400).json({ error: 'from and to cannot be the same' });
    }

    updates.from = nextFrom;
    updates.to = nextTo;
    updates.fromNormalized = normalizeStopLower(nextFrom);
    updates.toNormalized = normalizeStopLower(nextTo);

    if (req.body.fare !== undefined) {
      const nextFare = Number(req.body.fare);
      if (!Number.isFinite(nextFare) || nextFare <= 0) {
        return res.status(400).json({ error: 'fare must be a positive number' });
      }
      updates.fare = nextFare;
    }

    if (req.body.active !== undefined) {
      updates.active = Boolean(req.body.active);
    }

    if (req.body.city !== undefined) {
      const city = normalizeStop(req.body.city);
      if (!city) {
        return res.status(400).json({ error: 'city cannot be empty' });
      }
      updates.city = city;
    }

    if (req.body.fromCoords !== undefined) {
      updates.fromCoords = parseCoords(req.body.fromCoords, 'from');
    }
    if (req.body.toCoords !== undefined) {
      updates.toCoords = parseCoords(req.body.toCoords, 'to');
    }

    const updated = await Route.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).lean();

    if (
      updates.fare !== undefined &&
      Number(existing.fare) !== Number(updates.fare)
    ) {
      await FareHistory.create({
        routeId: existing._id,
        previousFare: existing.fare,
        newFare: updates.fare,
        updatedBy: req.user._id
      });
    }

    return res.status(200).json(serializeRoute(updated));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Route already exists in this city' });
    }
    if (error.message.includes('coordinates')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Update route error:', error.message);
    return res.status(500).json({ error: 'Failed to update route' });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const removed = await Route.findByIdAndDelete(req.params.id).lean();
    if (!removed) {
      return res.status(404).json({ error: 'Route not found' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete route error:', error.message);
    return res.status(500).json({ error: 'Failed to delete route' });
  }
};

exports.toggleRoute = async (req, res) => {
  try {
    const existing = await Route.findById(req.params.id).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Route not found' });
    }
    const updated = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: { active: !existing.active } },
      { new: true }
    ).lean();
    return res.status(200).json(serializeRoute(updated));
  } catch (error) {
    console.error('Toggle route error:', error.message);
    return res.status(500).json({ error: 'Failed to toggle route' });
  }
};

exports.getFareHistory = async (req, res) => {
  try {
    const routeId = req.query.routeId;
    const query = routeId ? { routeId } : {};
    const logs = await FareHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('routeId', 'from to city')
      .populate('updatedBy', 'name email role')
      .lean();

    return res.status(200).json({
      history: logs.map((log) => ({
        _id: log._id,
        route: log.routeId,
        previousFare: log.previousFare,
        newFare: log.newFare,
        updatedBy: log.updatedBy,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error('Fare history error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch fare history' });
  }
};
