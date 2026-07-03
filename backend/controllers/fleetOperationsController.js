const AuditLog = require('../models/AuditLog');
const Bus = require('../models/Bus');
const ConductorProfile = require('../models/ConductorProfile');
const DriverProfile = require('../models/DriverProfile');
const FuelRecord = require('../models/FuelRecord');
const GPSLocation = require('../models/GPSLocation');
const Incident = require('../models/Incident');
const LeaveRequest = require('../models/LeaveRequest');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const Notification = require('../models/Notification');
const OfflineQueue = require('../models/OfflineQueue');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Stop = require('../models/Stop');
const Ticket = require('../models/Ticket');
const Trip = require('../models/Trip');
const TripEvent = require('../models/TripEvent');
const { detectScheduleConflicts, validateAssignment } = require('../services/assignmentService');
const metrics = require('../services/metricsService');
const realtimeBus = require('../services/realtimeBus');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const MANAGE_ROLES = ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'bus_manager', 'dispatcher', 'scheduler'];
const READ_ROLES = [...MANAGE_ROLES, 'driver', 'conductor', 'finance_manager', 'support'];
const DISPATCH_ROLES = ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'dispatcher'];
const FLEET_ROLES = ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'bus_manager'];
const CREW_ROLES = ['driver', 'conductor'];

function canRead(user) {
  return READ_ROLES.includes(user.role);
}

function canManage(user) {
  return MANAGE_ROLES.includes(user.role);
}

function canDispatch(user) {
  return DISPATCH_ROLES.includes(user.role);
}

function canManageFleet(user) {
  return FLEET_ROLES.includes(user.role);
}

function page(query) {
  const current = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 100);
  return { page: current, limit, skip: (current - 1) * limit };
}

function regex(value) {
  return value ? new RegExp(String(value).trim(), 'i') : null;
}

function routeSerialize(route) {
  return {
    _id: route._id,
    from: route.from,
    to: route.to,
    fare: route.fare,
    city: route.city,
    active: route.active,
    fromCoords: route.fromCoords,
    toCoords: route.toCoords,
    routeCode: route.routeCode,
    direction: route.direction,
    polyline: route.polyline,
    distanceKm: route.distanceKm,
    durationMinutes: route.durationMinutes,
    estimatedTime: route.estimatedTime,
    routeColor: route.routeColor,
    zone: route.zone,
    operatingDays: route.operatingDays,
    operatingHours: route.operatingHours,
    pricingZones: route.pricingZones,
    priority: route.priority,
    assignedBus: route.assignedBus,
    assignedDriver: route.assignedDriver,
    assignedConductor: route.assignedConductor,
    createdAt: route.createdAt,
    updatedAt: route.updatedAt
  };
}

async function audit(req, action, targetType, targetId, before, after, metadata) {
  await AuditLog.create({
    organizationId: await resolveOrganizationId(req.user),
    actorId: req.user._id,
    action,
    targetType,
    targetId,
    before,
    after,
    metadata
  });
}

async function notifyRoles(organizationId, roles, title, message, category) {
  await Notification.insertMany(roles.map((role) => ({
    organizationId,
    audience: 'role',
    role,
    title,
    message,
    category
  })));
}

async function createTripEvent(req, trip, type, message, metadata = {}) {
  const organizationId = await resolveOrganizationId(req.user);
  const event = await TripEvent.create({
    organizationId,
    tripId: trip._id,
    actorId: req.user._id,
    type,
    message,
    metadata
  });
  await audit(req, 'trip_event_created', 'TripEvent', event._id, null, event.toObject());
  realtimeBus.publish(organizationId, type, { trip, event });
  return event;
}

function requireRead(req, res) {
  if (!canRead(req.user)) {
    res.status(403).json({ error: 'Fleet operations access required' });
    return false;
  }
  return true;
}

function requireManage(req, res) {
  if (!canManage(req.user)) {
    res.status(403).json({ error: 'Fleet operations management access required' });
    return false;
  }
  return true;
}

async function listModel(req, res, Model, searchable, base = {}) {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const { page: current, limit, skip } = page(req.query);
  const query = { organizationId, ...base };
  if (req.query.status && req.query.status !== 'all') query.status = req.query.status;
  if (req.query.search) {
    const search = regex(req.query.search);
    query.$or = searchable.map((field) => ({ [field]: search }));
  }
  const [items, total] = await Promise.all([
    Model.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Model.countDocuments(query)
  ]);
  res.json({ items, pagination: { page: current, limit, total, pages: Math.ceil(total / limit) || 1 } });
}

exports.listBuses = (req, res) => listModel(req, res, Bus, ['busNumber', 'registrationNumber', 'manufacturer', 'model'], { isDeleted: { $ne: true } });

exports.createBus = async (req, res) => {
  try {
    if (!requireManage(req, res)) return;
    const organizationId = await resolveOrganizationId(req.user);
    const bus = await Bus.create({ ...req.body, organizationId, createdBy: req.user._id, updatedBy: req.user._id });
    await audit(req, 'bus_created', 'Bus', bus._id, null, bus.toObject());
    res.status(201).json({ bus });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Bus number or registration already exists' });
    res.status(500).json({ error: 'Failed to create bus' });
  }
};

exports.getBus = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const bus = await Bus.findOne({ _id: req.params.id, organizationId, isDeleted: { $ne: true } }).lean();
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  const history = await AuditLog.find({ targetType: 'Bus', targetId: bus._id }).sort({ createdAt: -1 }).limit(30).lean();
  res.json({ bus, history });
};

exports.updateBus = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const before = await Bus.findOne({ _id: req.params.id, organizationId, isDeleted: { $ne: true } }).lean();
  if (!before) return res.status(404).json({ error: 'Bus not found' });
  const bus = await Bus.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { ...req.body, updatedBy: req.user._id } }, { new: true, runValidators: true });
  await audit(req, 'bus_updated', 'Bus', bus._id, before, bus.toObject());
  res.json({ bus });
};

exports.deleteBus = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const bus = await Bus.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { isDeleted: true, status: 'retired', updatedBy: req.user._id } }, { new: true });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  await audit(req, 'bus_deleted', 'Bus', bus._id, null, bus.toObject());
  res.json({ message: 'Bus deleted', bus });
};

exports.updateBusStatus = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const bus = await Bus.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { status: req.body.status, updatedBy: req.user._id } }, { new: true, runValidators: true });
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  await audit(req, 'bus_status_changed', 'Bus', bus._id, null, { status: bus.status });
  res.json({ bus });
};

exports.updateBusMaintenance = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const bus = await Bus.findOneAndUpdate(
    { _id: req.params.id, organizationId },
    { $set: { maintenanceStatus: req.body.maintenanceStatus, lastServiceDate: req.body.lastServiceDate, nextServiceDate: req.body.nextServiceDate, updatedBy: req.user._id } },
    { new: true, runValidators: true }
  );
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  await audit(req, 'bus_maintenance_updated', 'Bus', bus._id, null, { maintenanceStatus: bus.maintenanceStatus });
  res.json({ bus });
};

exports.busHistory = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const bus = await Bus.findOne({ _id: req.params.id, organizationId }).lean();
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  const history = await AuditLog.find({ targetType: 'Bus', targetId: bus._id }).sort({ createdAt: -1 }).lean();
  res.json({ history });
};

exports.exportBuses = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const buses = await Bus.find({ organizationId, isDeleted: { $ne: true } }).lean();
  const columns = ['busNumber', 'registrationNumber', 'status', 'maintenanceStatus', 'capacity', 'vehicleType', 'fuelType'];
  const csv = [columns.join(','), ...buses.map((bus) => columns.map((col) => `"${String(bus[col] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
};

exports.importBuses = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const rows = Array.isArray(req.body.buses) ? req.body.buses : [];
  const created = [];
  const errors = [];
  for (const [index, row] of rows.entries()) {
    try {
      created.push(await Bus.create({ ...row, organizationId, createdBy: req.user._id, updatedBy: req.user._id }));
    } catch (error) {
      errors.push({ row: index + 1, error: error.message });
    }
  }
  res.status(errors.length ? 207 : 201).json({ created, errors });
};

exports.listDrivers = (req, res) => listModel(req, res, DriverProfile, ['licenseNumber', 'bloodGroup', 'status']);
exports.listConductors = (req, res) => listModel(req, res, ConductorProfile, ['employeeId', 'status', 'notes']);

async function createProfile(req, res, Model, action, targetType) {
  if (!requireManage(req, res)) return;
  try {
    const organizationId = await resolveOrganizationId(req.user);
    const profile = await Model.create({ ...req.body, organizationId });
    await audit(req, action, targetType, profile._id, null, profile.toObject());
    res.status(201).json({ profile });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Profile already exists' });
    res.status(500).json({ error: 'Failed to create profile' });
  }
}

async function updateProfile(req, res, Model, action, targetType) {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const before = await Model.findOne({ _id: req.params.id, organizationId }).lean();
  if (!before) return res.status(404).json({ error: 'Profile not found' });
  const profile = await Model.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: req.body }, { new: true, runValidators: true });
  await audit(req, action, targetType, profile._id, before, profile.toObject());
  res.json({ profile });
}

exports.createDriver = (req, res) => createProfile(req, res, DriverProfile, 'driver_created', 'DriverProfile');
exports.updateDriver = (req, res) => updateProfile(req, res, DriverProfile, 'driver_updated', 'DriverProfile');
exports.deleteDriver = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const removed = await DriverProfile.findOneAndDelete({ _id: req.params.id, organizationId });
  if (!removed) return res.status(404).json({ error: 'Driver not found' });
  await audit(req, 'driver_deleted', 'DriverProfile', removed._id, removed.toObject(), null);
  res.json({ message: 'Driver deleted' });
};
exports.assignDriverBus = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  await validateAssignment({ organizationId, driverId: req.params.id, busId: req.body.busId });
  const profile = await DriverProfile.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { assignedBus: req.body.busId, status: 'assigned' } }, { new: true });
  await audit(req, 'driver_assigned', 'DriverProfile', profile._id, null, { assignedBus: req.body.busId });
  res.json({ profile });
};

exports.createConductor = (req, res) => createProfile(req, res, ConductorProfile, 'conductor_created', 'ConductorProfile');
exports.updateConductor = (req, res) => updateProfile(req, res, ConductorProfile, 'conductor_updated', 'ConductorProfile');
exports.deleteConductor = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const removed = await ConductorProfile.findOneAndDelete({ _id: req.params.id, organizationId });
  if (!removed) return res.status(404).json({ error: 'Conductor not found' });
  await audit(req, 'conductor_deleted', 'ConductorProfile', removed._id, removed.toObject(), null);
  res.json({ message: 'Conductor deleted' });
};
exports.assignConductorBus = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  await validateAssignment({ organizationId, conductorId: req.params.id, busId: req.body.busId });
  const profile = await ConductorProfile.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { assignedBus: req.body.busId, status: 'assigned' } }, { new: true });
  await audit(req, 'conductor_assigned', 'ConductorProfile', profile._id, null, { assignedBus: req.body.busId });
  res.json({ profile });
};

exports.listStops = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const stops = await Stop.find({ organizationId, routeId: req.params.routeId }).sort({ order: 1 }).lean();
  res.json({ stops });
};
exports.createStop = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const stop = await Stop.create({ ...req.body, organizationId, routeId: req.params.routeId });
  await audit(req, 'stop_created', 'Stop', stop._id, null, stop.toObject());
  res.status(201).json({ stop });
};
exports.updateStop = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const stop = await Stop.findOneAndUpdate({ _id: req.params.stopId, organizationId, routeId: req.params.routeId }, { $set: req.body }, { new: true, runValidators: true });
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  await audit(req, 'stop_updated', 'Stop', stop._id, null, stop.toObject());
  res.json({ stop });
};
exports.deleteStop = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const removed = await Stop.findOneAndDelete({ _id: req.params.stopId, organizationId, routeId: req.params.routeId });
  if (!removed) return res.status(404).json({ error: 'Stop not found' });
  await audit(req, 'stop_deleted', 'Stop', removed._id, removed.toObject(), null);
  res.json({ message: 'Stop deleted' });
};

exports.assignRoute = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  await validateAssignment({ organizationId, busId: req.body.assignedBus, driverId: req.body.assignedDriver, conductorId: req.body.assignedConductor });
  const route = await Route.findOneAndUpdate(
    { _id: req.params.id, organizationId },
    { $set: { assignedBus: req.body.assignedBus || null, assignedDriver: req.body.assignedDriver || null, assignedConductor: req.body.assignedConductor || null } },
    { new: true }
  ).lean();
  if (!route) return res.status(404).json({ error: 'Route not found' });
  await audit(req, 'route_assigned', 'Route', route._id, null, route);
  res.json({ route: routeSerialize(route) });
};

exports.optimizeRoute = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const stops = await Stop.find({ organizationId, routeId: req.params.id, active: true }).sort({ order: 1 }).lean();
  const distanceKm = Math.max(stops.length - 1, 1) * 2.4;
  res.json({ stops, distanceKm, durationMinutes: Math.round(distanceKm * 3), etaMinutes: Math.round(distanceKm * 3) });
};
exports.cloneRoute = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const source = await Route.findOne({ _id: req.params.id, organizationId }).lean();
  if (!source) return res.status(404).json({ error: 'Route not found' });
  const clone = await Route.create({ ...source, _id: undefined, routeCode: req.body.routeCode || `${source.routeCode || 'RT'}-COPY`, from: req.body.from || source.from, to: req.body.to || source.to, fromNormalized: `${source.fromNormalized}-copy`, toNormalized: `${source.toNormalized}-copy` });
  res.status(201).json({ route: routeSerialize(clone.toObject()) });
};
exports.deactivateRoute = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const route = await Route.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { active: false } }, { new: true }).lean();
  if (!route) return res.status(404).json({ error: 'Route not found' });
  res.json({ route: routeSerialize(route) });
};

exports.listSchedules = (req, res) => listModel(req, res, Schedule, ['tripNumber', 'status']);
exports.createSchedule = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  await validateAssignment({ organizationId, busId: req.body.busId, driverId: req.body.driverId, conductorId: req.body.conductorId });
  const conflicts = await detectScheduleConflicts({ ...req.body, organizationId });
  if (conflicts.length) {
    await audit(req, 'assignment_conflict_detected', 'Schedule', null, null, null, { conflicts: conflicts.map((item) => item._id) });
    return res.status(409).json({ error: 'Schedule conflict detected', conflicts });
  }
  const schedule = await Schedule.create({ ...req.body, organizationId });
  await audit(req, 'schedule_created', 'Schedule', schedule._id, null, schedule.toObject());
  res.status(201).json({ schedule });
};
exports.updateSchedule = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const before = await Schedule.findOne({ _id: req.params.id, organizationId }).lean();
  if (!before) return res.status(404).json({ error: 'Schedule not found' });
  const next = { ...before, ...req.body };
  const conflicts = await detectScheduleConflicts({ ...next, organizationId, excludeScheduleId: req.params.id });
  if (conflicts.length) return res.status(409).json({ error: 'Schedule conflict detected', conflicts });
  const schedule = await Schedule.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: req.body }, { new: true, runValidators: true });
  await audit(req, 'schedule_updated', 'Schedule', schedule._id, before, schedule.toObject());
  res.json({ schedule });
};
exports.deleteSchedule = async (req, res) => {
  if (!requireManage(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const removed = await Schedule.findOneAndDelete({ _id: req.params.id, organizationId });
  if (!removed) return res.status(404).json({ error: 'Schedule not found' });
  await audit(req, 'schedule_deleted', 'Schedule', removed._id, removed.toObject(), null);
  res.json({ message: 'Schedule deleted' });
};
exports.detectConflicts = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const conflicts = await detectScheduleConflicts({ ...req.body, organizationId, excludeScheduleId: req.params.id });
  res.json({ conflicts });
};

exports.operationsDashboard = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  const [buses, activeBuses, maintenance, driversOnDuty, conductorsOnDuty, trips, runningTrips, delayedTrips, cancelledTrips, incidents, tickets, fuel, maintenanceCost, alerts] = await Promise.all([
    Bus.countDocuments({ organizationId, isDeleted: { $ne: true } }),
    Bus.countDocuments({ organizationId, status: { $in: ['active', 'assigned'] }, isDeleted: { $ne: true } }),
    Bus.countDocuments({ organizationId, maintenanceStatus: { $in: ['due', 'overdue', 'in_service'] }, isDeleted: { $ne: true } }),
    DriverProfile.countDocuments({ organizationId, status: { $in: ['available', 'assigned'] } }),
    ConductorProfile.countDocuments({ organizationId, status: { $in: ['available', 'assigned'] } }),
    Trip.countDocuments({ organizationId, serviceDate: { $gte: start, $lte: end } }),
    Trip.countDocuments({ organizationId, serviceDate: { $gte: start, $lte: end }, status: { $in: ['active', 'in_progress'] } }),
    Trip.countDocuments({ organizationId, serviceDate: { $gte: start, $lte: end }, delayMinutes: { $gt: 0 }, status: { $ne: 'cancelled' } }),
    Trip.countDocuments({ organizationId, serviceDate: { $gte: start, $lte: end }, status: 'cancelled' }),
    Incident.countDocuments({ organizationId, status: { $in: ['open', 'acknowledged'] } }),
    Ticket.countDocuments({ organizationId }),
    FuelRecord.aggregate([{ $match: { organizationId } }, { $group: { _id: null, litres: { $sum: '$litres' }, cost: { $sum: '$totalCost' } } }]),
    MaintenanceRecord.aggregate([{ $match: { organizationId } }, { $group: { _id: null, cost: { $sum: '$cost' } } }]),
    Bus.find({ organizationId, $or: [{ nextServiceDate: { $lte: today } }, { 'insurance.expiresAt': { $lte: today } }, { 'permit.expiresAt': { $lte: today } }] }).limit(8).lean()
  ]);
  res.json({
    stats: { buses, activeBuses, maintenance, driversOnDuty, conductorsOnDuty, trips, runningTrips, delayedTrips, cancelledTrips, incidents, revenuePlaceholder: tickets * 20, fuelLitres: fuel[0]?.litres || 0, fuelCost: fuel[0]?.cost || 0, maintenanceCost: maintenanceCost[0]?.cost || 0 },
    alerts,
    quickActions: ['/buses', '/drivers', '/conductors', '/schedules']
  });
};

exports.dispatcherDashboard = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [trips, buses, drivers, conductors, incidents, leaveRequests] = await Promise.all([
    Trip.find({ organizationId, serviceDate: { $gte: today, $lt: tomorrow } }).sort({ plannedDeparture: 1 }).limit(30).lean(),
    Bus.find({ organizationId, isDeleted: { $ne: true }, status: { $in: ['active', 'assigned'] } }).limit(50).lean(),
    DriverProfile.find({ organizationId, status: { $in: ['available', 'assigned'] } }).limit(50).lean(),
    ConductorProfile.find({ organizationId, status: { $in: ['available', 'assigned'] } }).limit(50).lean(),
    Incident.find({ organizationId, status: { $in: ['open', 'acknowledged'] } }).sort({ createdAt: -1 }).limit(8).lean(),
    LeaveRequest.find({ organizationId, status: 'pending' }).sort({ createdAt: -1 }).limit(8).lean()
  ]);
  res.json({
    stats: {
      runningTrips: trips.filter((trip) => ['active', 'in_progress'].includes(trip.status)).length,
      upcomingDepartures: trips.filter((trip) => ['scheduled', 'preparing', 'boarding'].includes(trip.status)).length,
      activeBuses: buses.length,
      driverAvailability: drivers.length,
      conductorAvailability: conductors.length,
      routeDelays: trips.filter((trip) => trip.delayMinutes > 0).length,
      incidents: incidents.length,
      pendingLeave: leaveRequests.length
    },
    trips,
    buses,
    drivers,
    conductors,
    incidents,
    leaveRequests
  });
};

exports.listTrips = (req, res) => listModel(req, res, Trip, ['tripCode', 'status']);
exports.createTrip = async (req, res) => {
  if (!canDispatch(req.user)) return res.status(403).json({ error: 'Dispatch access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const schedule = await Schedule.findOne({ _id: req.body.scheduleId, organizationId }).lean();
  if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
  try {
    await validateAssignment({ organizationId, busId: schedule.busId, driverId: schedule.driverId, conductorId: schedule.conductorId });
    const trip = await Trip.create({
      organizationId,
      scheduleId: schedule._id,
      routeId: schedule.routeId,
      busId: schedule.busId,
      driverId: schedule.driverId,
      conductorId: schedule.conductorId,
      tripCode: req.body.tripCode || schedule.tripNumber,
      serviceDate: req.body.serviceDate || new Date(),
      plannedDeparture: schedule.departureTime,
      plannedArrival: schedule.arrivalTime,
      capacity: req.body.capacity || 0,
      notes: req.body.notes
    });
    await audit(req, 'trip_created', 'Trip', trip._id, null, trip.toObject());
    res.status(201).json({ trip });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'Trip already exists for this service date' });
    res.status(400).json({ error: error.message });
  }
};
exports.updateTripStatus = async (req, res) => {
  if (!canDispatch(req.user) && !CREW_ROLES.includes(req.user.role)) return res.status(403).json({ error: 'Trip execution access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const update = { status: req.body.status, delayMinutes: req.body.delayMinutes, cancellationReason: req.body.cancellationReason, occupancy: req.body.occupancy, revenue: req.body.revenue, notes: req.body.notes };
  if (['active', 'in_progress'].includes(req.body.status)) update.actualDeparture = new Date();
  if (req.body.status === 'completed') update.actualArrival = new Date();
  const trip = await Trip.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: update }, { new: true, runValidators: true });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  await audit(req, 'trip_status_changed', 'Trip', trip._id, null, trip.toObject());
  await createTripEvent(req, trip, req.body.eventType || 'note_added', req.body.notes || `Trip changed to ${trip.status}`, req.body);
  await notifyRoles(organizationId, ['dispatcher', 'operations_manager'], `Trip ${trip.tripCode} ${trip.status}`, `Trip status changed to ${trip.status}.`, 'dispatch');
  res.json({ trip });
};

exports.tripAction = async (req, res) => {
  if (!canDispatch(req.user) && !CREW_ROLES.includes(req.user.role)) return res.status(403).json({ error: 'Trip action access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const actionMap = {
    start: { status: 'active', eventType: 'started', message: 'Trip started' },
    pause: { status: 'paused', eventType: 'paused', message: 'Trip paused' },
    resume: { status: 'active', eventType: 'resumed', message: 'Trip resumed' },
    complete: { status: 'completed', eventType: 'completed', message: 'Trip completed' },
    delay: { status: 'delayed', eventType: 'delayed', message: 'Delay reported' },
    breakdown: { status: 'emergency', eventType: 'breakdown', message: 'Breakdown reported' },
    accident: { status: 'emergency', eventType: 'accident', message: 'Accident reported' },
    skip_stop: { eventType: 'stop_skipped', message: 'Stop skipped' },
    note: { eventType: 'note_added', message: req.body.note || 'Manual note added' },
    open_boarding: { status: 'boarding', eventType: 'boarding_opened', message: 'Boarding opened', boardingOpen: true },
    close_boarding: { eventType: 'boarding_closed', message: 'Boarding closed', boardingOpen: false },
    overcrowding: { eventType: 'overcrowding', message: 'Overcrowding reported' },
    fare_issue: { eventType: 'fare_issue', message: 'Fare issue reported' }
  };
  const config = actionMap[req.body.action];
  if (!config) return res.status(400).json({ error: 'Unsupported trip action' });
  const update = {
    ...(config.status ? { status: config.status } : {}),
    ...(config.boardingOpen !== undefined ? { boardingOpen: config.boardingOpen } : {}),
    ...(req.body.delayMinutes != null ? { delayMinutes: req.body.delayMinutes } : {}),
    ...(req.body.occupancy != null ? { occupancy: req.body.occupancy } : {}),
    ...(req.body.note ? { notes: req.body.note } : {})
  };
  if (config.status === 'active') update.actualDeparture = new Date();
  if (config.status === 'completed') update.actualArrival = new Date();
  const trip = await Trip.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: update }, { new: true, runValidators: true });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  await createTripEvent(req, trip, config.eventType, config.message, req.body);
  await notifyRoles(organizationId, ['dispatcher', 'operations_manager'], config.message, `Trip ${trip.tripCode}: ${config.message}`, config.status === 'emergency' ? 'emergency' : 'trip');
  res.json({ trip });
};

exports.updateTripLocation = async (req, res) => {
  if (!canDispatch(req.user) && !CREW_ROLES.includes(req.user.role)) return res.status(403).json({ error: 'Trip location access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const trip = await Trip.findOne({ _id: req.params.id, organizationId });
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return res.status(400).json({ error: 'Valid latitude and longitude required' });
  const location = await GPSLocation.create({
    organizationId,
    tripId: trip._id,
    busId: trip.busId,
    latitude,
    longitude,
    accuracy: req.body.accuracy,
    speed: req.body.speed,
    heading: req.body.heading,
    distanceTravelledKm: req.body.distanceTravelledKm,
    remainingDistanceKm: req.body.remainingDistanceKm,
    estimatedArrival: req.body.estimatedArrival,
    deviceInfo: req.body.deviceInfo
  });
  trip.liveLocation = { latitude, longitude, accuracy: req.body.accuracy, speed: req.body.speed || 0, heading: req.body.heading || 0, timestamp: location.recordedAt, deviceInfo: req.body.deviceInfo };
  trip.distanceTravelledKm = req.body.distanceTravelledKm || trip.distanceTravelledKm;
  trip.remainingDistanceKm = req.body.remainingDistanceKm || trip.remainingDistanceKm;
  trip.estimatedArrival = req.body.estimatedArrival || trip.estimatedArrival;
  trip.lastHeartbeatAt = new Date();
  await trip.save();
  await TripEvent.create({ organizationId, tripId: trip._id, actorId: req.user._id, type: 'location_updated', message: 'Location updated', metadata: location.toObject() });
  await audit(req, 'trip_location_updated', 'GPSLocation', location._id, null, location.toObject());
  metrics.increment('gpsUpdates');
  realtimeBus.publish(organizationId, 'location_updated', { trip, location });
  res.status(201).json({ trip, location });
};

exports.getTripLocation = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const trip = await Trip.findOne({ _id: req.params.id, organizationId }).lean();
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const location = await GPSLocation.findOne({ organizationId, tripId: trip._id }).sort({ recordedAt: -1 }).lean();
  res.json({ trip, location });
};

exports.getTripHistory = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const [locations, events] = await Promise.all([
    GPSLocation.find({ organizationId, tripId: req.params.id }).sort({ recordedAt: -1 }).limit(200).lean(),
    TripEvent.find({ organizationId, tripId: req.params.id }).sort({ createdAt: -1 }).limit(100).lean()
  ]);
  res.json({ locations, events });
};

exports.passengerTripStatus = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const trip = await Trip.findOne({ _id: req.params.id, organizationId }).lean();
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const [location, events] = await Promise.all([
    GPSLocation.findOne({ organizationId, tripId: trip._id }).sort({ recordedAt: -1 }).lean(),
    TripEvent.find({ organizationId, tripId: trip._id }).sort({ createdAt: -1 }).limit(20).lean()
  ]);
  res.json({ trip, location, events, eta: trip.estimatedArrival, progress: { distanceTravelledKm: trip.distanceTravelledKm, remainingDistanceKm: trip.remainingDistanceKm } });
};

exports.syncOfflineQueue = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const records = await OfflineQueue.insertMany(items.map((item) => ({ ...item, organizationId, userId: req.user._id, status: 'synced', syncedAt: new Date() })));
  await audit(req, 'offline_sync_received', 'OfflineQueue', null, null, null, { count: records.length });
  realtimeBus.publish(organizationId, 'offline_sync', { count: records.length, userId: req.user._id });
  res.status(201).json({ synced: records.length });
};

exports.realtimeEvents = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`event: connected\ndata: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  realtimeBus.addClient(organizationId, res);
};

exports.listMaintenance = (req, res) => listModel(req, res, MaintenanceRecord, ['title', 'status', 'type', 'vendor']);
exports.createMaintenance = async (req, res) => {
  if (!canManageFleet(req.user)) return res.status(403).json({ error: 'Fleet maintenance access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const record = await MaintenanceRecord.create({ ...req.body, organizationId, createdBy: req.user._id });
  await Bus.findOneAndUpdate({ _id: record.busId, organizationId }, { $set: { maintenanceStatus: record.status === 'completed' ? 'ok' : 'due', status: record.status === 'completed' ? 'active' : 'maintenance' } });
  await audit(req, 'maintenance_record_created', 'MaintenanceRecord', record._id, null, record.toObject());
  await notifyRoles(organizationId, ['fleet_manager', 'operations_manager', 'org_admin'], 'Maintenance alert', record.title, 'maintenance');
  res.status(201).json({ record });
};
exports.updateMaintenance = async (req, res) => {
  if (!canManageFleet(req.user)) return res.status(403).json({ error: 'Fleet maintenance access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const record = await MaintenanceRecord.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: req.body }, { new: true, runValidators: true });
  if (!record) return res.status(404).json({ error: 'Maintenance record not found' });
  if (record.status === 'completed') await Bus.findOneAndUpdate({ _id: record.busId, organizationId }, { $set: { maintenanceStatus: 'ok', status: 'active', lastServiceDate: new Date() } });
  await audit(req, 'maintenance_record_updated', 'MaintenanceRecord', record._id, null, record.toObject());
  res.json({ record });
};

exports.listFuel = (req, res) => listModel(req, res, FuelRecord, ['vendor']);
exports.createFuel = async (req, res) => {
  if (!canManageFleet(req.user)) return res.status(403).json({ error: 'Fuel management access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const litres = Number(req.body.litres || 0);
  const pricePerLitre = Number(req.body.pricePerLitre || 0);
  const distanceKm = Number(req.body.distanceKm || 0);
  const record = await FuelRecord.create({ ...req.body, organizationId, litres, pricePerLitre, distanceKm, totalCost: litres * pricePerLitre, efficiencyKmPerLitre: litres ? distanceKm / litres : 0, createdBy: req.user._id });
  await Bus.findOneAndUpdate({ _id: record.busId, organizationId }, { $set: { currentOdometer: record.odometer } });
  await audit(req, 'fuel_record_created', 'FuelRecord', record._id, null, record.toObject());
  res.status(201).json({ record });
};

exports.listLeave = (req, res) => listModel(req, res, LeaveRequest, ['reason', 'status', 'profileType']);
exports.requestLeave = async (req, res) => {
  if (!CREW_ROLES.includes(req.user.role) && !canManage(req.user)) return res.status(403).json({ error: 'Crew access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const request = await LeaveRequest.create({ ...req.body, organizationId, userId: req.body.userId || req.user._id });
  await audit(req, 'leave_requested', 'LeaveRequest', request._id, null, request.toObject());
  await notifyRoles(organizationId, ['dispatcher', 'operations_manager'], 'Leave request submitted', request.reason, 'leave');
  res.status(201).json({ request });
};
exports.reviewLeave = async (req, res) => {
  if (!canDispatch(req.user) && !canManageFleet(req.user)) return res.status(403).json({ error: 'Leave review access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const request = await LeaveRequest.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: { status: req.body.status, reviewNote: req.body.reviewNote, reviewedBy: req.user._id, reviewedAt: new Date() } }, { new: true, runValidators: true });
  if (!request) return res.status(404).json({ error: 'Leave request not found' });
  if (request.status === 'approved') {
    const Model = request.profileType === 'driver' ? DriverProfile : ConductorProfile;
    await Model.findOneAndUpdate({ _id: request.profileId, organizationId }, { $set: { status: 'on_leave' } });
  }
  await audit(req, 'leave_reviewed', 'LeaveRequest', request._id, null, request.toObject());
  res.json({ request });
};

exports.listIncidents = (req, res) => listModel(req, res, Incident, ['title', 'type', 'status', 'severity']);
exports.createIncident = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const incident = await Incident.create({ ...req.body, organizationId, reportedBy: req.user._id });
  await audit(req, 'incident_reported', 'Incident', incident._id, null, incident.toObject());
  await notifyRoles(organizationId, ['dispatcher', 'fleet_manager', 'operations_manager', 'org_admin'], `Incident: ${incident.title}`, incident.description || incident.type, 'incident');
  res.status(201).json({ incident });
};
exports.updateIncident = async (req, res) => {
  if (!canDispatch(req.user) && !canManageFleet(req.user) && req.user.role !== 'support') return res.status(403).json({ error: 'Incident management access required' });
  const organizationId = await resolveOrganizationId(req.user);
  const update = { ...req.body };
  if (['resolved', 'closed'].includes(update.status)) update.resolvedAt = new Date();
  const incident = await Incident.findOneAndUpdate({ _id: req.params.id, organizationId }, { $set: update }, { new: true, runValidators: true });
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  await audit(req, 'incident_updated', 'Incident', incident._id, null, incident.toObject());
  res.json({ incident });
};

exports.calendar = async (req, res) => {
  if (!requireRead(req, res)) return;
  const organizationId = await resolveOrganizationId(req.user);
  const from = req.query.from ? new Date(req.query.from) : new Date();
  const to = req.query.to ? new Date(req.query.to) : new Date(from.getTime() + 1000 * 60 * 60 * 24 * 14);
  const [trips, schedules, maintenance, leave, incidents] = await Promise.all([
    Trip.find({ organizationId, serviceDate: { $gte: from, $lte: to } }).lean(),
    Schedule.find({ organizationId, effectiveFrom: { $lte: to }, $or: [{ effectiveTo: null }, { effectiveTo: { $gte: from } }] }).lean(),
    MaintenanceRecord.find({ organizationId, scheduledFor: { $gte: from, $lte: to } }).lean(),
    LeaveRequest.find({ organizationId, fromDate: { $lte: to }, toDate: { $gte: from } }).lean(),
    Incident.find({ organizationId, createdAt: { $gte: from, $lte: to } }).lean()
  ]);
  res.json({
    events: [
      ...trips.map((item) => ({ _id: item._id, type: 'trip', title: item.tripCode, date: item.serviceDate, status: item.status })),
      ...schedules.map((item) => ({ _id: item._id, type: 'schedule', title: item.tripNumber, date: item.effectiveFrom, status: item.status })),
      ...maintenance.map((item) => ({ _id: item._id, type: 'maintenance', title: item.title, date: item.scheduledFor, status: item.status })),
      ...leave.map((item) => ({ _id: item._id, type: 'leave', title: item.reason, date: item.fromDate, status: item.status })),
      ...incidents.map((item) => ({ _id: item._id, type: 'incident', title: item.title, date: item.createdAt, status: item.status }))
    ]
  });
};
