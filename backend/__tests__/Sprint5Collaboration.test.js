const mongoose = require('mongoose');
const Post = require('../models/Post');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');

describe('Sprint 5 collaboration, notifications, and support foundations', () => {
  const organizationId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  test('Post model supports organization announcements with comments and likes', async () => {
    const post = new Post({
      organizationId,
      authorId: userId,
      title: 'Route update',
      body: 'Route 101 has a new timetable.',
      visibility: 'staff',
      priority: 'high',
      category: 'operations',
      tags: ['route', 'schedule'],
      comments: [{ authorId: userId, body: 'Acknowledged' }],
      likes: [userId]
    });

    await expect(post.validate()).resolves.toBeUndefined();
    expect(post.status).toBe('published');
    expect(post.comments).toHaveLength(1);
  });

  test('SupportTicket model supports SLA, replies, assignment, and escalation state', async () => {
    const ticket = new SupportTicket({
      organizationId,
      ticketNumber: 'SUP-1',
      requesterId: userId,
      title: 'Wallet issue',
      description: 'Recharge did not reflect.',
      priority: 'urgent',
      status: 'escalated',
      assignedTo: new mongoose.Types.ObjectId(),
      slaDueAt: new Date(Date.now() + 3600000),
      replies: [{ authorId: userId, body: 'We are checking this.' }]
    });

    await expect(ticket.validate()).resolves.toBeUndefined();
    expect(ticket.status).toBe('escalated');
    expect(ticket.replies).toHaveLength(1);
  });

  test('Notification model supports Sprint 5 categories through existing enum', async () => {
    const notification = new Notification({
      organizationId,
      userId,
      title: 'Support reply',
      message: 'Your support ticket has a new reply.',
      category: 'announcement',
      audience: 'user'
    });

    await expect(notification.validate()).resolves.toBeUndefined();
    expect(notification.readAt).toBeNull();
  });
});
