import type { AppUser } from './api';

export type AppRole = AppUser['role'];

const scannerRoles: AppRole[] = ['admin', 'conductor', 'org_owner', 'org_admin', 'super_admin'];
const fareRoles: AppRole[] = [
  'admin',
  'fare_manager',
  'price_manager',
  'org_owner',
  'org_admin',
  'super_admin'
];
const staffRoles: AppRole[] = [
  ...scannerRoles,
  ...fareRoles,
  'operations_manager',
  'fleet_manager',
  'finance_manager',
  'dispatcher',
  'scheduler',
  'bus_manager',
  'driver',
  'support'
];
const organizationManagerRoles: AppRole[] = ['org_owner', 'org_admin', 'super_admin'];
const customerRoles: AppRole[] = ['customer', 'user'];
const operationsRoles: AppRole[] = [
  'super_admin',
  'org_owner',
  'org_admin',
  'operations_manager',
  'fleet_manager',
  'dispatcher',
  'scheduler',
  'bus_manager'
];
const tripCrewRoles: AppRole[] = [...operationsRoles, 'driver', 'conductor', 'admin'];
const financeRoles: AppRole[] = ['super_admin', 'org_owner', 'org_admin', 'finance_manager'];
const postManagerRoles: AppRole[] = ['super_admin', 'org_owner', 'org_admin', 'admin'];
const postReaderRoles: AppRole[] = [
  ...postManagerRoles,
  'operations_manager',
  'fleet_manager',
  'dispatcher',
  'scheduler',
  'bus_manager',
  'finance_manager',
  'price_manager',
  'fare_manager',
  'driver',
  'conductor',
  'support',
  ...customerRoles
];

export function isScannerRole(role: AppRole | null): boolean {
  return Boolean(role && scannerRoles.includes(role));
}

export function isFareManagerRole(role: AppRole | null): boolean {
  return Boolean(role && fareRoles.includes(role));
}

export function isStaffRole(role: AppRole | null): boolean {
  return Boolean(role && staffRoles.includes(role));
}

export function isOrganizationManagerRole(role: AppRole | null): boolean {
  return Boolean(role && organizationManagerRoles.includes(role));
}

export function isCustomerRole(role: AppRole | null): boolean {
  return Boolean(role && customerRoles.includes(role));
}

export function isPostManagerRole(role: AppRole | null): boolean {
  return Boolean(role && postManagerRoles.includes(role));
}

export const roleDashboard: Record<string, string> = {
  super_admin: '/super-admin',
  org_owner: '/organization',
  org_admin: '/organization',
  operations_manager: '/operations',
  fleet_manager: '/fleet',
  dispatcher: '/dispatcher',
  scheduler: '/schedules',
  bus_manager: '/fleet',
  finance_manager: '/finance',
  price_manager: '/pricing',
  fare_manager: '/pricing',
  driver: '/driver',
  conductor: '/conductor',
  admin: '/conductor',
  support: '/support',
  customer: '/customer',
  user: '/customer'
};

export function dashboardForRole(role: AppRole | null): string {
  return role ? roleDashboard[role] || '/register' : '/register';
}

const accessRules: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/super-admin/, roles: ['super_admin'] },
  { pattern: /^\/organization|^\/organizations/, roles: ['super_admin', 'org_owner', 'org_admin'] },
  { pattern: /^\/my-trips/, roles: [...customerRoles] },
  { pattern: /^\/trip-status/, roles: [...tripCrewRoles, ...customerRoles] },
  { pattern: /^\/track/, roles: [...tripCrewRoles] },
  { pattern: /^\/boarding/, roles: ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'dispatcher', 'conductor', 'admin'] },
  { pattern: /^\/operations|^\/fleet|^\/dispatcher|^\/trips|^\/calendar|^\/buses|^\/drivers|^\/conductors|^\/schedules|^\/assignments|^\/maintenance|^\/fuel|^\/leave|^\/incidents/, roles: [...operationsRoles, 'driver', 'conductor', 'admin'] },
  { pattern: /^\/finance|^\/payments|^\/reports|^\/audit/, roles: [...financeRoles, 'operations_manager', 'fleet_manager', 'dispatcher', 'support'] },
  { pattern: /^\/pricing|^\/admin\/pricing|^\/admin\/coupons|^\/admin\/fares/, roles: ['super_admin', 'org_owner', 'org_admin', 'price_manager', 'fare_manager', 'fleet_manager', 'operations_manager'] },
  { pattern: /^\/driver/, roles: ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'dispatcher', 'driver'] },
  { pattern: /^\/conductor|^\/admin|^\/scanner/, roles: ['super_admin', 'org_owner', 'org_admin', 'operations_manager', 'fleet_manager', 'dispatcher', 'conductor', 'admin'] },
  { pattern: /^\/support/, roles: ['super_admin', 'org_owner', 'org_admin', 'support', 'customer', 'driver', 'conductor'] },
  { pattern: /^\/posts\/new/, roles: [...postManagerRoles] },
  { pattern: /^\/posts/, roles: [...postReaderRoles] },
  { pattern: /^\/customer|^\/booking|^\/bookings|^\/tickets|^\/wallet|^\/notifications|^\/profile|^\/settings|^\/search/, roles: ['super_admin', ...customerRoles] },
  { pattern: /^\/generate|^\/refunds/, roles: ['super_admin', 'org_owner', 'org_admin', 'finance_manager'] }
];

export function canAccessPath(role: AppRole | null, pathname: string): boolean {
  if (role === 'super_admin') return true;
  const rule = accessRules.find((item) => item.pattern.test(pathname));
  if (!rule) return true;
  return Boolean(role && rule.roles.includes(role));
}

export function navForRole(role: AppRole | null): { href: string; label: string }[] {
  if (role === 'super_admin') {
    return [
      { href: '/super-admin', label: 'Platform' },
      { href: '/organization', label: 'Organizations' },
      { href: '/organization/users', label: 'Users' },
      { href: '/operations', label: 'Operations' },
      { href: '/dispatcher', label: 'Dispatch' },
      { href: '/trips', label: 'Trips' },
      { href: '/buses', label: 'Fleet' },
      { href: '/maintenance', label: 'Maintenance' },
      { href: '/calendar', label: 'Calendar' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/finance', label: 'Finance' },
      { href: '/reports', label: 'Reports' },
      { href: '/posts', label: 'Posts' },
      { href: '/support', label: 'Support' },
      { href: '/settings', label: 'Settings' }
    ];
  }
  if (role === 'org_owner' || role === 'org_admin') {
    return [
      { href: '/organization', label: 'Organization' },
      { href: '/organization/users', label: 'Users' },
      { href: '/operations', label: 'Fleet' },
      { href: '/dispatcher', label: 'Dispatch' },
      { href: '/trips', label: 'Trips' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/finance', label: 'Finance' },
      { href: '/reports', label: 'Reports' },
      { href: '/posts', label: 'Posts' },
      { href: '/support', label: 'Support' },
      { href: '/audit', label: 'Audit Logs' },
      { href: '/settings', label: 'Settings' }
    ];
  }
  if (['operations_manager', 'fleet_manager', 'dispatcher', 'scheduler', 'bus_manager'].includes(String(role))) {
    if (role === 'fleet_manager' || role === 'bus_manager') {
      return [
        { href: '/fleet', label: 'Dashboard' },
        { href: '/buses', label: 'Buses' },
        { href: '/drivers', label: 'Drivers' },
        { href: '/conductors', label: 'Conductors' },
        { href: '/admin/fares', label: 'Routes' },
        { href: '/schedules', label: 'Schedules' },
        { href: '/maintenance', label: 'Maintenance' },
        { href: '/fuel', label: 'Fuel' },
        { href: '/calendar', label: 'Calendar' },
        { href: '/incidents', label: 'Incidents' },
        { href: '/reports/fleet', label: 'Reports' }
      ];
    }
    if (role === 'dispatcher') {
      return [
        { href: '/dispatcher', label: 'Dashboard' },
        { href: '/trips', label: 'Trips' },
        { href: '/schedules', label: 'Schedules' },
        { href: '/calendar', label: 'Calendar' },
        { href: '/incidents', label: 'Incidents' },
        { href: '/leave', label: 'Leave' },
        { href: '/drivers', label: 'Drivers' },
        { href: '/conductors', label: 'Conductors' },
        { href: '/buses', label: 'Fleet' },
        { href: '/posts', label: 'Announcements' },
        { href: '/reports/fleet', label: 'Reports' }
      ];
    }
    return [
      { href: '/operations', label: 'Operations' },
      { href: '/dispatcher', label: 'Dispatch' },
      { href: '/trips', label: 'Trips' },
      { href: '/buses', label: 'Buses' },
      { href: '/drivers', label: 'Drivers' },
      { href: '/conductors', label: 'Conductors' },
      { href: '/schedules', label: 'Schedules' },
      { href: '/calendar', label: 'Calendar' },
      { href: '/incidents', label: 'Incidents' },
      { href: '/posts', label: 'Announcements' },
      { href: '/reports', label: 'Reports' }
    ];
  }
  if (role === 'finance_manager') {
    return [
      { href: '/finance', label: 'Revenue' },
      { href: '/payments', label: 'Payments' },
      { href: '/refunds', label: 'Refunds' },
      { href: '/wallet/transactions', label: 'Wallet' },
      { href: '/reports', label: 'Reports' }
    ];
  }
  if (role === 'price_manager' || role === 'fare_manager') {
    return [
      { href: '/pricing', label: 'Pricing' },
      { href: '/admin/pricing/simulator', label: 'Simulator' },
      { href: '/admin/coupons', label: 'Coupons' },
      { href: '/admin/fares', label: 'Routes' }
    ];
  }
  if (role === 'conductor' || role === 'admin') {
    return [
      { href: '/conductor', label: 'Dashboard' },
      { href: '/admin', label: 'Scanner' },
      { href: '/trips', label: 'Trips' },
      { href: '/incidents', label: 'Incidents' },
      { href: '/tickets', label: 'Passengers' },
      { href: '/reports', label: 'Reports' },
      { href: '/notifications', label: 'Notifications' },
      { href: '/profile', label: 'Profile' }
    ];
  }
  if (role === 'driver') {
    return [
      { href: '/driver', label: 'Dashboard' },
      { href: '/trips', label: 'Trips' },
      { href: '/schedules', label: 'Schedule' },
      { href: '/incidents', label: 'Incidents' },
      { href: '/leave', label: 'Leave' },
      { href: '/posts', label: 'Announcements' },
      { href: '/support', label: 'Incident Reporting' },
      { href: '/notifications', label: 'Notifications' },
      { href: '/profile', label: 'Profile' }
    ];
  }
  if (role === 'support') {
    return [
      { href: '/support', label: 'Support' },
      { href: '/posts', label: 'Posts' },
      { href: '/notifications', label: 'Notifications' }
    ];
  }
  return [
    { href: '/customer', label: 'Home' },
    { href: '/booking', label: 'Book' },
    { href: '/my-trips', label: 'My Trips' },
    { href: '/bookings', label: 'Bookings' },
    { href: '/wallet', label: 'Wallet' },
    { href: '/tickets', label: 'Tickets' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/posts', label: 'Offers' },
    { href: '/support', label: 'Support' },
    { href: '/profile', label: 'Profile' }
  ];
}
