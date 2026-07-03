'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageShell from '@/components/PageShell';
import { apiService, GPSLocation, TripEvent, TripItem } from '@/lib/api';
import { useAppRole } from '@/lib/useAppRole';

export default function TrackTripPage() {
  const params = useParams<{ tripId: string }>();
  const { isLoaded, ready, getToken } = useAppRole();
  const [trip, setTrip] = useState<TripItem | null>(null);
  const [location, setLocation] = useState<GPSLocation | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      if (!token) return;
      const data = await apiService.getPassengerTripStatus(token, params.tripId);
      setTrip(data.trip);
      setLocation(data.location);
      setEvents(data.events);
    };
    if (isLoaded && ready) void load().catch(() => toast.error('Failed to load tracking'));
  }, [getToken, isLoaded, params.tripId, ready]);

  return (
    <PageShell showTabs={false}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase text-zinc-500">Passenger Tracking</p>
        <h1 className="mt-1 text-base font-semibold text-zinc-950">{trip?.tripCode || 'Trip status'}</h1>
        <p className="mt-1 text-sm text-zinc-600">Live bus location, ETA, delay, boarding state, and recent trip events.</p>
      </section>
      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <iframe title="Live bus map" src={`https://www.google.com/maps?q=${location?.latitude || 17.385},${location?.longitude || 78.4867}&z=13&output=embed`} className="h-72 w-full border-0" loading="lazy" />
      </section>
      <section className="grid grid-cols-2 gap-2">
        {[
          ['Status', trip?.status || 'unknown'],
          ['ETA', trip?.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleTimeString() : 'pending'],
          ['Delay', `${trip?.delayMinutes || 0} min`],
          ['Remaining', `${trip?.remainingDistanceKm || 0} km`]
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
