# Incident Management

## Purpose
Drivers, conductors, dispatchers, fleet managers, support, and operations managers can track operational incidents.

## Incident Types
- breakdown
- traffic
- accident
- medical
- passenger
- vehicle
- other

## Data
Model: `backend/models/Incident.js`

## APIs
- `GET /api/incidents`
- `POST /api/incidents`
- `PATCH /api/incidents/:id`

## Notifications
Incident creation sends in-app role notifications to dispatcher, fleet manager, operations manager, and organization admin roles.
