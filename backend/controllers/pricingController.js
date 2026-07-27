const FareRule = require('../models/FareRule');
const FareVersion = require('../models/FareVersion');
const PriceApproval = require('../models/PriceApproval');
const Coupon = require('../models/Coupon');
const Route = require('../models/Route');
const AuditLog = require('../models/AuditLog');
const { calculateFare, validateCoupon } = require('../services/pricingService');
const { resolveOrganizationId } = require('../utils/defaultOrganization');

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

exports.listPricing = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const rules = await FareRule.find({ organizationId }).sort({ createdAt: -1 }).populate('routeId', 'from to fare').lean();
  res.json({ rules });
};

exports.createPricing = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const rule = await FareRule.create({
    organizationId,
    name: req.body.name,
    description: req.body.description,
    routeId: req.body.routeId || null,
    passengerType: req.body.passengerType || 'any',
    ruleType: req.body.ruleType,
    value: asNumber(req.body.value),
    minFare: asNumber(req.body.minFare),
    maxFare: req.body.maxFare == null || req.body.maxFare === '' ? null : asNumber(req.body.maxFare),
    priority: asNumber(req.body.priority, 100),
    effectiveFrom: req.body.effectiveFrom || new Date(),
    effectiveTo: req.body.effectiveTo || null,
    reason: req.body.reason || null,
    createdBy: req.user._id
  });
  await FareVersion.create({ organizationId, fareRuleId: rule._id, version: rule.version, action: 'created', snapshot: rule.toObject(), actorId: req.user._id });
  await PriceApproval.create({ organizationId, fareRuleId: rule._id, requestedBy: req.user._id, reason: req.body.reason || null });
  await AuditLog.create({ organizationId, actorId: req.user._id, action: 'pricing_rule_created', targetType: 'FareRule', targetId: rule._id, after: rule.toObject() });
  res.status(201).json({ rule });
};

exports.updatePricing = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const before = await FareRule.findOne({ _id: req.params.id, organizationId });
  if (!before) return res.status(404).json({ error: 'Pricing rule not found' });
  const update = {
    ...req.body,
    updatedBy: req.user._id,
    approvalStatus: 'pending',
    status: req.body.status || before.status,
    version: before.version + 1
  };
  const rule = await FareRule.findByIdAndUpdate(before._id, update, { new: true, runValidators: true });
  await FareVersion.create({ organizationId, fareRuleId: rule._id, version: rule.version, action: 'updated', snapshot: rule.toObject(), actorId: req.user._id });
  await PriceApproval.create({ organizationId, fareRuleId: rule._id, requestedBy: req.user._id, reason: req.body.reason || null });
  res.json({ rule });
};

exports.publishPricing = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const rule = await FareRule.findOneAndUpdate(
    { _id: req.params.id, organizationId },
    { status: 'published', approvalStatus: 'approved', publishedBy: req.user._id, publishedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!rule) return res.status(404).json({ error: 'Pricing rule not found' });
  await PriceApproval.findOneAndUpdate({ organizationId, fareRuleId: rule._id, status: 'pending' }, { status: 'approved', approvedBy: req.user._id, decidedAt: new Date() });
  await FareVersion.create({ organizationId, fareRuleId: rule._id, version: rule.version, action: 'published', snapshot: rule.toObject(), actorId: req.user._id });
  await AuditLog.create({ organizationId, actorId: req.user._id, action: 'pricing_rule_activated', targetType: 'FareRule', targetId: rule._id, after: rule.toObject() });
  res.json({ rule });
};

exports.history = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const history = await FareVersion.find({ organizationId }).sort({ createdAt: -1 }).limit(200).populate('actorId', 'name email role').lean();
  const approvals = await PriceApproval.find({ organizationId }).sort({ createdAt: -1 }).limit(100).populate('requestedBy approvedBy', 'name email role').lean();
  res.json({ history, approvals });
};

exports.simulate = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const route = req.body.routeId
    ? await Route.findOne({ _id: req.body.routeId, organizationId }).lean()
    : null;
  const baseFare = route?.fare ?? asNumber(req.body.baseFare, 20);
  const result = await calculateFare({
    organizationId,
    baseFare,
    routeId: route?._id || req.body.routeId || null,
    passengerType: req.body.passengerType || 'adult',
    couponCode: req.body.couponCode || null,
    userId: req.user._id,
    count: asNumber(req.body.count, 1)
  });
  res.json({ ...result, route });
};

exports.listCoupons = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const coupons = await Coupon.find({ organizationId }).sort({ createdAt: -1 }).populate('routeId', 'from to').lean();
  res.json({ coupons });
};

exports.createCoupon = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const coupon = await Coupon.create({
    organizationId,
    code: req.body.code,
    name: req.body.name,
    description: req.body.description || null,
    discountType: req.body.discountType,
    discountValue: asNumber(req.body.discountValue),
    maxDiscount: req.body.maxDiscount == null || req.body.maxDiscount === '' ? null : asNumber(req.body.maxDiscount),
    minFare: asNumber(req.body.minFare),
    minBookingAmount: asNumber(req.body.minBookingAmount),
    routeId: req.body.routeId || null,
    passengerTypes: req.body.passengerTypes || [],
    usageLimit: req.body.usageLimit || null,
    perUserLimit: req.body.perUserLimit || 1,
    startsAt: req.body.startsAt || new Date(),
    expiresAt: req.body.expiresAt || null,
    status: req.body.status || 'active',
    createdBy: req.user._id
  });
  res.status(201).json({ coupon });
};

exports.getCoupon = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const coupon = await Coupon.findOne({ _id: req.params.id, organizationId }).lean();
  if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
  res.json({ coupon });
};

exports.validateCoupon = async (req, res) => {
  const organizationId = await resolveOrganizationId(req.user);
  const result = await validateCoupon({
    organizationId,
    code: req.body.code,
    routeId: req.body.routeId || null,
    passengerType: req.body.passengerType || 'adult',
    subtotal: asNumber(req.body.subtotal)
  });
  res.json(result);
};
