const express = require('express');
const router = express.Router();
const controller = require('../controllers/fleetOperationsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/operations/dashboard', requireAuth, controller.operationsDashboard);
router.get('/dispatcher/dashboard', requireAuth, controller.dispatcherDashboard);
router.get('/calendar', requireAuth, controller.calendar);
router.get('/realtime/events', requireAuth, controller.realtimeEvents);
router.post('/offline/sync', requireAuth, controller.syncOfflineQueue);

router.get('/buses/export', requireAuth, controller.exportBuses);
router.post('/buses/import', requireAuth, controller.importBuses);
router.get('/buses', requireAuth, controller.listBuses);
router.post('/buses', requireAuth, controller.createBus);
router.get('/buses/:id', requireAuth, controller.getBus);
router.patch('/buses/:id', requireAuth, controller.updateBus);
router.delete('/buses/:id', requireAuth, controller.deleteBus);
router.patch('/buses/:id/status', requireAuth, controller.updateBusStatus);
router.patch('/buses/:id/maintenance', requireAuth, controller.updateBusMaintenance);
router.get('/buses/:id/history', requireAuth, controller.busHistory);

router.get('/drivers', requireAuth, controller.listDrivers);
router.post('/drivers', requireAuth, controller.createDriver);
router.patch('/drivers/:id', requireAuth, controller.updateDriver);
router.delete('/drivers/:id', requireAuth, controller.deleteDriver);
router.post('/drivers/:id/assign-bus', requireAuth, controller.assignDriverBus);

router.get('/conductors', requireAuth, controller.listConductors);
router.post('/conductors', requireAuth, controller.createConductor);
router.patch('/conductors/:id', requireAuth, controller.updateConductor);
router.delete('/conductors/:id', requireAuth, controller.deleteConductor);
router.post('/conductors/:id/assign-bus', requireAuth, controller.assignConductorBus);

router.get('/routes/:routeId/stops', requireAuth, controller.listStops);
router.post('/routes/:routeId/stops', requireAuth, controller.createStop);
router.patch('/routes/:routeId/stops/:stopId', requireAuth, controller.updateStop);
router.delete('/routes/:routeId/stops/:stopId', requireAuth, controller.deleteStop);
router.post('/routes/:id/assignments', requireAuth, controller.assignRoute);
router.post('/routes/:id/optimize', requireAuth, controller.optimizeRoute);
router.post('/routes/:id/clone', requireAuth, controller.cloneRoute);
router.post('/routes/:id/deactivate', requireAuth, controller.deactivateRoute);

router.get('/schedules', requireAuth, controller.listSchedules);
router.post('/schedules', requireAuth, controller.createSchedule);
router.patch('/schedules/:id', requireAuth, controller.updateSchedule);
router.delete('/schedules/:id', requireAuth, controller.deleteSchedule);
router.post('/schedules/conflicts', requireAuth, controller.detectConflicts);

router.get('/trips', requireAuth, controller.listTrips);
router.post('/trips', requireAuth, controller.createTrip);
router.patch('/trips/:id/status', requireAuth, controller.updateTripStatus);
router.post('/trips/:id/actions', requireAuth, controller.tripAction);
router.post('/trips/:id/location', requireAuth, controller.updateTripLocation);
router.get('/trips/:id/location', requireAuth, controller.getTripLocation);
router.get('/trips/:id/history', requireAuth, controller.getTripHistory);
router.get('/trip-status/:id', requireAuth, controller.passengerTripStatus);

router.get('/maintenance', requireAuth, controller.listMaintenance);
router.post('/maintenance', requireAuth, controller.createMaintenance);
router.patch('/maintenance/:id', requireAuth, controller.updateMaintenance);

router.get('/fuel', requireAuth, controller.listFuel);
router.post('/fuel', requireAuth, controller.createFuel);

router.get('/leave', requireAuth, controller.listLeave);
router.post('/leave', requireAuth, controller.requestLeave);
router.patch('/leave/:id/review', requireAuth, controller.reviewLeave);

router.get('/incidents', requireAuth, controller.listIncidents);
router.post('/incidents', requireAuth, controller.createIncident);
router.patch('/incidents/:id', requireAuth, controller.updateIncident);

module.exports = router;
