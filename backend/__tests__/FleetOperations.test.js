const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const DriverProfile = require('../models/DriverProfile');
const ConductorProfile = require('../models/ConductorProfile');
const Stop = require('../models/Stop');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Trip = require('../models/Trip');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const FuelRecord = require('../models/FuelRecord');
const GPSLocation = require('../models/GPSLocation');
const LeaveRequest = require('../models/LeaveRequest');
const Incident = require('../models/Incident');
const OfflineQueue = require('../models/OfflineQueue');
const TripEvent = require('../models/TripEvent');
const { timeOverlaps, normalizeDays } = require('../services/assignmentService');

describe('Fleet operations models', () => {
  const organizationId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  test('Bus model requires organization, bus number, registration, and capacity', async () => {
    const bus = new Bus({
      organizationId,
      busNumber: 'HYD-101',
      registrationNumber: 'TS09AB1234',
      capacity: 42
    });

    await expect(bus.validate()).resolves.toBeUndefined();
    expect(bus.status).toBe('active');
    expect(bus.maintenanceStatus).toBe('ok');
  });

  test('Driver and conductor profiles validate assignment fields', async () => {
    const driver = new DriverProfile({
      organizationId,
      userId,
      licenseNumber: 'DL123',
      expiryDate: new Date(Date.now() + 86400000)
    });
    const conductor = new ConductorProfile({
      organizationId,
      userId: new mongoose.Types.ObjectId(),
      employeeId: 'COND-1'
    });

    await expect(driver.validate()).resolves.toBeUndefined();
    await expect(conductor.validate()).resolves.toBeUndefined();
  });

  test('Stop and Schedule models enforce route and assignment relationships', async () => {
    const routeId = new mongoose.Types.ObjectId();
    const stop = new Stop({
      organizationId,
      routeId,
      name: 'Ameerpet',
      latitude: 17.4375,
      longitude: 78.4483,
      order: 1
    });
    const schedule = new Schedule({
      organizationId,
      routeId,
      busId: new mongoose.Types.ObjectId(),
      driverId: new mongoose.Types.ObjectId(),
      conductorId: new mongoose.Types.ObjectId(),
      departureTime: '08:00',
      arrivalTime: '09:00',
      days: ['mon', 'tue'],
      tripNumber: 'TRIP-1',
      effectiveFrom: new Date()
    });

    await expect(stop.validate()).resolves.toBeUndefined();
    await expect(schedule.validate()).resolves.toBeUndefined();
  });

  test('Route model supports fleet operations extensions', () => {
    expect(Route.schema.path('routeCode')).toBeDefined();
    expect(Route.schema.path('assignedBus')).toBeDefined();
    expect(Route.schema.path('assignedDriver')).toBeDefined();
    expect(Route.schema.path('assignedConductor')).toBeDefined();
  });

  test('assignment helper detects overlapping times and normalizes days', () => {
    expect(timeOverlaps('08:00', '09:00', '08:30', '10:00')).toBe(true);
    expect(timeOverlaps('08:00', '09:00', '09:00', '10:00')).toBe(false);
    expect(normalizeDays(['wed', 'mon', 'mon'])).toEqual(['mon', 'wed']);
  });

  test('Sprint 6 trip, maintenance, fuel, leave, and incident records validate', async () => {
    const busId = new mongoose.Types.ObjectId();
    const driverId = new mongoose.Types.ObjectId();
    const conductorId = new mongoose.Types.ObjectId();
    const routeId = new mongoose.Types.ObjectId();
    const scheduleId = new mongoose.Types.ObjectId();
    const trip = new Trip({
      organizationId,
      scheduleId,
      routeId,
      busId,
      driverId,
      conductorId,
      tripCode: 'TRIP-OPS-1',
      serviceDate: new Date(),
      plannedDeparture: '08:00',
      plannedArrival: '09:30'
    });
    const maintenance = new MaintenanceRecord({
      organizationId,
      busId,
      title: 'Preventive service',
      type: 'preventive',
      scheduledFor: new Date()
    });
    const fuel = new FuelRecord({
      organizationId,
      busId,
      litres: 40,
      pricePerLitre: 95,
      totalCost: 3800
    });
    const leave = new LeaveRequest({
      organizationId,
      userId,
      profileType: 'driver',
      profileId: driverId,
      fromDate: new Date(),
      toDate: new Date(),
      reason: 'Medical leave'
    });
    const incident = new Incident({
      organizationId,
      reportedBy: userId,
      type: 'breakdown',
      title: 'Engine overheating'
    });

    await expect(trip.validate()).resolves.toBeUndefined();
    await expect(maintenance.validate()).resolves.toBeUndefined();
    await expect(fuel.validate()).resolves.toBeUndefined();
    await expect(leave.validate()).resolves.toBeUndefined();
    await expect(incident.validate()).resolves.toBeUndefined();
    expect(trip.status).toBe('scheduled');
    expect(maintenance.status).toBe('open');
    expect(leave.status).toBe('pending');
    expect(incident.status).toBe('open');
  });

  test('Sprint 7 live operations records validate', async () => {
    const tripId = new mongoose.Types.ObjectId();
    const gps = new GPSLocation({
      organizationId,
      tripId,
      latitude: 17.385,
      longitude: 78.4867,
      speed: 24,
      heading: 90,
      deviceInfo: 'test-device'
    });
    const event = new TripEvent({
      organizationId,
      tripId,
      actorId: userId,
      type: 'location_updated',
      message: 'Heartbeat received'
    });
    const offline = new OfflineQueue({
      organizationId,
      userId,
      entityType: 'location',
      entityId: tripId,
      action: 'location_update',
      payload: { latitude: 17.385, longitude: 78.4867 }
    });

    await expect(gps.validate()).resolves.toBeUndefined();
    await expect(event.validate()).resolves.toBeUndefined();
    await expect(offline.validate()).resolves.toBeUndefined();
    expect(offline.status).toBe('pending');
  });
});
