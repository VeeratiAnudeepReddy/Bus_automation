'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { TripTrackerMap, MultiVehicleMap } from '@/components/maps/MapView';
import { apiService, GPSLocation, RouteItem, RouteStop, TripEvent, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';
import { isLocationUpdateForTrip, subscribeRealtime } from '@/lib/realtime';

export default function TrackTripPage() {
  const params = useParams<{ tripId: string }>();
  const { isLoaded, ready, getToken } = useAppRole();
  const [trip, setTrip] = useState<TripItem | null>(null);
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [route, setRoute] = useState<RouteItem | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [progress, setProgress] = useState<{ distanceTravelledKm?: number; remainingDistanceKm?: number } | null>(null);
  const [live, setLive] = useState(false);
  const [fleet, setFleet] = useState<Array<{ tripId: string; tripCode?: string; location: GPSLocation }>>([]);

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
    let closed = false;
    let subscription: { close: () => void } | null = null;

    const connect = async () => {
      const token = await getToken();
      if (!token || closed) return;
      subscription = subscribeRealtime({
        token,
        onEvent: (event) => {
          if (event.type === 'connected') {
            setLive(true);
            return;
          }
          if (isLocationUpdateForTrip(event, params.tripId)) {
            const next = event.payload.location;
            if (next?.latitude != null && next?.longitude != null) {
              setLocation((prev) => ({
                ...(prev || {}),
                latitude: Number(next.latitude),
                longitude: Number(next.longitude),
                speed: Number(next.speed || 0),
                heading: Number(next.heading || 0),
                recordedAt: next.recordedAt || new Date().toISOString()
              } as GPSLocation));
            }
            if (event.payload.trip) {
              setTrip((prev) => (prev ? { ...prev, ...event.payload.trip } : (event.payload.trip as TripItem)));
            }
          }
          if (event.type === 'location_updated') {
            const payload = event.payload as {
              trip?: { _id?: string; tripCode?: string };
              location?: GPSLocation;
            };
            if (payload.trip?._id && payload.location?.latitude != null) {
              setFleet((prev) => {
                const next = prev.filter((item) => item.tripId !== String(payload.trip?._id));
                next.push({
                  tripId: String(payload.trip?._id),
                  tripCode: payload.trip?.tripCode,
                  location: payload.location as GPSLocation
                });
                return next.slice(-12);
              });
            }
          }
        },
        onError: () => {
          setLive(false);
          toast.error('Live stream disconnected — falling back to polling');
        }
      });
    };

    void connect();
    const poll = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !live) void load(false);
    }, 15000);

    return () => {
      closed = true;
      subscription?.close();
      window.clearInterval(poll);
    };
  }, [getToken, isLoaded, live, load, params.tripId, ready]);

  const otherVehicles = useMemo(
    () => fleet.filter((item) => item.tripId !== String(params.tripId)),
    [fleet, params.tripId]
  );

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Passenger Tracking</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">{trip?.tripCode || route?.routeCode || 'Trip status'}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {live ? 'Live SSE connected — markers interpolate between GPS updates.' : 'Connecting live stream / polling fallback.'}
        </p>
      </section>
      <TripTrackerMap trip={trip} location={location} events={events} route={route} stops={stops} />
      {otherVehicles.length ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Other live vehicles (same org stream)</h2>
          <MultiVehicleMap className="mt-3 h-64" vehicles={[{ tripId: String(params.tripId), tripCode: trip?.tripCode, location: location }, ...otherVehicles].filter((v) => v.location)} />
        </section>
      ) : null}
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
