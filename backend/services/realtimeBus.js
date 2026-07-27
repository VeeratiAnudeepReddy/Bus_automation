const clients = new Map();

function keyFor(organizationId) {
  return String(organizationId || 'global');
}

function addClient(organizationId, res) {
  const key = keyFor(organizationId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
  res.on('close', () => {
    clients.get(key)?.delete(res);
  });
}

function publish(organizationId, type, payload) {
  const event = { type, payload, timestamp: new Date().toISOString() };
  const body = `event: ${type}\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of clients.get(keyFor(organizationId)) || []) {
    res.write(body);
  }
}

module.exports = { addClient, publish };
