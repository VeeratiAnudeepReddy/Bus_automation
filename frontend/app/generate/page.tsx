'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import ActionButton from '@/components/ActionButton';
import WalletCard from '@/components/WalletCard';
import { apiService, RouteItem, StopItem, TicketItem } from '@/lib/api';
import { addActivity } from '@/lib/activity';
import { formatCurrency } from '@/lib/format';
import { useAppRole } from '@/lib/useAppRole';

const RouteMapPicker = dynamic(() => import('@/components/RouteMapPicker'), { ssr: false });
const RECENT_ROUTES_KEY = 'busqr-recent-routes';

type LatLng = { lat: number; lng: number };

const toRad = (value: number) => (value * Math.PI) / 180;
const distanceInKm = (a: LatLng, b: LatLng) => {
  const earthRadius = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const p =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(p));
};

export default function GenerateTicketPage() {
  const router = useRouter();
  const { isLoaded, user, role, ready } = useAppRole();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<RouteItem[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<Array<{ from: string; to: string }>>([]);
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [fromCoords, setFromCoords] = useState<LatLng | null>(null);
  const [toCoords, setToCoords] = useState<LatLng | null>(null);
  const [mapMode, setMapMode] = useState<'from' | 'to'>('from');
  const [ticket, setTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(RECENT_ROUTES_KEY);
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentRoutes(parsed.slice(0, 5));
      }
    } catch {
      setRecentRoutes([]);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!isLoaded || !user) {
        return;
      }
      if (role === 'admin' || role === 'fare_manager') {
        setLoading(false);
        return;
      }
      try {
        const [ticketData, routeData] = await Promise.all([
          apiService.getMyTickets(user.id),
          apiService.getRoutes(user.id, { city: 'Hyderabad' })
        ]);
        setBalance(ticketData.balance);
        setRoutes(routeData.routes);
        setStops(routeData.stops);
        setPopularRoutes(routeData.popularRoutes);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isLoaded, role, user]);

  useEffect(() => {
    if (ready && (role === 'admin' || role === 'fare_manager')) {
      router.replace('/admin');
    }
  }, [ready, role, router]);

  const availableRoute = routes.find(
    (route) => route.active && route.from.toLowerCase() === fromStop.trim().toLowerCase() && route.to.toLowerCase() === toStop.trim().toLowerCase()
  );

  useEffect(() => {
    if (!availableRoute) {
      return;
    }
    setFromCoords((prev) => prev || availableRoute.fromCoords);
    setToCoords((prev) => prev || availableRoute.toCoords);
  }, [availableRoute]);

  const nearestStop = (coords: LatLng) => {
    if (!stops.length) {
      return null;
    }
    const candidates = stops
      .map((stop) => ({
        stop,
        distance: distanceInKm(coords, stop.coords)
      }))
      .sort((a, b) => a.distance - b.distance);
    return candidates[0] || null;
  };

  const onMapPick = (coords: LatLng) => {
    const nearest = nearestStop(coords);
    if (mapMode === 'from') {
      setFromCoords(coords);
      if (nearest && nearest.distance <= 2) {
        setFromStop(nearest.stop.name);
      }
      toast.success('From location pinned');
      return;
    }
    setToCoords(coords);
    if (nearest && nearest.distance <= 2) {
      setToStop(nearest.stop.name);
    }
    toast.success('To location pinned');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onMapPick({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        toast.error('Unable to fetch current location');
      }
    );
  };

  const persistRecentRoute = (from: string, to: string) => {
    const next = [{ from, to }, ...recentRoutes.filter((item) => !(item.from === from && item.to === to))].slice(0, 5);
    setRecentRoutes(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(next));
    }
  };

  const generateTicket = async () => {
    if (!user) {
      return;
    }
    if (!fromStop.trim() || !toStop.trim()) {
      toast.error('Please select both from and to stops');
      return;
    }
    if (fromStop.trim().toLowerCase() === toStop.trim().toLowerCase()) {
      toast.error('From and To cannot be the same');
      return;
    }
    if (!availableRoute) {
      toast.error('Selected route is unavailable');
      return;
    }

    setSaving(true);
    try {
      const response = await apiService.bookTickets(user.id, {
        count: 1,
        routeId: availableRoute._id,
        from: availableRoute.from,
        to: availableRoute.to,
        fromCoords: fromCoords || availableRoute.fromCoords,
        toCoords: toCoords || availableRoute.toCoords
      });
      const created = response.tickets[0];
      setTicket(created);
      setBalance(response.balance);
      addActivity({
        title: 'Ticket Purchased',
        subtitle: `${availableRoute.from} → ${availableRoute.to}`,
        amount: -availableRoute.fare
      });
      persistRecentRoute(availableRoute.from, availableRoute.to);
      toast.success('Ticket generated');
    } catch {
      toast.error('Unable to generate ticket');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || !ready || loading) {
    return <PageShell />;
  }

  return (
    <PageShell>
      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-zinc-900">Generate Ticket</h1>
        <p className="mt-1 text-sm text-zinc-600">Select route and book with fixed fare</p>
        <div className="mt-3">
          <WalletCard balance={balance} />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Route Selection</h2>
        <div className="mt-3 grid gap-2">
          <input
            list="from-stops"
            value={fromStop}
            onChange={(event) => setFromStop(event.target.value)}
            placeholder="Select From Destination"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <datalist id="from-stops">
            {stops.map((stop) => (
              <option key={`from-${stop.name}`} value={stop.name} />
            ))}
          </datalist>

          <input
            list="to-stops"
            value={toStop}
            onChange={(event) => setToStop(event.target.value)}
            placeholder="Select To Destination"
            className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-black"
          />
          <datalist id="to-stops">
            {stops.map((stop) => (
              <option key={`to-${stop.name}`} value={stop.name} />
            ))}
          </datalist>
        </div>

        {fromStop && toStop && fromStop.trim().toLowerCase() === toStop.trim().toLowerCase() ? (
          <p className="mt-2 text-xs text-red-600">From and To cannot be the same.</p>
        ) : null}

        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">Fare</p>
          <p className="text-sm font-semibold text-zinc-900">
            {availableRoute ? formatCurrency(availableRoute.fare) : 'Route unavailable'}
          </p>
        </div>

        {popularRoutes.length ? (
          <div className="mt-3">
            <p className="text-xs text-zinc-500">Popular Routes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {popularRoutes.slice(0, 4).map((route) => (
                <button
                  key={`popular-${route._id}`}
                  onClick={() => {
                    setFromStop(route.from);
                    setToStop(route.to);
                    setFromCoords(route.fromCoords);
                    setToCoords(route.toCoords);
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700"
                >
                  {route.from} → {route.to}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {recentRoutes.length ? (
          <div className="mt-3">
            <p className="text-xs text-zinc-500">Recently Booked</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recentRoutes.map((route) => (
                <button
                  key={`recent-${route.from}-${route.to}`}
                  onClick={() => {
                    setFromStop(route.from);
                    setToStop(route.to);
                  }}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700"
                >
                  {route.from} → {route.to}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Map Pinning</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <ActionButton variant={mapMode === 'from' ? 'primary' : 'outline'} onClick={() => setMapMode('from')}>
            Select From on Map
          </ActionButton>
          <ActionButton variant={mapMode === 'to' ? 'primary' : 'outline'} onClick={() => setMapMode('to')}>
            Select To on Map
          </ActionButton>
          <ActionButton variant="outline" onClick={useCurrentLocation}>
            Use Current Location
          </ActionButton>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Tap on map to pin {mapMode === 'from' ? 'source' : 'destination'}.</p>
        <div className="mt-3">
          <RouteMapPicker stops={stops} fromCoords={fromCoords} toCoords={toCoords} onPick={onMapPick} />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
        <ActionButton
          className="w-full"
          disabled={
            saving ||
            !availableRoute ||
            fromStop.trim().toLowerCase() === toStop.trim().toLowerCase()
          }
          onClick={() => void generateTicket()}
        >
          {saving ? 'Generating...' : 'Generate Ticket'}
        </ActionButton>
      </section>

      {ticket ? (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} />
            <p className="font-semibold">Ticket Generated Successfully</p>
          </div>
          <p className="mt-1 text-sm">Your fare has been deducted.</p>
          <Link
            href={`/tickets/${ticket.ticketId}`}
            className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            View QR Ticket
          </Link>
        </motion.section>
      ) : null}
    </PageShell>
  );
}
