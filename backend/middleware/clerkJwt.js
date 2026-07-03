const crypto = require('crypto');

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;
const jwksCache = new Map();

function base64UrlDecode(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function parseBearerToken(req) {
  const header = req.header('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }
  return token;
}

function decodeJwt(token) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Malformed JWT');
  }

  return {
    encodedHeader,
    encodedPayload,
    signature,
    header: JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')),
    payload: JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'))
  };
}

function getJwksUrl(issuer) {
  if (process.env.CLERK_JWKS_URL) {
    return process.env.CLERK_JWKS_URL;
  }

  if (!issuer || !issuer.startsWith('https://')) {
    throw new Error('Invalid Clerk token issuer');
  }

  return `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
}

async function fetchJwks(issuer) {
  const jwksUrl = getJwksUrl(issuer);
  const cached = jwksCache.get(jwksUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.keys;
  }

  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Unable to fetch Clerk JWKS: ${response.status}`);
  }

  const body = await response.json();
  const keys = Array.isArray(body.keys) ? body.keys : [];
  jwksCache.set(jwksUrl, {
    keys,
    expiresAt: Date.now() + JWKS_CACHE_TTL_MS
  });
  return keys;
}

function verifyJwtSignature(decoded, jwk, token) {
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${decoded.encodedHeader}.${decoded.encodedPayload}`);
  verifier.end();
  return verifier.verify(publicKey, base64UrlDecode(decoded.signature));
}

function assertJwtClaims(payload) {
  const now = Math.floor(Date.now() / 1000);
  if (!payload.sub) {
    throw new Error('Missing Clerk subject');
  }
  if (payload.exp && payload.exp <= now) {
    throw new Error('Clerk token expired');
  }
  if (payload.nbf && payload.nbf > now) {
    throw new Error('Clerk token not active yet');
  }
  if (process.env.CLERK_JWT_AUDIENCE) {
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(process.env.CLERK_JWT_AUDIENCE)) {
      throw new Error('Invalid Clerk token audience');
    }
  }
}

async function verifyClerkToken(token) {
  const decoded = decodeJwt(token);
  if (decoded.header.alg !== 'RS256') {
    throw new Error('Unsupported Clerk JWT algorithm');
  }

  const keys = await fetchJwks(decoded.payload.iss);
  const jwk = keys.find((key) => key.kid === decoded.header.kid);
  if (!jwk) {
    jwksCache.clear();
    throw new Error('Clerk signing key not found');
  }

  if (!verifyJwtSignature(decoded, jwk, token)) {
    throw new Error('Invalid Clerk JWT signature');
  }

  assertJwtClaims(decoded.payload);
  return decoded.payload;
}

exports.requireClerkAuth = async (req, res, next) => {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const payload = await verifyClerkToken(token);
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid || null,
      claims: payload
    };
    return next();
  } catch (error) {
    console.error('Clerk JWT verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

exports.verifyClerkToken = verifyClerkToken;
