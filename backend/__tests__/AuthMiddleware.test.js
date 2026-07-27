const { requireClerkAuth } = require('../middleware/clerkJwt');
const { loadUser, requireAuth } = require('../middleware/authMiddleware');
const User = require('../models/User');

jest.mock('../models/User');

function mockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('authentication middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('requireAuth composes Clerk JWT verification and user loading', () => {
    expect(Array.isArray(requireAuth)).toBe(true);
    expect(requireAuth).toHaveLength(2);
  });

  test('requireClerkAuth rejects requests without bearer token', async () => {
    const req = { header: jest.fn().mockReturnValue(undefined) };
    const res = mockResponse();
    const next = jest.fn();

    await requireClerkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('requireClerkAuth rejects malformed bearer token', async () => {
    const req = { header: jest.fn().mockReturnValue('Bearer not-a-jwt') };
    const res = mockResponse();
    const next = jest.fn();

    await requireClerkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid authentication token' });
    expect(next).not.toHaveBeenCalled();
  });

  test('loadUser rejects request without verified Clerk auth', async () => {
    const req = {};
    const res = mockResponse();
    const next = jest.fn();

    await loadUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing authenticated Clerk user' });
    expect(next).not.toHaveBeenCalled();
  });

  test('loadUser attaches matching Mongo user', async () => {
    const appUser = {
      _id: 'user-id',
      clerkUserId: 'clerk-user-id',
      email: 'user@example.com',
      role: 'customer'
    };
    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(appUser)
    });

    const req = { auth: { userId: 'clerk-user-id' } };
    const res = mockResponse();
    const next = jest.fn();

    await loadUser(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ clerkUserId: 'clerk-user-id' });
    expect(req.user).toEqual(appUser);
    expect(next).toHaveBeenCalled();
  });
});
