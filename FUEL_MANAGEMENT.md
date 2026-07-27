# Fuel Management

## Purpose
Fleet managers record fuel fills, vendor, litres, price, distance, odometer, total cost, and efficiency.

## Data
Model: `backend/models/FuelRecord.js`

Efficiency is calculated as distance divided by litres when fuel records are created.

## APIs
- `GET /api/fuel`
- `POST /api/fuel`

## Screen
`/fuel`
