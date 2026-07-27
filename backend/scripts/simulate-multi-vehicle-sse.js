#!/usr/bin/env node
/**
 * Simulate two concurrent vehicles publishing GPS via realtimeBus + optional API.
 * Verifies SSE clients receive distinct trip location events.
 */
require('dotenv').config();
const http = require('http');
const express = require('express');
const realtimeBus = require('../services/realtimeBus');

const orgId = process.env.ORG_ID || 'org_test_realtime';

async function main() {
  const app = express();
  app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: connected\ndata: ${JSON.stringify({ type: 'connected' })}\n\n`);
    realtimeBus.addClient(orgId, res);
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();

  const received = [];
  await new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/sse`, (res) => {
      res.setEncoding('utf8');
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk;
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';
        for (const part of parts) {
          const dataLine = part.split('\n').find((l) => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const event = JSON.parse(dataLine.slice(5).trim());
            if (event.type === 'location_updated') received.push(event);
            if (received.length >= 4) {
              res.destroy();
              resolve();
            }
          } catch { /* ignore */ }
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);

    setTimeout(() => {
      for (let i = 0; i < 2; i += 1) {
        const tripId = `trip_${i + 1}`;
        for (let step = 0; step < 2; step += 1) {
          realtimeBus.publish(orgId, 'location_updated', {
            trip: { _id: tripId, tripCode: `T-${i + 1}` },
            location: {
              latitude: 17.385 + i * 0.01 + step * 0.001,
              longitude: 78.4867 + i * 0.01 + step * 0.001,
              speed: 30 + i,
              heading: 90
            }
          });
        }
      }
    }, 100);

    setTimeout(() => reject(new Error('Timed out waiting for SSE events')), 3000);
  });

  const tripIds = new Set(received.map((e) => e.payload?.trip?._id));
  console.log('MULTI_VEHICLE_SSE_OK', {
    events: received.length,
    tripIds: [...tripIds],
    samples: received.map((e) => ({
      trip: e.payload.trip._id,
      lat: e.payload.location.latitude,
      lng: e.payload.location.longitude
    }))
  });
  if (tripIds.size < 2) throw new Error('Expected two distinct trip IDs on the stream');
  server.close();
}

main().catch((error) => {
  console.error('MULTI_VEHICLE_SSE_FAILED', error.message);
  process.exit(1);
});
