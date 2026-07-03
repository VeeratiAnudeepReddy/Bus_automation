'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Bell,
  Bus,
  CalendarDays,
  Clock,
  Download,
  Headphones,
  Languages,
  Navigation,
  QrCode,
  Search,
  Shield,
  Star,
  Ticket,
  UserRound,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import {
  apiService,
  BookingSummary,
  NotificationItem,
  PaymentItem,
  PostItem,
  RouteItem,
  StopItem,
  SupportTicketItem,
  TicketItem,
  WalletTransactionItem
} from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

type CustomerData = {
  balance: number;
  tickets: TicketItem[];
  bookings: BookingSummary[];
  routes: RouteItem[];
  stops: StopItem[];
  popularRoutes: RouteItem[];
  notifications: NotificationItem[];
  posts: PostItem[];
  support: SupportTicketItem[];
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
};

const city = 'Hyderabad';
const busImages = [
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=900&q=80'
];

function statusClass(status: string) {
  if (['ACTIVE', 'active', 'captured', 'completed'].includes(status)) return 'bg-emerald-100 text-emerald-700';
  if (['HELD', 'pending', 'created', 'planned', 'scheduled'].includes(status)) return 'bg-amber-100 text-amber-700';
  if (['CANCELLED', 'EXPIRED', 'failed', 'cancelled'].includes(status)) return 'bg-rose-100 text-rose-700';
  return 'bg-zinc-100 text-zinc-700';
}

function MiniMap({ from, to, label }: { from?: { lat: number; lng: number } | null; to?: { lat: number; lng: number } | null; label: string }) {
  const lat = from?.lat || to?.lat || 17.385;
  const lng = from?.lng || to?.lng || 78.4867;
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <iframe
        title={label}
        src={`https://www.google.com/maps?q=${lat},${lng}&z=12&output=embed`}
        className="h-64 w-full border-0"
        loading="lazy"
      />
    </div>
  );
}

function Widget({ title, value, icon: Icon, hint }: { title: string; value: string | number; icon: typeof Wallet; hint?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-zinc-500">{title}</p>
        <Icon size={18} className="text-zinc-500" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-zinc-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

function RoutePill({ route }: { route: RouteItem }) {
  return (
    <Link href={`/booking?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`} className="rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-950">{route.from} to {route.to}</p>
          <p className="mt-1 text-xs text-zinc-500">{route.city} · {route.distanceKm ? `${route.distanceKm} km` : 'Live route'}</p>
        </div>
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">{formatCurrency(route.fare)}</span>
      </div>
    </Link>
  );
}

function useCustomerData() {
  const { isLoaded, user, getToken } = useAppRole();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerData>({
    balance: 0,
    tickets: [],
    bookings: [],
    routes: [],
    stops: [],
    popularRoutes: [],
    notifications: [],
    posts: [],
    support: []
  });

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) return;
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token');
        const [tickets, routes, bookings, notifications, posts, support] = await Promise.all([
          apiService.getMyTickets(token),
          apiService.getRoutes(token, { city }),
          apiService.listBookings(token).catch(() => ({ bookings: [] })),
          apiService.getNotifications(token).catch(() => ({ notifications: [] })),
          apiService.listPosts(token, { status: 'published' }).catch(() => ({ posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })),
          apiService.listSupportTickets(token).catch(() => ({ tickets: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }))
        ]);
        setData({
          balance: tickets.balance,
          tickets: tickets.tickets,
          bookings: bookings.bookings,
          routes: routes.routes,
          stops: routes.stops,
          popularRoutes: routes.popularRoutes,
          notifications: notifications.notifications,
          posts: posts.posts,
          support: support.tickets
        });
      } catch {
        toast.error('Unable to load customer workspace');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken, isLoaded, user]);

  return { loading, data };
}

export function CustomerDashboardPageContent() {
  const { appUser } = useAppRole();
  const { loading, data } = useCustomerData();
  const upcomingTicket = data.tickets.find((ticket) => ticket.status === 'ACTIVE' || ticket.status === 'HELD');
  const usedTickets = data.tickets.filter((ticket) => ticket.status === 'USED');
  const cancelledTickets = data.tickets.filter((ticket) => ['CANCELLED', 'EXPIRED', 'REFUNDED'].includes(ticket.status));
  const favoriteRoutes = data.popularRoutes.length ? data.popularRoutes : data.routes.slice(0, 3);
  const nextRoute = upcomingTicket || data.tickets[0];

  if (loading) {
    return (
      <PageShell>
        <LoadingSkeleton className="h-48" />
        <LoadingSkeleton className="h-28" />
        <LoadingSkeleton className="h-72" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-sm">
          <div className="bg-[url('https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
            <div className="bg-black/55 p-6">
              <p className="text-sm text-white/70">Good morning, {appUser?.name || 'Passenger'}</p>
              <h1 className="mt-2 text-3xl font-semibold">Your {city} ride is ready.</h1>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                  <p className="text-xs text-white/60">Wallet</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(data.balance)}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                  <p className="text-xs text-white/60">Current city</p>
                  <p className="mt-1 text-lg font-semibold">{city}</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                  <p className="text-xs text-white/60">Weather</p>
                  <p className="mt-1 text-lg font-semibold">Use local forecast</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/booking" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">Quick book</Link>
                <Link href="/tickets" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white">QR tickets</Link>
                <Link href="/track/live" className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white">Track bus</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-zinc-500">Upcoming trip</p>
          {nextRoute ? (
            <div className="mt-4">
              <p className="text-xl font-semibold text-zinc-950">{nextRoute.from || 'Pickup'} to {nextRoute.to || 'Destination'}</p>
              <p className="mt-1 text-sm text-zinc-500">Next departure · {formatDateTime(nextRoute.createdAt)}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">{nextRoute.status}</span>
                <span className="rounded-xl bg-zinc-100 px-3 py-2 text-zinc-700">{nextRoute.seatNumber || 'Seat at boarding'}</span>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No upcoming trip from backend yet. Book a route to see live status here.</div>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Widget title="Bookings" value={data.bookings.length} icon={Ticket} hint="Backend bookings" />
        <Widget title="Used trips" value={usedTickets.length} icon={Bus} hint="Scanned QR tickets" />
        <Widget title="Cancelled" value={cancelledTickets.length} icon={CalendarDays} hint="Cancelled, expired, refunded" />
        <Widget title="Notifications" value={data.notifications.filter((item) => !item.readAt).length} icon={Bell} hint="Unread alerts" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-950">Favorite routes</h2>
            <Link href="/booking" className="text-sm font-medium text-zinc-600">Search routes</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {favoriteRoutes.map((route) => <RoutePill key={route._id} route={route} />)}
            {!favoriteRoutes.length ? <p className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No active routes returned by backend.</p> : null}
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Offers and announcements</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {(data.posts.length ? data.posts : []).map((post) => (
              <Link key={post._id} href={`/posts/${post._id}`} className="min-w-64 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs uppercase text-zinc-500">{post.category}</p>
                <h3 className="mt-1 font-semibold text-zinc-950">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{post.body}</p>
              </Link>
            ))}
            {!data.posts.length ? <div className="min-w-64 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No offers published yet.</div> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <MiniMap label="Nearby buses map" from={data.routes[0]?.fromCoords} to={data.routes[0]?.toCoords} />
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {data.tickets.slice(0, 5).map((ticket) => (
              <Link key={ticket.ticketId} href={`/tickets/${ticket.ticketId}`} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3 text-sm">
                <span>{ticket.from || 'Route'} to {ticket.to || 'Destination'}</span>
                <span className={`rounded-full px-2 py-1 text-xs ${statusClass(ticket.status)}`}>{ticket.status}</span>
              </Link>
            ))}
            {!data.tickets.length ? <p className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No trips yet.</p> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function CustomerBookingPageContent() {
  const { isLoaded, user, getToken } = useAppRole();
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [passengers, setPassengers] = useState(1);
  const [busType, setBusType] = useState('Any');
  const [selected, setSelected] = useState<RouteItem | null>(null);
  const [coupon, setCoupon] = useState('');
  const [walletAmount, setWalletAmount] = useState('0');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) return;
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token');
        const response = await apiService.getRoutes(token, { city });
        setRoutes(response.routes);
      } catch {
        toast.error('Unable to load routes');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken, isLoaded, user]);

  const available = useMemo(() => {
    return routes.filter((route) => {
      const fromMatch = !from || route.from.toLowerCase().includes(from.toLowerCase());
      const toMatch = !to || route.to.toLowerCase().includes(to.toLowerCase());
      return route.active && fromMatch && toMatch;
    });
  }, [from, routes, to]);

  const submitBooking = async () => {
    if (!selected) return;
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const response = await apiService.createBooking(token, {
        routeId: selected._id,
        passengerType: 'adult',
        couponCode: coupon || undefined,
        paymentMethod: Number(walletAmount) > 0 ? 'wallet_gateway' : 'gateway',
        seats: Array.from({ length: passengers }, (_, index) => `A${index + 1}`),
        idempotencyKey: `web-${selected._id}-${Date.now()}`
      });
      setBooking(response.bookingId);
      toast.success('Seat hold created. Continue payment from Payments if required.');
    } catch {
      toast.error('Unable to create booking');
    }
  };

  return (
    <PageShell>
      <section className="overflow-hidden rounded-3xl bg-zinc-950 text-white shadow-sm">
        <div className="bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center">
          <div className="bg-black/60 p-6">
            <p className="text-sm text-white/70">Airline-style booking</p>
            <h1 className="mt-2 text-3xl font-semibold">Search buses across {city}</h1>
            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_160px_140px_130px]">
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-zinc-950 outline-none" />
              <button type="button" onClick={() => { setFrom(to); setTo(from); }} className="rounded-2xl border border-white/20 px-4 py-3"><ArrowRightLeft size={18} /></button>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-zinc-950 outline-none" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-zinc-950 outline-none" />
              <input type="number" min={1} max={6} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-zinc-950 outline-none" />
              <select value={busType} onChange={(e) => setBusType(e.target.value)} className="rounded-2xl border border-white/20 bg-white/90 px-4 py-3 text-sm text-zinc-950 outline-none">
                {['Any', 'AC', 'Non AC', 'Electric'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-950">Available buses</h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">{available.length} routes</span>
          </div>
          {loading ? <LoadingSkeleton className="h-40" /> : null}
          {available.map((route, index) => (
            <article key={route._id} className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected?._id === route._id ? 'border-zinc-950' : 'border-zinc-200'}`}>
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <div className="h-48 w-full bg-cover bg-center md:h-full" style={{ backgroundImage: `url(${busImages[index % busImages.length]})` }} aria-label="Bus" />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-zinc-500">BusQR Express · {busType}</p>
                      <h3 className="mt-1 text-xl font-semibold text-zinc-950">{route.from} to {route.to}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{date} · {route.distanceKm || 'Live'} km · {route.durationMinutes || 45} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-zinc-950">{formatCurrency(route.fare)}</p>
                      <p className="text-xs text-zinc-500">per passenger</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <span className="rounded-xl bg-zinc-100 px-3 py-2"><Clock size={14} className="mr-1 inline" /> 08:30</span>
                    <span className="rounded-xl bg-zinc-100 px-3 py-2"><Navigation size={14} className="mr-1 inline" /> 09:15</span>
                    <span className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">32 seats</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600">
                    {['Wi-Fi', 'GPS', 'USB', 'CCTV', 'Women seats'].map((item) => <span key={item} className="rounded-full border border-zinc-200 px-3 py-1">{item}</span>)}
                    <span className="rounded-full border border-zinc-200 px-3 py-1"><Star size={12} className="mr-1 inline fill-amber-400 text-amber-400" />4.6</span>
                  </div>
                  <ActionButton className="mt-4" onClick={() => setSelected(route)}>Select bus</ActionButton>
                </div>
              </div>
            </article>
          ))}
          {!loading && !available.length ? <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">No backend routes match this search.</div> : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Seat layout and fare</h2>
            {selected ? (
              <>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Array.from({ length: 24 }, (_, index) => <button key={index} className={`rounded-xl border px-3 py-2 text-sm ${index < passengers ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200'}`}>{index < 12 ? 'A' : 'B'}{(index % 12) + 1}</button>)}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex justify-between"><span>Base fare</span><strong>{formatCurrency(selected.fare * passengers)}</strong></p>
                  <p className="flex justify-between"><span>Coupon</span><input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="CODE" className="w-28 rounded-lg border border-zinc-200 px-2 py-1 text-right" /></p>
                  <p className="flex justify-between"><span>Wallet usage</span><input value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} className="w-28 rounded-lg border border-zinc-200 px-2 py-1 text-right" /></p>
                </div>
                <ActionButton className="mt-4 w-full" onClick={() => void submitBooking()}>Hold seats and continue payment</ActionButton>
                {booking ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">Booking hold created: {booking}</p> : null}
              </>
            ) : <p className="mt-3 text-sm text-zinc-500">Select a bus to view seats, driver, conductor, pickup/drop points, fare breakup, and payment.</p>}
          </div>
          <MiniMap label="Booking route map" from={selected?.fromCoords} to={selected?.toCoords} />
        </aside>
      </section>
    </PageShell>
  );
}

export function CustomerBookingsPageContent() {
  const { loading, data } = useCustomerData();
  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Bookings</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Your trips and tickets</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {['All', 'Upcoming', 'Completed', 'Refunded'].map((item) => <button key={item} className="rounded-full border border-zinc-200 px-3 py-1 text-sm">{item}</button>)}
        </div>
      </section>
      {loading ? <LoadingSkeleton className="h-48" /> : null}
      <section className="grid gap-4">
        {data.bookings.map((booking) => (
          <Link key={booking.bookingId} href={`/bookings/${booking.bookingId}`} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500">{booking.bookingId}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-950">{booking.tickets[0]?.from || 'Route'} to {booking.tickets[0]?.to || 'Destination'}</h2>
                <p className="mt-1 text-sm text-zinc-500">{formatDateTime(booking.createdAt)} · {booking.tickets.length} passenger(s)</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${statusClass(booking.status)}`}>{booking.status}</span>
            </div>
          </Link>
        ))}
        {!loading && !data.bookings.length ? <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">No bookings returned by backend.</div> : null}
      </section>
    </PageShell>
  );
}

export function CustomerBookingDetailPageContent() {
  const params = useParams<{ id: string }>();
  const { isLoaded, user, getToken } = useAppRole();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user || !params.id) return;
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token');
        const detail = await apiService.getBooking(token, params.id);
        setBooking({
          bookingId: detail.bookingId,
          tickets: detail.tickets,
          totalAmount: detail.tickets.reduce((sum, ticket) => sum + (ticket.fare || 0), 0),
          status: detail.tickets[0]?.status || 'ACTIVE',
          createdAt: detail.tickets[0]?.createdAt || new Date().toISOString()
        });
      } catch {
        toast.error('Unable to load booking');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [getToken, isLoaded, params.id, user]);

  const firstTicket = booking?.tickets[0];

  return (
    <PageShell>
      {loading ? <LoadingSkeleton className="h-48" /> : null}
      {booking ? (
        <>
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-zinc-500">Booking {booking.bookingId}</p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-950">{firstTicket?.from || 'Route'} to {firstTicket?.to || 'Destination'}</h1>
                <p className="mt-1 text-sm text-zinc-500">{formatDateTime(booking.createdAt)} · {booking.tickets.length} ticket(s)</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${statusClass(booking.status)}`}>{booking.status}</span>
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-950">Tickets</h2>
              <div className="mt-4 grid gap-3">
                {booking.tickets.map((ticket) => (
                  <Link key={ticket.ticketId} href={`/tickets/${ticket.ticketId}`} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3">
                    <div>
                      <p className="font-medium text-zinc-950">{ticket.ticketId}</p>
                      <p className="text-xs text-zinc-500">Seat {ticket.seatNumber || 'boarding'} · {ticket.passengerType || 'adult'}</p>
                    </div>
                    <QrCode size={20} className="text-zinc-500" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <MiniMap label="Booking detail route map" from={firstTicket?.fromCoords} to={firstTicket?.toCoords} />
              <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-950">Fare breakup</h2>
                <p className="mt-3 flex justify-between text-sm"><span>Total paid</span><strong>{formatCurrency(booking.totalAmount)}</strong></p>
                <p className="mt-2 text-xs text-zinc-500">Invoices and receipts are available from the booking APIs when generated.</p>
              </div>
            </div>
          </section>
        </>
      ) : !loading ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">Booking not found.</div>
      ) : null}
    </PageShell>
  );
}

export function CustomerWalletPageContent() {
  const { isLoaded, user, getToken } = useAppRole();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    if (!isLoaded || !user) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const [tickets, txns, paymentData] = await Promise.all([
        apiService.getMyTickets(token),
        apiService.getWalletTransactions(token).catch(() => ({ transactions: [] })),
        apiService.listPayments(token).catch(() => ({ payments: [] }))
      ]);
      setBalance(tickets.balance);
      setTransactions(txns.transactions);
      setPayments(paymentData.payments);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, user]);

  useEffect(() => { void load(); }, [load]);

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as RazorpayWindow).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const recharge = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const ready = await loadRazorpay();
      if (!ready) throw new Error('Razorpay checkout unavailable');
      const response = await apiService.createPaymentOrder(token, { amount: Number(amount), paymentMethod: 'gateway' });
      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error('Razorpay checkout unavailable');
      const checkout = new Razorpay({
        key: response.keyId,
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'BusQR Wallet',
        description: 'Wallet recharge',
        order_id: response.order.id,
        handler: async (payment: Record<string, string>) => {
          await apiService.verifyPayment(token, {
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_signature: payment.razorpay_signature
          });
          toast.success('Payment verified');
          await load();
        }
      });
      checkout.open();
    } catch {
      toast.error('Unable to start Razorpay recharge');
    }
  };

  const filtered = transactions.filter((item) => !filter || `${item.type} ${item.referenceId || ''} ${item.notes || ''}`.toLowerCase().includes(filter.toLowerCase()));

  return (
    <PageShell>
      <section className="grid gap-4 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl bg-zinc-950 p-6 text-white shadow-sm">
          <p className="text-sm text-white/60">Wallet summary</p>
          <h1 className="mt-2 text-4xl font-semibold">{formatCurrency(balance)}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-white/60">Payments</p><p className="font-semibold">{payments.length}</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-white/60">Pending refunds</p><p className="font-semibold">{payments.filter((p) => p.status === 'refund_pending').length}</p></div>
            <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-white/60">Cashback</p><p className="font-semibold">From coupons</p></div>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Razorpay recharge</h2>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm" />
          <ActionButton className="mt-3 w-full" onClick={() => void recharge()}>Recharge wallet</ActionButton>
        </div>
      </section>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950">Transactions</h2>
          <div className="flex gap-2">
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search transactions" className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
            <button className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"><Download size={16} /></button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {loading ? <LoadingSkeleton className="h-24" /> : null}
          {filtered.map((txn) => (
            <div key={txn._id} className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3 text-sm">
              <div><p className="font-medium text-zinc-950">{txn.type}</p><p className="text-xs text-zinc-500">{txn.notes || txn.referenceId || formatDateTime(txn.createdAt)}</p></div>
              <p className={txn.amount >= 0 ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>{formatCurrency(txn.amount)}</p>
            </div>
          ))}
          {!loading && !filtered.length ? <p className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">No wallet transactions from backend.</p> : null}
        </div>
      </section>
    </PageShell>
  );
}

export function CustomerNotificationsPageContent() {
  const { loading, data } = useCustomerData();
  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Notifications</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Travel alerts and announcements</h1>
      </section>
      {loading ? <LoadingSkeleton className="h-32" /> : null}
      <section className="grid gap-3">
        {data.notifications.map((item) => (
          <article key={item._id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-zinc-100 p-3"><Bell size={18} /></div>
              <div>
                <p className="text-xs uppercase text-zinc-500">{item.category} · {item.channel}</p>
                <h2 className="mt-1 font-semibold text-zinc-950">{item.title}</h2>
                <p className="mt-1 text-sm text-zinc-600">{item.message}</p>
              </div>
            </div>
          </article>
        ))}
        {!loading && !data.notifications.length ? <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">No notifications from backend.</p> : null}
      </section>
    </PageShell>
  );
}

export function CustomerSearchPageContent() {
  const { isLoaded, user, getToken } = useAppRole();
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState<{ type: string; items: Record<string, unknown>[] }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!isLoaded || !user || query.trim().length < 2) {
        setGroups([]);
        return;
      }
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token');
        const response = await apiService.globalSearch(token, query.trim());
        setGroups(response.groups);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [getToken, isLoaded, query, user]);

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus placeholder="Search routes, buses, bookings, tickets, payments, reports..." className="w-full bg-transparent text-sm outline-none" />
          <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500">⌘K</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Users', 'Trips', 'Routes', 'Buses', 'Drivers', 'Bookings', 'Tickets', 'Payments', 'Reports'].map((item) => <span key={item} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">{item}</span>)}
        </div>
      </section>
      {loading ? <LoadingSkeleton className="h-32" /> : null}
      <section className="grid gap-4">
        {groups.map((group) => (
          <div key={group.type} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-zinc-500">{group.type}</h2>
            <div className="mt-3 grid gap-2">
              {group.items.map((item, index) => <pre key={index} className="overflow-auto rounded-2xl bg-zinc-50 p-3 text-xs text-zinc-700">{JSON.stringify(item, null, 2)}</pre>)}
            </div>
          </div>
        ))}
        {query.length >= 2 && !loading && !groups.length ? <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">No backend results for this search.</p> : null}
      </section>
    </PageShell>
  );
}

export function CustomerSettingsPageContent() {
  const sections = [
    ['Organization', 'Business profile, GST, branding, hours', Shield],
    ['Theme', 'Dark mode, density, color preferences', Languages],
    ['Notifications', 'Email, SMS, push, travel alerts', Bell],
    ['Security', 'Sessions, devices, API keys', Shield],
    ['Roles and permissions', 'View assigned access and support contacts', UserRound],
    ['Danger zone', 'Account export and support escalation', Headphones]
  ] as const;

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Personal and workspace settings</h1>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {sections.map(([title, description, Icon]) => (
          <article key={title} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-zinc-100 p-3"><Icon size={18} /></div>
              <div><h2 className="font-semibold text-zinc-950">{title}</h2><p className="text-sm text-zinc-500">{description}</p></div>
            </div>
            <div className="mt-4 grid gap-2">
              <label className="flex items-center justify-between rounded-2xl border border-zinc-200 p-3 text-sm"><span>Enabled</span><input type="checkbox" defaultChecked /></label>
              <label className="block rounded-2xl border border-zinc-200 p-3 text-sm"><span className="text-xs text-zinc-500">Preference</span><input className="mt-1 w-full outline-none" placeholder={title} /></label>
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export function CustomerProfilePageContent() {
  const { appUser } = useAppRole();
  return (
    <PageShell>
      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-zinc-950 text-3xl font-semibold text-white">{appUser?.name?.slice(0, 1) || 'P'}</div>
          <h1 className="mt-4 text-xl font-semibold text-zinc-950">{appUser?.name || 'Passenger'}</h1>
          <p className="text-sm text-zinc-500">{appUser?.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">{appUser?.role || 'customer'}</span>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-950">Travel profile</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Phone', appUser?.phone],
              ['Language', appUser?.language],
              ['Timezone', appUser?.timezone],
              ['City', appUser?.address?.city],
              ['Emergency contact', appUser?.emergencyContact?.phone],
              ['Organization', appUser?.organizationId]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 p-3">
                <p className="text-xs uppercase text-zinc-500">{label}</p>
                <p className="mt-1 text-sm font-medium text-zinc-950">{value || 'Not provided'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function CustomerSupportPageContent() {
  const { isLoaded, user, getToken } = useAppRole();
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [form, setForm] = useState<{ title: string; description: string; category: string; priority: SupportTicketItem['priority'] }>({ title: '', description: '', category: 'booking', priority: 'normal' });

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) return;
      const token = await getToken();
      if (!token) return;
      const response = await apiService.listSupportTickets(token).catch(() => ({ tickets: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }));
      setTickets(response.tickets);
    };
    void load();
  }, [getToken, isLoaded, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token');
      const response = await apiService.createSupportTicket(token, form);
      setTickets((prev) => [response.ticket, ...prev]);
      setForm({ title: '', description: '', category: 'booking', priority: 'normal' });
      toast.success('Support ticket created');
    } catch {
      toast.error('Unable to create support ticket');
    }
  };

  return (
    <PageShell>
      <section className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <form onSubmit={(event) => void submit(event)} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase text-zinc-500">Support</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-950">Need help with a trip?</h1>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Subject" className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm" required />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" className="mt-3 min-h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm" required />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm"><option>booking</option><option>wallet</option><option>driver</option><option>lost item</option></select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as SupportTicketItem['priority'] })} className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm"><option>normal</option><option>high</option><option>urgent</option></select>
          </div>
          <ActionButton className="mt-4 w-full" type="submit">Create support ticket</ActionButton>
        </form>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket._id} href={`/support/${ticket._id}`} className="block rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase text-zinc-500">{ticket.ticketNumber} · {ticket.priority}</p>
              <h2 className="mt-1 font-semibold text-zinc-950">{ticket.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{ticket.description}</p>
            </Link>
          ))}
          {!tickets.length ? <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">No support tickets from backend.</div> : null}
        </div>
      </section>
    </PageShell>
  );
}

export function CustomerSupportDetailPageContent() {
  const params = useParams<{ id: string }>();
  const { isLoaded, user, getToken } = useAppRole();
  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user || !params.id) return;
      const token = await getToken();
      if (!token) return;
      const response = await apiService.getSupportTicket(token, params.id).catch(() => ({ ticket: null }));
      setTicket(response.ticket);
    };
    void load();
  }, [getToken, isLoaded, params.id, user]);

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Support ticket</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{ticket?.title || 'Loading support request'}</h1>
        {ticket ? <p className="mt-2 text-sm text-zinc-600">{ticket.ticketNumber} · {ticket.status} · {ticket.priority}</p> : null}
      </section>
      {ticket ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Issue details</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{ticket.description}</p>
          </article>
          <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Help timeline</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-2xl bg-zinc-50 p-3">Created {formatDateTime(ticket.createdAt)}</p>
              <p className="rounded-2xl bg-zinc-50 p-3">Priority {ticket.priority}</p>
              <p className="rounded-2xl bg-zinc-50 p-3">Status {ticket.status}</p>
            </div>
          </aside>
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white p-6 text-sm text-zinc-500">Support ticket not found.</div>
      )}
    </PageShell>
  );
}
