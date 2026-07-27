import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const api = axios.create({ baseURL: API_BASE_URL });

const authHeaders = (authToken: string) => ({
  headers: {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});

export type AppUser = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  clerkUserId: string;
  role:
    | 'user'
    | 'admin'
    | 'fare_manager'
    | 'customer'
    | 'conductor'
    | 'price_manager'
    | 'super_admin'
    | 'org_owner'
    | 'org_admin'
    | 'operations_manager'
    | 'fleet_manager'
    | 'finance_manager'
    | 'dispatcher'
    | 'scheduler'
    | 'bus_manager'
    | 'driver'
    | 'support';
  balance: number;
  organizationId?: string;
  avatar?: string | null;
  employeeId?: string | null;
  designation?: string | null;
  department?: string | null;
  joiningDate?: string | null;
  lastLogin?: string | null;
  status?: UserStatus;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  notes?: string | null;
  emergencyContact?: { name?: string | null; phone?: string | null; relation?: string | null };
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
  };
  dateOfBirth?: string | null;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | null;
  language?: string;
  timezone?: string;
  preferences?: { theme?: 'system' | 'light' | 'dark'; compactMode?: boolean };
  notificationSettings?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    operations?: boolean;
    finance?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  profileComplete?: boolean;
};

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED' | 'ARCHIVED';

export type OrganizationItem = {
  _id: string;
  name: string;
  slug: string;
  city: string;
  status: 'pending' | 'active' | 'suspended' | 'archived';
  ownerUserId: string | { _id: string; name: string; email: string; role: string };
  billingContact?: { name?: string | null; email?: string | null; phone?: string | null };
  contact?: { email?: string | null; phone?: string | null; supportEmail?: string | null };
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    country?: string | null;
  };
  businessDetails?: {
    legalName?: string | null;
    gstNumber?: string | null;
    registrationNumber?: string | null;
    website?: string | null;
  };
  branding?: {
    logoUrl?: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  settings?: {
    timezone?: string;
    currency?: string;
    ticketPrefix?: string;
    allowPublicBooking?: boolean;
  };
  subscription?: {
    plan?: 'trial' | 'standard' | 'enterprise';
    status?: 'trialing' | 'active' | 'past_due' | 'cancelled';
    renewsAt?: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMember = Pick<AppUser, '_id' | 'name' | 'email' | 'phone' | 'role' | 'organizationId'> & {
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationInvite = {
  _id: string;
  email: string;
  role: AppUser['role'];
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string | null;
  acceptLink?: string;
  invitedBy?: { _id: string; name: string; email: string; role: string };
  acceptedBy?: { _id: string; name: string; email: string; role: string } | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type OrganizationDashboard = {
  organization: OrganizationItem;
  stats: {
    members: number;
    routes: number;
    activeRoutes: number;
    tickets: number;
    revenue: number;
    pendingInvites: number;
  };
  recentActivity: {
    _id: string;
    action: string;
    actorId?: { name?: string; email?: string; role?: string } | null;
    createdAt: string;
    metadata?: Record<string, unknown>;
  }[];
};

export type ManagedUser = Required<Pick<AppUser, '_id' | 'name' | 'email' | 'phone' | 'role'>> &
  Omit<AppUser, '_id' | 'name' | 'email' | 'phone' | 'role'> & {
    status: UserStatus;
    isActive: boolean;
    isDeleted: boolean;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
  };

export type UserActivityItem = {
  _id: string;
  action: string;
  actorId?: { _id: string; name?: string; email?: string; role?: string } | null;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type UserListParams = {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  designation?: string;
  active?: string;
  joiningFrom?: string;
  joiningTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  organizationId?: string;
};

export type StopItem = {
  name: string;
  coords: {
    lat: number;
    lng: number;
  };
};

export type RouteItem = {
  _id: string;
  from: string;
  to: string;
  fare: number;
  city: string;
  active: boolean;
  fromCoords: {
    lat: number;
    lng: number;
  };
  toCoords: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
  routeCode?: string | null;
  direction?: 'UP' | 'DOWN' | 'LOOP' | null;
  polyline?: string | null;
  distanceKm?: number;
  durationMinutes?: number;
  estimatedTime?: string | null;
  routeColor?: string;
  zone?: string | null;
  operatingDays?: string[];
  assignedBus?: string | null;
  assignedDriver?: string | null;
  assignedConductor?: string | null;
};

export type FleetDocument = {
  name: string;
  url?: string | null;
  number?: string | null;
  expiresAt?: string | null;
  status?: 'valid' | 'expiring' | 'expired' | 'missing';
};

export type BusItem = {
  _id: string;
  busNumber: string;
  registrationNumber: string;
  registrationState?: string;
  vehicleType: string;
  category: string;
  manufacturer?: string | null;
  model?: string | null;
  year?: number | null;
  capacity: number;
  standingCapacity?: number;
  fuelType: string;
  mileage?: number;
  gpsDeviceId?: string | null;
  currentOdometer?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'assigned' | 'retired';
  images?: string[];
  amenities?: string[];
  insurance?: FleetDocument;
  fitnessCertificate?: FleetDocument;
  pollutionCertificate?: FleetDocument;
  permit?: FleetDocument;
  roadTax?: FleetDocument;
  documents?: FleetDocument[];
  maintenanceStatus: 'ok' | 'due' | 'overdue' | 'in_service';
  nextServiceDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DriverProfile = {
  _id: string;
  userId: string | ManagedUser;
  licenseNumber: string;
  licenseType: string;
  expiryDate: string;
  experienceYears: number;
  bloodGroup?: string | null;
  assignedBus?: string | null;
  assignedRoutes?: string[];
  leaveBalance?: number;
  joiningDate?: string | null;
  status: 'available' | 'assigned' | 'on_leave' | 'suspended' | 'inactive';
  rating?: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConductorProfile = {
  _id: string;
  userId: string | ManagedUser;
  employeeId: string;
  assignedBus?: string | null;
  assignedRoutes?: string[];
  shift?: { name?: string; start?: string; end?: string };
  cashCollected?: number;
  ticketsValidated?: number;
  status: 'available' | 'assigned' | 'on_leave' | 'suspended' | 'inactive';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RouteStop = {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  arrivalTime?: string | null;
  departureTime?: string | null;
  fareStage?: number;
  landmark?: string | null;
  zone?: string | null;
  shelter?: boolean;
  active?: boolean;
};

export type ScheduleItem = {
  _id: string;
  routeId: string;
  busId: string;
  driverId: string;
  conductorId: string;
  departureTime: string;
  arrivalTime: string;
  days: string[];
  status: 'scheduled' | 'active' | 'cancelled' | 'completed';
  frequency: 'once' | 'daily' | 'weekly';
  tripNumber: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  notes?: string | null;
};

export type OperationsDashboard = {
  stats: {
    buses: number;
    activeBuses: number;
    maintenance: number;
    driversOnDuty: number;
    conductorsOnDuty: number;
    trips: number;
    runningTrips?: number;
    delayedTrips: number;
    cancelledTrips?: number;
    incidents?: number;
    revenuePlaceholder: number;
    fuelLitres?: number;
    fuelCost?: number;
    maintenanceCost?: number;
  };
  alerts: BusItem[];
  quickActions: string[];
};

export type TripItem = {
  _id: string;
  scheduleId: string;
  routeId: string;
  busId: string;
  driverId: string;
  conductorId: string;
  tripCode: string;
  serviceDate: string;
  plannedDeparture: string;
  plannedArrival: string;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  status: 'planned' | 'assigned' | 'scheduled' | 'preparing' | 'boarding' | 'active' | 'in_progress' | 'delayed' | 'paused' | 'completed' | 'cancelled' | 'emergency';
  liveLocation?: GPSLocation | null;
  distanceTravelledKm?: number;
  remainingDistanceKm?: number;
  estimatedArrival?: string | null;
  lastHeartbeatAt?: string | null;
  boardingOpen?: boolean;
  delayMinutes: number;
  cancellationReason?: string | null;
  occupancy: number;
  capacity: number;
  revenue: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GPSLocation = {
  _id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number;
  heading?: number;
  distanceTravelledKm?: number;
  remainingDistanceKm?: number;
  estimatedArrival?: string | null;
  deviceInfo?: string | null;
  recordedAt?: string;
};

export type TripEvent = {
  _id: string;
  tripId: string;
  type: string;
  message?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type MaintenanceRecord = {
  _id: string;
  busId: string;
  type: 'preventive' | 'breakdown' | 'tyre' | 'battery' | 'engine' | 'fitness' | 'insurance' | 'permit' | 'pollution' | 'other';
  status: 'open' | 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string | null;
  scheduledFor?: string | null;
  completedAt?: string | null;
  odometer?: number;
  cost?: number;
  vendor?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FuelRecord = {
  _id: string;
  busId: string;
  filledAt: string;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  odometer?: number;
  distanceKm?: number;
  efficiencyKmPerLitre?: number;
  vendor?: string | null;
  notes?: string | null;
};

export type LeaveRequest = {
  _id: string;
  userId: string;
  profileType: 'driver' | 'conductor';
  profileId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewNote?: string | null;
};

export type IncidentItem = {
  _id: string;
  tripId?: string | null;
  busId?: string | null;
  routeId?: string | null;
  type: 'breakdown' | 'traffic' | 'accident' | 'medical' | 'passenger' | 'vehicle' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  title: string;
  description?: string | null;
  location?: { lat?: number | null; lng?: number | null; label?: string | null };
  createdAt: string;
  updatedAt: string;
};

export type CalendarEvent = {
  _id: string;
  type: 'trip' | 'schedule' | 'maintenance' | 'leave' | 'incident';
  title: string;
  date: string;
  status: string;
};

export type DispatcherDashboard = {
  stats: {
    runningTrips: number;
    upcomingDepartures: number;
    activeBuses: number;
    driverAvailability: number;
    conductorAvailability: number;
    routeDelays: number;
    incidents: number;
    pendingLeave: number;
  };
  trips: TripItem[];
  buses: BusItem[];
  drivers: DriverProfile[];
  conductors: ConductorProfile[];
  incidents: IncidentItem[];
  leaveRequests: LeaveRequest[];
};

export type TicketItem = {
  ticketId: string;
  bookingId?: string | null;
  userId: string;
  routeId?: string | null;
  from?: string | null;
  to?: string | null;
  seatNumber?: string | null;
  passengerType?: 'adult' | 'child' | 'student' | 'senior' | 'staff';
  status: 'HELD' | 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  fare?: number;
  fromCoords?: { lat: number; lng: number } | null;
  toCoords?: { lat: number; lng: number } | null;
  createdAt: string;
  scannedAt: string | null;
  qrPayload: {
    ticketId: string;
    userId: string;
    timestamp: string;
    routeId?: string | null;
    from?: string | null;
    to?: string | null;
    fare?: number | null;
  };
  qr: string;
};

export type FareRuleItem = {
  _id: string;
  name: string;
  description?: string | null;
  routeId?: string | RouteItem | null;
  passengerType: 'adult' | 'child' | 'student' | 'senior' | 'staff' | 'any';
  ruleType: 'flat_fare' | 'percentage_adjustment' | 'fixed_discount' | 'surge_multiplier';
  value: number;
  minFare: number;
  maxFare?: number | null;
  priority: number;
  status: 'draft' | 'published' | 'archived';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type CouponItem = {
  _id: string;
  code: string;
  name: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  maxDiscount?: number | null;
  minBookingAmount?: number;
  status: 'draft' | 'active' | 'archived';
  usedCount: number;
  expiresAt?: string | null;
};

export type BookingSummary = {
  bookingId: string;
  tickets: TicketItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export type BookingRecovery = {
  bookingId: string;
  lifecycle: string | null;
  amount: number;
  expiresAt?: string | null;
  paymentStatus?: string | null;
  lockStatus: { seatNumber: string; status: string; paymentStatus: string; expiresAt: string }[];
  documents: { invoiceNumber?: string | null; receiptNumber?: string | null };
  tickets: TicketItem[];
  history: unknown[];
};

export type WalletTransactionItem = {
  _id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type PaymentItem = {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'created' | 'authorized' | 'captured' | 'failed' | 'cancelled' | 'expired' | 'refund_pending' | 'refunded' | 'partially_refunded' | 'chargeback' | 'disputed';
  bookingId?: string | null;
  receipt?: string | null;
  paymentMethod?: 'wallet' | 'gateway' | 'wallet_gateway';
  walletAmount?: number;
  gatewayAmount?: number;
  expiresAt?: string | null;
  createdAt: string;
};

export type RazorpayOrderResponse = {
  payment: PaymentItem;
  order: {
    id: string;
    order_id?: string;
    amount: number;
    currency: string;
    receipt?: string;
    bookingId?: string | null;
    organizationId?: string;
    expiry?: string | null;
  };
  keyId?: string | null;
};

export type FinanceDashboard = {
  stats: Record<string, number>;
  routeRevenue: Record<string, number>;
  topRoutes: [string, number][];
  recentPayments: PaymentItem[];
  financialLedger?: {
    totals: Record<string, number>;
    recentEntries: unknown[];
  };
};

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  category: string;
  channel: string;
  readAt?: string | null;
  createdAt: string;
};

export type PostItem = {
  _id: string;
  title: string;
  body: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  visibility: 'public' | 'organization' | 'roles' | 'staff';
  pinned: boolean;
  tags?: string[];
  likes?: string[];
  comments?: { _id: string; body: string; createdAt: string }[];
  createdAt: string;
};

export type SupportTicketItem = {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed' | 'escalated';
  createdAt: string;
};

export type ScanResult = {
  result: 'VALID' | 'INVALID' | 'REJECT';
  ticket?: {
    ticketId: string;
    userId: string;
    passengerName?: string;
    status: 'USED';
    scannedAt: string;
    createdAt: string;
  };
};

export const apiService = {
  getPlatformStatus: async (): Promise<{ needsSetup: boolean; organizations: number }> => {
    const response = await api.get('/auth/platform-status');
    return response.data;
  },

  getCurrentUser: async (
    authToken: string
  ): Promise<{ exists: boolean; needsSetup: boolean; user: AppUser | null }> => {
    const response = await api.get('/auth/me', authHeaders(authToken));
    return response.data;
  },

  syncUser: async (payload: {
    authToken: string;
    name: string;
    email: string;
    phone?: string;
  }): Promise<AppUser> => {
    const { authToken, ...body } = payload;
    const response = await api.post('/auth/sync', body, authHeaders(authToken));
    return response.data;
  },

  createCustomerAccount: async (payload: {
    authToken: string;
    name: string;
    email: string;
    phone?: string;
  }): Promise<AppUser> => {
    const { authToken, ...body } = payload;
    const response = await api.post('/auth/customer', body, authHeaders(authToken));
    return response.data;
  },

  completeFirstRunSetup: async (
    authToken: string,
    payload: Record<string, unknown>
  ): Promise<{ organization: OrganizationItem; user: AppUser; redirectTo: string }> => {
    const response = await api.post('/auth/setup', payload, authHeaders(authToken));
    return response.data;
  },

  createOwnerOrganization: async (
    authToken: string,
    payload: Record<string, unknown>
  ): Promise<{ organization: OrganizationItem; user: AppUser; redirectTo: string }> => {
    const response = await api.post('/auth/organization-owner', payload, authHeaders(authToken));
    return response.data;
  },

  validateInviteToken: async (
    token: string
  ): Promise<{ valid: boolean; invite: OrganizationInvite }> => {
    const response = await api.get(`/auth/invites/${token}`);
    return response.data;
  },

  acceptInviteToken: async (
    authToken: string,
    token: string,
    payload: Record<string, unknown>
  ): Promise<{ user: AppUser; redirectTo: string }> => {
    const response = await api.post(`/auth/invites/${token}/accept`, payload, authHeaders(authToken));
    return response.data;
  },

  completeProfile: async (authToken: string, payload: Record<string, unknown>): Promise<AppUser> => {
    const response = await api.patch('/auth/profile', payload, authHeaders(authToken));
    return response.data;
  },

  addBalance: async (authToken: string, amount: number): Promise<{ balance: number }> => {
    const response = await api.post('/wallet/add', { amount }, authHeaders(authToken));
    return response.data;
  },

  bookTickets: async (
    authToken: string,
    payload:
      | number
      | {
          count?: number;
          routeId?: string;
          from?: string;
          to?: string;
          fromCoords?: { lat: number; lng: number } | null;
          toCoords?: { lat: number; lng: number } | null;
        }
  ): Promise<{
    ticketPrice: number;
    count: number;
    totalAmount: number;
    balance: number;
    tickets: TicketItem[];
  }> => {
    const bookingPayload = typeof payload === 'number' ? { count: payload } : payload;
    const response = await api.post('/tickets/book', bookingPayload, authHeaders(authToken));
    return response.data;
  },

  getMyTickets: async (
    authToken: string
  ): Promise<{ balance: number; total: number; tickets: TicketItem[] }> => {
    const response = await api.get('/tickets/my', authHeaders(authToken));
    return response.data;
  },

  scanTicket: async (authToken: string, scannedData: string): Promise<ScanResult> => {
    const response = await api.post('/tickets/scan', { scannedData }, authHeaders(authToken));
    return response.data;
  },

  getAdminAnalytics: async (
    authToken: string
  ): Promise<{
    totalScannedTickets: number;
    dailyScannedStats: { _id: string; scanned: number }[];
  }> => {
    const response = await api.get('/admin/analytics', authHeaders(authToken));
    return response.data;
  },

  getRoutes: async (
    authToken: string,
    params?: { city?: string; from?: string; to?: string }
  ): Promise<{ city: string; routes: RouteItem[]; stops: StopItem[]; popularRoutes: RouteItem[] }> => {
    const response = await api.get('/routes', {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  getAdminRoutes: async (
    authToken: string,
    params?: { city?: string; search?: string; status?: 'all' | 'active' | 'inactive' }
  ): Promise<{ routes: RouteItem[] }> => {
    const response = await api.get('/admin/routes', {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  createAdminRoute: async (
    authToken: string,
    payload: {
      from: string;
      to: string;
      fare: number;
      city?: string;
      active?: boolean;
      fromCoords: { lat: number; lng: number };
      toCoords: { lat: number; lng: number };
    }
  ): Promise<RouteItem> => {
    const response = await api.post('/admin/routes/create', payload, authHeaders(authToken));
    return response.data;
  },

  updateAdminRoute: async (
    authToken: string,
    routeId: string,
    payload: Partial<{
      from: string;
      to: string;
      fare: number;
      city: string;
      active: boolean;
      fromCoords: { lat: number; lng: number };
      toCoords: { lat: number; lng: number };
    }>
  ): Promise<RouteItem> => {
    const response = await api.put(`/admin/routes/${routeId}`, payload, authHeaders(authToken));
    return response.data;
  },

  deleteAdminRoute: async (authToken: string, routeId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/admin/routes/${routeId}`, authHeaders(authToken));
    return response.data;
  },

  toggleAdminRoute: async (authToken: string, routeId: string): Promise<RouteItem> => {
    const response = await api.patch(`/admin/routes/${routeId}/toggle`, {}, authHeaders(authToken));
    return response.data;
  },

  getFareHistory: async (
    authToken: string,
    routeId?: string
  ): Promise<{
    history: {
      _id: string;
      route: { _id: string; from: string; to: string; city: string };
      previousFare: number;
      newFare: number;
      updatedBy: { _id: string; name: string; email: string; role: string };
      createdAt: string;
    }[];
  }> => {
    const response = await api.get('/admin/routes/fare-history', {
      ...authHeaders(authToken),
      params: routeId ? { routeId } : undefined
    });
    return response.data;
  },

  listOrganizations: async (
    authToken: string,
    params?: { search?: string; status?: string; page?: number; limit?: number }
  ): Promise<{ organizations: OrganizationItem[]; pagination: Pagination }> => {
    const response = await api.get('/organizations', {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  createOrganization: async (
    authToken: string,
    payload: Partial<OrganizationItem> & { name: string; slug: string }
  ): Promise<{ organization: OrganizationItem; message: string }> => {
    const response = await api.post('/organizations', payload, authHeaders(authToken));
    return response.data;
  },

  getOrganization: async (
    authToken: string,
    organizationId: string
  ): Promise<{ organization: OrganizationItem }> => {
    const response = await api.get(`/organizations/${organizationId}`, authHeaders(authToken));
    return response.data;
  },

  updateOrganization: async (
    authToken: string,
    organizationId: string,
    payload: Partial<OrganizationItem>
  ): Promise<{ organization: OrganizationItem }> => {
    const response = await api.patch(`/organizations/${organizationId}`, payload, authHeaders(authToken));
    return response.data;
  },

  archiveOrganization: async (
    authToken: string,
    organizationId: string
  ): Promise<{ message: string; organization: OrganizationItem }> => {
    const response = await api.delete(`/organizations/${organizationId}`, authHeaders(authToken));
    return response.data;
  },

  approveOrganization: async (
    authToken: string,
    organizationId: string
  ): Promise<{ message: string; organization: OrganizationItem }> => {
    const response = await api.post(`/organizations/${organizationId}/approve`, {}, authHeaders(authToken));
    return response.data;
  },

  suspendOrganization: async (
    authToken: string,
    organizationId: string
  ): Promise<{ message: string; organization: OrganizationItem }> => {
    const response = await api.post(`/organizations/${organizationId}/suspend`, {}, authHeaders(authToken));
    return response.data;
  },

  switchOrganization: async (
    authToken: string,
    organizationId: string
  ): Promise<{ message: string; organization: OrganizationItem }> => {
    const response = await api.post(`/organizations/${organizationId}/switch`, {}, authHeaders(authToken));
    return response.data;
  },

  getOrganizationDashboard: async (
    authToken: string,
    organizationId: string
  ): Promise<OrganizationDashboard> => {
    const response = await api.get(`/organizations/${organizationId}/dashboard`, authHeaders(authToken));
    return response.data;
  },

  listOrganizationMembers: async (
    authToken: string,
    organizationId: string,
    params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }
  ): Promise<{ members: OrganizationMember[]; pagination: Pagination }> => {
    const response = await api.get(`/organizations/${organizationId}/members`, {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  listOrganizationInvites: async (
    authToken: string,
    organizationId: string
  ): Promise<{ invites: OrganizationInvite[] }> => {
    const response = await api.get(`/organizations/${organizationId}/invites`, authHeaders(authToken));
    return response.data;
  },

  createOrganizationInvite: async (
    authToken: string,
    organizationId: string,
    payload: { email: string; role: AppUser['role'] }
  ): Promise<{ message: string; invite: OrganizationInvite }> => {
    const response = await api.post(`/organizations/${organizationId}/invites`, payload, authHeaders(authToken));
    return response.data;
  },

  cancelOrganizationInvite: async (
    authToken: string,
    organizationId: string,
    inviteId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/organizations/${organizationId}/invites/${inviteId}`,
      authHeaders(authToken)
    );
    return response.data;
  },

  listUsers: async (
    authToken: string,
    params?: UserListParams
  ): Promise<{ users: ManagedUser[]; pagination: Pagination }> => {
    const response = await api.get('/users', {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  getUser: async (
    authToken: string,
    userId: string
  ): Promise<{ user: ManagedUser; activity: UserActivityItem[] }> => {
    const response = await api.get(`/users/${userId}`, authHeaders(authToken));
    return response.data;
  },

  createUser: async (
    authToken: string,
    payload: Partial<ManagedUser> & { name: string; email: string }
  ): Promise<{ user: ManagedUser }> => {
    const response = await api.post('/users', payload, authHeaders(authToken));
    return response.data;
  },

  updateUser: async (
    authToken: string,
    userId: string,
    payload: Partial<ManagedUser>
  ): Promise<{ user: ManagedUser }> => {
    const response = await api.patch(`/users/${userId}`, payload, authHeaders(authToken));
    return response.data;
  },

  deleteUser: async (authToken: string, userId: string): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.delete(`/users/${userId}`, authHeaders(authToken));
    return response.data;
  },

  archiveUser: async (authToken: string, userId: string): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/archive`, {}, authHeaders(authToken));
    return response.data;
  },

  restoreUser: async (authToken: string, userId: string): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/restore`, {}, authHeaders(authToken));
    return response.data;
  },

  suspendUser: async (authToken: string, userId: string): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/suspend`, {}, authHeaders(authToken));
    return response.data;
  },

  activateUser: async (authToken: string, userId: string): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/activate`, {}, authHeaders(authToken));
    return response.data;
  },

  changeUserRole: async (
    authToken: string,
    userId: string,
    role: AppUser['role']
  ): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/role`, { role }, authHeaders(authToken));
    return response.data;
  },

  transferUser: async (
    authToken: string,
    userId: string,
    organizationId: string
  ): Promise<{ message: string; user: ManagedUser }> => {
    const response = await api.post(`/users/${userId}/transfer`, { organizationId }, authHeaders(authToken));
    return response.data;
  },

  bulkUsers: async (
    authToken: string,
    payload: { action: string; userIds: string[]; role?: AppUser['role']; organizationId?: string }
  ): Promise<{ message: string; matched: number; modified: number }> => {
    const response = await api.post('/users/bulk', payload, authHeaders(authToken));
    return response.data;
  },

  exportUsers: async (authToken: string, params?: UserListParams): Promise<string> => {
    const response = await api.get('/users/export', {
      ...authHeaders(authToken),
      params,
      responseType: 'text'
    });
    return response.data;
  },

  importUsers: async (
    authToken: string,
    payload: { users: Partial<ManagedUser>[]; rollbackOnError?: boolean }
  ): Promise<{ created: ManagedUser[]; errors: { row: number; email?: string; error: string }[] }> => {
    const response = await api.post('/users/import', payload, authHeaders(authToken));
    return response.data;
  },

  getUserActivity: async (
    authToken: string,
    params?: { userId?: string }
  ): Promise<{ activity: UserActivityItem[] }> => {
    const response = await api.get('/users/activity', {
      ...authHeaders(authToken),
      params
    });
    return response.data;
  },

  listBuses: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: BusItem[]; pagination: Pagination }> => {
    const response = await api.get('/buses', { ...authHeaders(authToken), params });
    return response.data;
  },
  createBus: async (authToken: string, payload: Partial<BusItem> & { busNumber: string; registrationNumber: string; capacity: number }): Promise<{ bus: BusItem }> => {
    const response = await api.post('/buses', payload, authHeaders(authToken));
    return response.data;
  },
  updateBus: async (authToken: string, id: string, payload: Partial<BusItem>): Promise<{ bus: BusItem }> => {
    const response = await api.patch(`/buses/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  deleteBus: async (authToken: string, id: string): Promise<{ message: string; bus: BusItem }> => {
    const response = await api.delete(`/buses/${id}`, authHeaders(authToken));
    return response.data;
  },
  updateBusStatus: async (authToken: string, id: string, status: BusItem['status']): Promise<{ bus: BusItem }> => {
    const response = await api.patch(`/buses/${id}/status`, { status }, authHeaders(authToken));
    return response.data;
  },
  updateBusMaintenance: async (authToken: string, id: string, payload: Pick<BusItem, 'maintenanceStatus' | 'nextServiceDate'>): Promise<{ bus: BusItem }> => {
    const response = await api.patch(`/buses/${id}/maintenance`, payload, authHeaders(authToken));
    return response.data;
  },
  exportBuses: async (authToken: string): Promise<string> => {
    const response = await api.get('/buses/export', { ...authHeaders(authToken), responseType: 'text' });
    return response.data;
  },
  importBuses: async (authToken: string, buses: Partial<BusItem>[]): Promise<{ created: BusItem[]; errors: { row: number; error: string }[] }> => {
    const response = await api.post('/buses/import', { buses }, authHeaders(authToken));
    return response.data;
  },

  listDrivers: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: DriverProfile[]; pagination: Pagination }> => {
    const response = await api.get('/drivers', { ...authHeaders(authToken), params });
    return response.data;
  },
  createDriver: async (authToken: string, payload: Partial<DriverProfile> & { userId: string; licenseNumber: string; expiryDate: string }): Promise<{ profile: DriverProfile }> => {
    const response = await api.post('/drivers', payload, authHeaders(authToken));
    return response.data;
  },
  updateDriver: async (authToken: string, id: string, payload: Partial<DriverProfile>): Promise<{ profile: DriverProfile }> => {
    const response = await api.patch(`/drivers/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  assignDriverBus: async (authToken: string, id: string, busId: string): Promise<{ profile: DriverProfile }> => {
    const response = await api.post(`/drivers/${id}/assign-bus`, { busId }, authHeaders(authToken));
    return response.data;
  },

  listConductors: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: ConductorProfile[]; pagination: Pagination }> => {
    const response = await api.get('/conductors', { ...authHeaders(authToken), params });
    return response.data;
  },
  createConductor: async (authToken: string, payload: Partial<ConductorProfile> & { userId: string; employeeId: string }): Promise<{ profile: ConductorProfile }> => {
    const response = await api.post('/conductors', payload, authHeaders(authToken));
    return response.data;
  },
  updateConductor: async (authToken: string, id: string, payload: Partial<ConductorProfile>): Promise<{ profile: ConductorProfile }> => {
    const response = await api.patch(`/conductors/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  assignConductorBus: async (authToken: string, id: string, busId: string): Promise<{ profile: ConductorProfile }> => {
    const response = await api.post(`/conductors/${id}/assign-bus`, { busId }, authHeaders(authToken));
    return response.data;
  },

  listStops: async (authToken: string, routeId: string): Promise<{ stops: RouteStop[] }> => {
    const response = await api.get(`/routes/${routeId}/stops`, authHeaders(authToken));
    return response.data;
  },
  createStop: async (authToken: string, routeId: string, payload: Partial<RouteStop> & { name: string; latitude: number; longitude: number; order: number }): Promise<{ stop: RouteStop }> => {
    const response = await api.post(`/routes/${routeId}/stops`, payload, authHeaders(authToken));
    return response.data;
  },
  assignRoute: async (authToken: string, routeId: string, payload: { assignedBus?: string; assignedDriver?: string; assignedConductor?: string }): Promise<{ route: RouteItem }> => {
    const response = await api.post(`/routes/${routeId}/assignments`, payload, authHeaders(authToken));
    return response.data;
  },
  optimizeRoute: async (authToken: string, routeId: string): Promise<{ stops: RouteStop[]; distanceKm: number; durationMinutes: number; etaMinutes: number }> => {
    const response = await api.post(`/routes/${routeId}/optimize`, {}, authHeaders(authToken));
    return response.data;
  },

  listSchedules: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: ScheduleItem[]; pagination: Pagination }> => {
    const response = await api.get('/schedules', { ...authHeaders(authToken), params });
    return response.data;
  },
  createSchedule: async (authToken: string, payload: Partial<ScheduleItem> & { routeId: string; busId: string; driverId: string; conductorId: string; departureTime: string; arrivalTime: string; tripNumber: string; effectiveFrom: string }): Promise<{ schedule: ScheduleItem }> => {
    const response = await api.post('/schedules', payload, authHeaders(authToken));
    return response.data;
  },
  updateSchedule: async (authToken: string, id: string, payload: Partial<ScheduleItem>): Promise<{ schedule: ScheduleItem }> => {
    const response = await api.patch(`/schedules/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  deleteSchedule: async (authToken: string, id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/schedules/${id}`, authHeaders(authToken));
    return response.data;
  },
  getOperationsDashboard: async (authToken: string): Promise<OperationsDashboard> => {
    const response = await api.get('/operations/dashboard', authHeaders(authToken));
    return response.data;
  },
  getDispatcherDashboard: async (authToken: string): Promise<DispatcherDashboard> => {
    const response = await api.get('/dispatcher/dashboard', authHeaders(authToken));
    return response.data;
  },
  listTrips: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: TripItem[]; pagination: Pagination }> => {
    const response = await api.get('/trips', { ...authHeaders(authToken), params });
    return response.data;
  },
  createTrip: async (authToken: string, payload: { scheduleId: string; tripCode?: string; serviceDate?: string; capacity?: number; notes?: string }): Promise<{ trip: TripItem }> => {
    const response = await api.post('/trips', payload, authHeaders(authToken));
    return response.data;
  },
  updateTripStatus: async (authToken: string, id: string, payload: Partial<Pick<TripItem, 'status' | 'delayMinutes' | 'cancellationReason' | 'occupancy' | 'revenue' | 'notes'>>): Promise<{ trip: TripItem }> => {
    const response = await api.patch(`/trips/${id}/status`, payload, authHeaders(authToken));
    return response.data;
  },
  tripAction: async (authToken: string, id: string, payload: { action: string; note?: string; delayMinutes?: number; occupancy?: number }): Promise<{ trip: TripItem }> => {
    const response = await api.post(`/trips/${id}/actions`, payload, authHeaders(authToken));
    return response.data;
  },
  updateTripLocation: async (authToken: string, id: string, payload: GPSLocation): Promise<{ trip: TripItem; location: GPSLocation }> => {
    const response = await api.post(`/trips/${id}/location`, payload, authHeaders(authToken));
    return response.data;
  },
  getTripLocation: async (authToken: string, id: string): Promise<{ trip: TripItem; location: GPSLocation | null }> => {
    const response = await api.get(`/trips/${id}/location`, authHeaders(authToken));
    return response.data;
  },
  getTripHistory: async (authToken: string, id: string): Promise<{ locations: GPSLocation[]; events: TripEvent[] }> => {
    const response = await api.get(`/trips/${id}/history`, authHeaders(authToken));
    return response.data;
  },
  getPassengerTripStatus: async (authToken: string, id: string): Promise<{ trip: TripItem; location: GPSLocation | null; events: TripEvent[]; eta?: string | null; progress: { distanceTravelledKm?: number; remainingDistanceKm?: number } }> => {
    const response = await api.get(`/trip-status/${id}`, authHeaders(authToken));
    return response.data;
  },
  syncOfflineQueue: async (authToken: string, items: { entityType: string; entityId?: string; action: string; payload?: Record<string, unknown> }[]): Promise<{ synced: number }> => {
    const response = await api.post('/offline/sync', { items }, authHeaders(authToken));
    return response.data;
  },
  listMaintenance: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: MaintenanceRecord[]; pagination: Pagination }> => {
    const response = await api.get('/maintenance', { ...authHeaders(authToken), params });
    return response.data;
  },
  createMaintenance: async (authToken: string, payload: Partial<MaintenanceRecord> & { busId: string; title: string }): Promise<{ record: MaintenanceRecord }> => {
    const response = await api.post('/maintenance', payload, authHeaders(authToken));
    return response.data;
  },
  updateMaintenance: async (authToken: string, id: string, payload: Partial<MaintenanceRecord>): Promise<{ record: MaintenanceRecord }> => {
    const response = await api.patch(`/maintenance/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  listFuel: async (authToken: string, params?: { search?: string; page?: number; limit?: number }): Promise<{ items: FuelRecord[]; pagination: Pagination }> => {
    const response = await api.get('/fuel', { ...authHeaders(authToken), params });
    return response.data;
  },
  createFuel: async (authToken: string, payload: Partial<FuelRecord> & { busId: string; litres: number; pricePerLitre: number }): Promise<{ record: FuelRecord }> => {
    const response = await api.post('/fuel', payload, authHeaders(authToken));
    return response.data;
  },
  listLeave: async (authToken: string, params?: { status?: string; page?: number; limit?: number }): Promise<{ items: LeaveRequest[]; pagination: Pagination }> => {
    const response = await api.get('/leave', { ...authHeaders(authToken), params });
    return response.data;
  },
  requestLeave: async (authToken: string, payload: Partial<LeaveRequest> & { profileType: 'driver' | 'conductor'; profileId: string; fromDate: string; toDate: string; reason: string }): Promise<{ request: LeaveRequest }> => {
    const response = await api.post('/leave', payload, authHeaders(authToken));
    return response.data;
  },
  reviewLeave: async (authToken: string, id: string, payload: { status: 'approved' | 'rejected'; reviewNote?: string }): Promise<{ request: LeaveRequest }> => {
    const response = await api.patch(`/leave/${id}/review`, payload, authHeaders(authToken));
    return response.data;
  },
  listIncidents: async (authToken: string, params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ items: IncidentItem[]; pagination: Pagination }> => {
    const response = await api.get('/incidents', { ...authHeaders(authToken), params });
    return response.data;
  },
  createIncident: async (authToken: string, payload: Partial<IncidentItem> & { type: IncidentItem['type']; title: string }): Promise<{ incident: IncidentItem }> => {
    const response = await api.post('/incidents', payload, authHeaders(authToken));
    return response.data;
  },
  updateIncident: async (authToken: string, id: string, payload: Partial<IncidentItem>): Promise<{ incident: IncidentItem }> => {
    const response = await api.patch(`/incidents/${id}`, payload, authHeaders(authToken));
    return response.data;
  },
  getCalendar: async (authToken: string, params?: { from?: string; to?: string }): Promise<{ events: CalendarEvent[] }> => {
    const response = await api.get('/calendar', { ...authHeaders(authToken), params });
    return response.data;
  },

  listPricing: async (authToken: string): Promise<{ rules: FareRuleItem[] }> => {
    const response = await api.get('/pricing', authHeaders(authToken));
    return response.data;
  },
  createPricingRule: async (authToken: string, payload: Partial<FareRuleItem>): Promise<{ rule: FareRuleItem }> => {
    const response = await api.post('/pricing', payload, authHeaders(authToken));
    return response.data;
  },
  publishPricingRule: async (authToken: string, id: string): Promise<{ rule: FareRuleItem }> => {
    const response = await api.post(`/pricing/${id}/publish`, {}, authHeaders(authToken));
    return response.data;
  },
  getPricingHistory: async (authToken: string): Promise<{ history: unknown[]; approvals: unknown[] }> => {
    const response = await api.get('/pricing/history', authHeaders(authToken));
    return response.data;
  },
  simulatePricing: async (
    authToken: string,
    payload: { routeId?: string; baseFare?: number; passengerType?: string; couponCode?: string; count?: number }
  ): Promise<{ valid: boolean; fare: number; subtotal: number; discount: number; totalAmount: number; error?: string }> => {
    const response = await api.post('/pricing/simulate', payload, authHeaders(authToken));
    return response.data;
  },
  listCoupons: async (authToken: string): Promise<{ coupons: CouponItem[] }> => {
    const response = await api.get('/coupons', authHeaders(authToken));
    return response.data;
  },
  createCoupon: async (authToken: string, payload: Partial<CouponItem>): Promise<{ coupon: CouponItem }> => {
    const response = await api.post('/coupons', payload, authHeaders(authToken));
    return response.data;
  },
  getCoupon: async (authToken: string, id: string): Promise<{ coupon: CouponItem }> => {
    const response = await api.get(`/coupons/${id}`, authHeaders(authToken));
    return response.data;
  },
  validateCoupon: async (authToken: string, payload: { code: string; subtotal: number; routeId?: string; passengerType?: string }): Promise<{ valid: boolean; discount?: number; error?: string }> => {
    const response = await api.post('/coupons/validate', payload, authHeaders(authToken));
    return response.data;
  },

  createBooking: async (authToken: string, payload: { routeId: string; seats?: string[]; passengerType?: string; couponCode?: string; paymentMethod?: 'wallet' | 'gateway' | 'wallet_gateway'; idempotencyKey?: string }): Promise<{ bookingId: string; pricing: { totalAmount: number; fare: number; discount: number }; balance: number | null; paymentRequired?: boolean; lifecycle?: string; tickets: TicketItem[] }> => {
    const response = await api.post('/bookings', payload, authHeaders(authToken));
    return response.data;
  },
  listBookings: async (authToken: string): Promise<{ bookings: BookingSummary[] }> => {
    const response = await api.get('/bookings', authHeaders(authToken));
    return response.data;
  },
  getBooking: async (authToken: string, id: string): Promise<{ bookingId: string; tickets: TicketItem[]; history: unknown[] }> => {
    const response = await api.get(`/bookings/${id}`, authHeaders(authToken));
    return response.data;
  },
  recoverBooking: async (authToken: string, id: string): Promise<BookingRecovery> => {
    const response = await api.get(`/bookings/${id}/recover`, authHeaders(authToken));
    return response.data;
  },
  getBookingInvoice: async (authToken: string, id: string): Promise<{ invoice: unknown }> => {
    const response = await api.get(`/bookings/${id}/invoice`, authHeaders(authToken));
    return response.data;
  },
  getBookingReceipt: async (authToken: string, id: string): Promise<{ receipt: unknown }> => {
    const response = await api.get(`/bookings/${id}/receipt`, authHeaders(authToken));
    return response.data;
  },
  cancelBooking: async (authToken: string, id: string, reason?: string): Promise<{ refund: unknown }> => {
    const response = await api.post(`/bookings/${id}/cancel`, { reason }, authHeaders(authToken));
    return response.data;
  },
  listRefunds: async (authToken: string): Promise<{ refunds: unknown[] }> => {
    const response = await api.get('/refunds', authHeaders(authToken));
    return response.data;
  },

  rechargeWallet: async (authToken: string, amount: number): Promise<{ balance: number; transaction: WalletTransactionItem }> => {
    const response = await api.post('/wallet/recharge', { amount }, authHeaders(authToken));
    return response.data;
  },
  getWalletTransactions: async (authToken: string): Promise<{ transactions: WalletTransactionItem[] }> => {
    const response = await api.get('/wallet/transactions', authHeaders(authToken));
    return response.data;
  },
  getWalletLedger: async (authToken: string): Promise<{ ledger: unknown[] }> => {
    const response = await api.get('/wallet/ledger', authHeaders(authToken));
    return response.data;
  },

  createPaymentOrder: async (authToken: string, payload: number | { amount?: number; bookingId?: string; coupon?: string; walletAmount?: number; paymentMethod?: string }): Promise<RazorpayOrderResponse> => {
    const body = typeof payload === 'number' ? { amount: payload } : payload;
    const response = await api.post('/payments/create-order', body, authHeaders(authToken));
    return response.data;
  },
  verifyPayment: async (authToken: string, payload: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }): Promise<{ payment: PaymentItem; alreadyProcessed?: boolean }> => {
    const response = await api.post('/payments/verify', payload, authHeaders(authToken));
    return response.data;
  },
  listPayments: async (authToken: string): Promise<{ payments: PaymentItem[] }> => {
    const response = await api.get('/payments', authHeaders(authToken));
    return response.data;
  },
  getPayment: async (authToken: string, id: string): Promise<{ payment: PaymentItem }> => {
    const response = await api.get(`/payments/${id}`, authHeaders(authToken));
    return response.data;
  },
  refundPayment: async (authToken: string, id: string, payload: { amount?: number; reason?: string }): Promise<{ payment: PaymentItem; refund: unknown }> => {
    const response = await api.post(`/payments/${id}/refund`, payload, authHeaders(authToken));
    return response.data;
  },
  getFinanceDashboard: async (authToken: string): Promise<FinanceDashboard> => {
    const response = await api.get('/finance/dashboard', authHeaders(authToken));
    return response.data;
  },
  getAuditLogs: async (authToken: string): Promise<{ logs: unknown[] }> => {
    const response = await api.get('/audit', authHeaders(authToken));
    return response.data;
  },
  getReports: async (authToken: string): Promise<{ reports: { metric: string; value: number }[] }> => {
    const response = await api.get('/reports', authHeaders(authToken));
    return response.data;
  },
  getModuleReport: async (authToken: string, moduleName: string): Promise<{ module: string; reports: { metric: string; value: number }[] }> => {
    const response = await api.get(`/reports/${moduleName}`, authHeaders(authToken));
    return response.data;
  },
  globalSearch: async (authToken: string, q: string): Promise<{ groups: { type: string; items: Record<string, unknown>[] }[] }> => {
    const response = await api.get('/search', { ...authHeaders(authToken), params: { q } });
    return response.data;
  },
  getNotifications: async (authToken: string): Promise<{ notifications: NotificationItem[] }> => {
    const response = await api.get('/notifications', authHeaders(authToken));
    return response.data;
  },
  markNotificationsRead: async (authToken: string, ids: string[]): Promise<{ modified: number }> => {
    const response = await api.patch('/notifications/read', { ids }, authHeaders(authToken));
    return response.data;
  },
  markAllNotificationsRead: async (authToken: string): Promise<{ modified: number }> => {
    const response = await api.patch('/notifications/read-all', {}, authHeaders(authToken));
    return response.data;
  },
  updateNotificationPreferences: async (authToken: string, payload: Record<string, boolean>): Promise<{ preferences: unknown }> => {
    const response = await api.patch('/notifications/preferences', payload, authHeaders(authToken));
    return response.data;
  },

  listPosts: async (authToken: string, params?: { search?: string; category?: string; status?: string }): Promise<{ posts: PostItem[]; pagination: Pagination }> => {
    const response = await api.get('/posts', { ...authHeaders(authToken), params });
    return response.data;
  },
  getPost: async (authToken: string, id: string): Promise<{ post: PostItem }> => {
    const response = await api.get(`/posts/${id}`, authHeaders(authToken));
    return response.data;
  },
  createPost: async (authToken: string, payload: Partial<PostItem> & { title: string; body: string }): Promise<{ post: PostItem }> => {
    const response = await api.post('/posts', payload, authHeaders(authToken));
    return response.data;
  },
  addPostComment: async (authToken: string, id: string, body: string): Promise<{ post: PostItem }> => {
    const response = await api.post(`/posts/${id}/comments`, { body }, authHeaders(authToken));
    return response.data;
  },
  likePost: async (authToken: string, id: string): Promise<{ post: PostItem }> => {
    const response = await api.post(`/posts/${id}/like`, {}, authHeaders(authToken));
    return response.data;
  },
  pinPost: async (authToken: string, id: string): Promise<{ post: PostItem }> => {
    const response = await api.post(`/posts/${id}/pin`, {}, authHeaders(authToken));
    return response.data;
  },

  listSupportTickets: async (authToken: string, params?: { search?: string; status?: string; priority?: string }): Promise<{ tickets: SupportTicketItem[]; pagination: Pagination }> => {
    const response = await api.get('/support/tickets', { ...authHeaders(authToken), params });
    return response.data;
  },
  getSupportTicket: async (authToken: string, id: string): Promise<{ ticket: SupportTicketItem }> => {
    const response = await api.get(`/support/tickets/${id}`, authHeaders(authToken));
    return response.data;
  },
  createSupportTicket: async (authToken: string, payload: Partial<SupportTicketItem> & { title: string; description: string }): Promise<{ ticket: SupportTicketItem }> => {
    const response = await api.post('/support/tickets', payload, authHeaders(authToken));
    return response.data;
  },
  replySupportTicket: async (authToken: string, id: string, body: string): Promise<{ ticket: SupportTicketItem }> => {
    const response = await api.post(`/support/tickets/${id}/replies`, { body }, authHeaders(authToken));
    return response.data;
  }
};
