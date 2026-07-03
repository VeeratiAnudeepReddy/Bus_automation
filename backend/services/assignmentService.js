const Bus = require('../models/Bus');
const DriverProfile = require('../models/DriverProfile');
const ConductorProfile = require('../models/ConductorProfile');
const Schedule = require('../models/Schedule');

function normalizeDays(days = []) {
  return [...new Set(days)].sort();
}

function daysOverlap(left = [], right = []) {
  if (!left.length || !right.length) return true;
  const rightSet = new Set(right);
  return left.some((day) => rightSet.has(day));
}

function minutes(value) {
  const [hour, minute] = String(value || '00:00').split(':').map(Number);
  return hour * 60 + minute;
}

function timeOverlaps(aStart, aEnd, bStart, bEnd) {
  return minutes(aStart) < minutes(bEnd) && minutes(bStart) < minutes(aEnd);
}

async function validateAssignment({ organizationId, busId, driverId, conductorId, scheduleId = null }) {
  const [bus, driver, conductor] = await Promise.all([
    busId ? Bus.findOne({ _id: busId, organizationId, isDeleted: { $ne: true } }).lean() : null,
    driverId ? DriverProfile.findOne({ _id: driverId, organizationId }).lean() : null,
    conductorId ? ConductorProfile.findOne({ _id: conductorId, organizationId }).lean() : null
  ]);

  if (busId && !bus) throw new Error('Bus not found in organization');
  if (driverId && !driver) throw new Error('Driver not found in organization');
  if (conductorId && !conductor) throw new Error('Conductor not found in organization');
  if (bus && ['maintenance', 'retired', 'inactive'].includes(bus.status)) throw new Error('Bus is not available for assignment');
  if (bus && ['due', 'overdue', 'in_service'].includes(bus.maintenanceStatus)) throw new Error('Bus maintenance status prevents assignment');
  if (driver && !['available', 'assigned'].includes(driver.status)) throw new Error('Driver is not available for assignment');
  if (driver && driver.expiryDate && new Date(driver.expiryDate) < new Date()) throw new Error('Driver license is expired');
  if (conductor && !['available', 'assigned'].includes(conductor.status)) throw new Error('Conductor is not available for assignment');
  if (scheduleId) {
    const existingSchedule = await Schedule.findOne({ _id: scheduleId, organizationId }).lean();
    if (!existingSchedule) throw new Error('Schedule not found in organization');
  }
}

async function detectScheduleConflicts({ organizationId, busId, driverId, conductorId, departureTime, arrivalTime, days, effectiveFrom, effectiveTo, excludeScheduleId }) {
  const query = {
    organizationId,
    status: { $in: ['scheduled', 'active'] }
  };
  if (excludeScheduleId) query._id = { $ne: excludeScheduleId };
  query.$or = [{ busId }, { driverId }, { conductorId }].filter((item) => Object.values(item)[0]);
  const existing = await Schedule.find(query).lean();
  const nextDays = normalizeDays(days);
  const nextFrom = new Date(effectiveFrom);
  const nextTo = effectiveTo ? new Date(effectiveTo) : null;

  return existing.filter((schedule) => {
    const existingFrom = new Date(schedule.effectiveFrom);
    const existingTo = schedule.effectiveTo ? new Date(schedule.effectiveTo) : null;
    const dateOverlap = (!nextTo || existingFrom <= nextTo) && (!existingTo || nextFrom <= existingTo);
    return (
      dateOverlap &&
      daysOverlap(nextDays, schedule.days) &&
      timeOverlaps(departureTime, arrivalTime, schedule.departureTime, schedule.arrivalTime)
    );
  });
}

module.exports = {
  validateAssignment,
  detectScheduleConflicts,
  normalizeDays,
  timeOverlaps
};
