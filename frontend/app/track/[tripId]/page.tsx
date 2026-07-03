'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { TripTrackerMap } from '@/components/maps/MapView';
import { apiService, GPSLocation, RouteItem, RouteStop, TripEvent, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function TrackTripPage() {
  const params = useParams<{ tripId: string }>();
  const { isLoaded, ready, getToken } = useAppRole();
  const [trip, setTrip] = useState<TripItem | null>(null);
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [route, setRoute] = useState<RouteItem | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [progress, setProgress] = useState<{ distanceTravelledKm?: number; remainingDistanceKm?: number } | null>(null);

  const load = useCallback(async (showError = false) => {
    const token = await getToken();
    if (!token) return;
    try {
      const data = await apiService.getPassengerTripStatus(token, params.tripId);
      setTrip(data.trip);
      setLocation(data.location);
      setEvents(data.events);
      setProgress(data.progress || null);

      if (!route && data.trip?.routeId) {
        const routeData = await apiService.getRoutes(token, { city: 'Hyderabad' }).catch(() => ({ routes: [], stops: [], popularRoutes: [], city: 'Hyderabad' }));
        const matched = routeData.routes.find((item) => item._id === data.trip.routeId) || null;
        setRoute(matched);
        if (matched) {
          const stopData = await apiService.listStops(token, matched._id).catch(() => ({ stops: [] }));
          setStops(stopData.stops);
        }
      }
    } catch {
      if (showError) toast.error('Failed to load tracking');
    }
  }, [getToken, params.tripId, route]);

  useEffect(() => {
    if (isLoaded && ready) void Promise.resolve().then(() => load(true));
  }, [isLoaded, load, ready]);

  useEffect(() => {
    if (!isLoaded || !ready) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load(false);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [isLoaded, load, ready]);

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Passenger Tracking</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">{trip?.tripCode || route?.routeCode || 'Trip status'}</h1>
        <p className="mt-1 text-sm text-zinc-600">Live bus location, ETA, delay, boarding state, and recent trip events.</p>
      </section>
      <TripTrackerMap trip={trip} location={location} events={events} route={route} stops={stops} />
      <section className="grid grid-cols-2 gap-2">
        {[
          ['Status', trip?.status || 'unknown'],
          ['ETA', trip?.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleTimeString() : 'pending'],
          ['Delay', `${trip?.delayMinutes || 0} min`],
          ['Remaining', `${progress?.remainingDistanceKm ?? trip?.remainingDistanceKm ?? 0} km`]
        ].map(([label, value]) => <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
      </section>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <div className="mt-3 grid gap-2">
          {events.map((event) => <div key={event._id} className="rounded-xl border border-zinc-200 p-3 text-sm"><p className="font-medium">{event.type}</p><p className="text-zinc-500">{event.message || new Date(event.createdAt).toLocaleString()}</p></div>)}
        </div>
      </section>
    </PageShell>
  );
}
