const Coupon = require('../models/Coupon');
const FareRule = require('../models/FareRule');

const clampFare = (value, minFare = 0, maxFare = null) => {
  const minApplied = Math.max(Number(value) || 0, Number(minFare) || 0);
  return maxFare == null ? minApplied : Math.min(minApplied, Number(maxFare));
};

const ruleApplies = (rule, { routeId, passengerType, now }) => {
  if (rule.routeId && routeId && String(rule.routeId) !== String(routeId)) return false;
  if (rule.routeId && !routeId) return false;
  if (rule.passengerType !== 'any' && rule.passengerType !== passengerType) return false;
  if (rule.effectiveFrom && new Date(rule.effectiveFrom) > now) return false;
  if (rule.effectiveTo && new Date(rule.effectiveTo) < now) return false;
  return rule.status === 'published' && rule.approvalStatus === 'approved';
};

const applyRule = (fare, rule) => {
  if (rule.ruleType === 'flat_fare') return clampFare(rule.value, rule.minFare, rule.maxFare);
  if (rule.ruleType === 'percentage_adjustment') {
    return clampFare(fare + fare * (rule.value / 100), rule.minFare, rule.maxFare);
  }
  if (rule.ruleType === 'fixed_discount') {
    return clampFare(fare - rule.value, rule.minFare, rule.maxFare);
  }
  if (rule.ruleType === 'surge_multiplier') {
    return clampFare(fare * rule.value, rule.minFare, rule.maxFare);
  }
  return fare;
};

async function calculateFare({
  organizationId,
  baseFare,
  routeId = null,
  passengerType = 'adult',
  couponCode = null,
  userId = null,
  count = 1
}) {
  const now = new Date();
  const rules = await FareRule.find({ organizationId })
    .sort({ priority: 1, createdAt: 1 })
    .lean();

  let fare = Number(baseFare) || 0;
  const appliedRules = [];

  for (const rule of rules) {
    if (!ruleApplies(rule, { routeId, passengerType, now })) continue;
    const before = fare;
    fare = applyRule(fare, rule);
    appliedRules.push({ ruleId: rule._id, name: rule.name, before, after: fare });
  }

  fare = Math.round(fare * 100) / 100;
  let discount = 0;
  let coupon = null;
  const subtotal = fare * count;

  if (couponCode) {
    const validation = await validateCoupon({
      organizationId,
      code: couponCode,
      routeId,
      passengerType,
      subtotal,
      userId
    });
    if (!validation.valid) {
      return { valid: false, error: validation.error, fare, totalAmount: subtotal, appliedRules };
    }
    coupon = validation.coupon;
    discount = validation.discount;
  }

  return {
    valid: true,
    fare,
    subtotal,
    discount,
    totalAmount: Math.max(0, Math.round((subtotal - discount) * 100) / 100),
    appliedRules,
    coupon: coupon ? { id: coupon._id, code: coupon.code, discount } : null
  };
}

async function validateCoupon({ organizationId, code, routeId = null, passengerType = 'adult', subtotal = 0 }) {
  const coupon = await Coupon.findOne({ organizationId, code: String(code || '').trim().toUpperCase() }).lean();
  const now = new Date();

  if (!coupon || coupon.status !== 'active') return { valid: false, error: 'Coupon is not active' };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return { valid: false, error: 'Coupon has not started' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, error: 'Coupon has expired' };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, error: 'Coupon usage limit reached' };
  if (coupon.routeId && routeId && String(coupon.routeId) !== String(routeId)) return { valid: false, error: 'Coupon is not valid for this route' };
  if (coupon.routeId && !routeId) return { valid: false, error: 'Coupon requires a route booking' };
  if (coupon.passengerTypes?.length && !coupon.passengerTypes.includes(passengerType)) {
    return { valid: false, error: 'Coupon is not valid for this passenger type' };
  }
  if (subtotal < coupon.minBookingAmount || subtotal < coupon.minFare) {
    return { valid: false, error: 'Booking amount is below coupon minimum' };
  }

  const rawDiscount = coupon.discountType === 'percentage'
    ? subtotal * (coupon.discountValue / 100)
    : coupon.discountValue;
  const capped = coupon.maxDiscount == null ? rawDiscount : Math.min(rawDiscount, coupon.maxDiscount);
  return { valid: true, coupon, discount: Math.round(Math.min(capped, subtotal) * 100) / 100 };
}

module.exports = {
  calculateFare,
  validateCoupon,
  applyRule
};
