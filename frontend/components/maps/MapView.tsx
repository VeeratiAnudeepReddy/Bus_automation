'use client';

import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed } from 'lucide-react';
import type { GPSLocation, RouteItem, RouteStop, StopItem, TripEvent, TripItem } from '@/lib/api';
import { formatCurrency } from '@/lib/format';

type LatLng = { lat: number; lng: number };
type GoogleApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => MapInstance;
    Marker: new (options: Record<string, unknown>) => MarkerInstance;
    Polyline: new (options: Record<string, unknown>) => PolylineInstance;
    InfoWindow: new () => InfoWindowInstance;
    DirectionsRenderer: new (options: Record<string, unknown>) => DirectionsRendererInstance;
    DirectionsService: new () => DirectionsServiceInstance;
    LatLngBounds: new () => { extend: (point: LatLng) => void };
    Point: new (x: number, y: number) => unknown;
    SymbolPath: { CIRCLE: unknown };
    TravelMode: { DRIVING: string };
    DirectionsStatus: { OK: string };
  };
};
type MapInstance = {
  fitBounds: (bounds: unknown, padding?: number) => void;
  setZoom: (zoom: number) => void;
};
type MarkerInstance = {
  setMap: (map: MapInstance | null) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
  setPosition: (position: LatLng) => void;
  addListener: (eventName: string, listener: () => void) => unknown;
};
type PolylineInstance = { setMap: (map: MapInstance | null) => void };
type InfoWindowInstance = {
  setContent: (content: string) => void;
  open: (options: { map: MapInstance; anchor: MarkerInstance }) => void;
  close: () => void;
};
type DirectionsRendererInstance = {
  setDirections: (result: DirectionsResult) => void;
  setMap: (map: MapInstance | null) => void;
};
type DirectionsResult = {
  routes: {
    legs: { distance?: { text?: string }; duration?: { text?: string } }[];
    overview_path?: { lat: () => number; lng: () => number }[];
  }[];
};
type DirectionsServiceInstance = {
  route: (
    request: Record<string, unknown>,
    callback: (result: DirectionsResult | null, status: string) => void
  ) => void;
};
type MapMarker = MarkerInstance;

declare global {
  interface Window {
    google: GoogleApi;
    __busQrGoogleMapsPromise?: Promise<GoogleApi>;
  }
}

const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
const defaultCenter: LatLng = { lat: 17.385, lng: 78.4867 };

function loadGoogleMaps(): Promise<GoogleApi> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google Maps is unavailable during server rendering'));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (!mapsApiKey) return Promise.reject(new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'));
  if (window.__busQrGoogleMapsPromise) return window.__busQrGoogleMapsPromise;

  window.__busQrGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-busqr-google-maps="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsApiKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.busqrGoogleMaps = 'true';
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return window.__busQrGoogleMapsPromise;
}

function pinIcon(googleApi: GoogleApi, color: string) {
  return {
    path: googleApi.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 8
  };
}

function busIcon(googleApi: GoogleApi) {
  return {
    path: 'M12 2C8.1 2 5 2.5 5 6v8c0 1.3.8 2.4 2 2.8V19c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-2h4v2c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-2.2c1.2-.4 2-1.5 2-2.8V6c0-3.5-3.1-4-7-4Zm-4 3h8v4H8V5Zm0 8.8c-.7 0-1.2-.5-1.2-1.2S7.3 11.4 8 11.4s1.2.5 1.2 1.2S8.7 13.8 8 13.8Zm8 0c-.7 0-1.2-.5-1.2-1.2s.5-1.2 1.2-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2Z',
    fillColor: '#111827',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1,
    scale: 1.3,
    anchor: new googleApi.maps.Point(12, 12)
  };
}

function decodePolyline(encoded?: string | null): LatLng[] {
  if (!encoded) return [];
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

function asLatLng(value?: { lat?: number | null; lng?: number | null; latitude?: number | null; longitude?: number | null } | null): LatLng | null {
  if (!value) return null;
  const lat = Number(value.lat ?? value.latitude);
  const lng = Number(value.lng ?? value.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function stopPosition(stop: StopItem | RouteStop): LatLng | null {
  if ('coords' in stop) return asLatLng(stop.coords);
  return asLatLng({ lat: stop.latitude, lng: stop.longitude });
}

function fitToPoints(googleApi: GoogleApi, map: MapInstance, points: LatLng[]) {
  const valid = points.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
  if (!valid.length) return;
  const bounds = new googleApi.maps.LatLngBounds();
  valid.forEach((point) => bounds.extend(point));
  map.fitBounds(bounds, 48);
  if (valid.length === 1) map.setZoom(14);
}

function distanceKm(from?: LatLng | null, to?: LatLng | null) {
  if (!from || !to) return null;
  const radiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(value?: number | null) {
  if (!value || value <= 0) return 'Distance unavailable';
  return `${value.toFixed(value >= 10 ? 0 : 1)} km`;
}

function formatDuration(minutes?: number | null) {
  if (!minutes || minutes <= 0) return 'Duration unavailable';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

function arrivalEstimate(index: number) {
  return `${Math.max(2, index * 4 + 3)} min`;
}

export function MapFallback({
  title = 'Map unavailable',
  message = 'Unable to load Google Maps. Continue using list view.',
  children
}: {
  title?: string;
  message?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 shadow-sm">
      <p className="font-semibold text-zinc-950">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{message}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function MapView({
  className = 'h-72',
  center = defaultCenter,
  children,
  onReady,
  fallback
}: {
  className?: string;
  center?: LatLng;
  children?: ReactNode;
  onReady: (context: { google: GoogleApi; map: MapInstance }) => void | (() => void);
  fallback?: ReactNode;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<void | (() => void)>(undefined);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((googleApi) => {
        if (cancelled || !mapElementRef.current) return;
        const map = new googleApi.maps.Map(mapElementRef.current, {
          center,
          zoom: 12,
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false
        });
        cleanupRef.current = onReady({ google: googleApi, map }) || undefined;
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = undefined;
    };
  }, [center, onReady]);

  if (failed) return fallback || <MapFallback />;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div ref={mapElementRef} className={`${className} w-full`} />
      {children}
    </div>
  );
}

export function BoardingMarker() {
  return null;
}

export function DestinationMarker() {
  return null;
}

export function LiveBusMarker() {
  return null;
}

export function RouteMap({
  route,
  stops = [],
  boarding,
  destination,
  selectedStopName,
  className = 'h-80'
}: {
  route?: RouteItem | null;
  stops?: (StopItem | RouteStop)[];
  boarding?: LatLng | null;
  destination?: LatLng | null;
  selectedStopName?: string | null;
  className?: string;
}) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const routePath = useMemo(() => decodePolyline(route?.polyline), [route?.polyline]);
  const from = boarding || asLatLng(route?.fromCoords);
  const to = destination || asLatLng(route?.toCoords);
  const [directionsSummary, setDirectionsSummary] = useState<{ distance: string; duration: string } | null>(null);
  const routeSummary = useMemo(() => {
    const estimatedDistance = route?.distanceKm || distanceKm(from, to);
    const estimatedDuration = route?.estimatedTime || route?.durationMinutes || (estimatedDistance ? estimatedDistance * 3.2 : null);
    return {
      distance: formatDistance(estimatedDistance),
      duration: typeof estimatedDuration === 'string' ? estimatedDuration : formatDuration(estimatedDuration)
    };
  }, [from, route?.distanceKm, route?.durationMinutes, route?.estimatedTime, to]);
  const summary = directionsSummary || routeSummary;

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 }
    );
  }, []);

  const routeStopNames = new Set([route?.from, route?.to].filter(Boolean));
  const nearbyStops = stops
    .filter((stop) => !routeStopNames.has(stop.name))
    .slice(0, 6)
    .map((stop) => stop.name);

  const fallback = (
    <MapFallback>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Route:</span> {route ? `${route.from} to ${route.to}` : 'Selected route'}</p>
        <p><span className="font-medium">Fare:</span> {route?.fare ? formatCurrency(route.fare) : 'Fare unavailable'}</p>
        <p><span className="font-medium">Distance:</span> {summary.distance}</p>
        <p><span className="font-medium">Duration:</span> {summary.duration}</p>
        {route ? <p><span className="font-medium">Boarding:</span> {route.from}</p> : null}
        {route ? <p><span className="font-medium">Destination:</span> {route.to}</p> : null}
        {nearbyStops.length ? <p><span className="font-medium">Nearby stops:</span> {nearbyStops.join(', ')}</p> : null}
      </div>
    </MapFallback>
  );

  const handleReady = useCallback(({ google, map }: { google: GoogleApi; map: MapInstance }) => {
    const markers: MapMarker[] = [];
    const polylines: PolylineInstance[] = [];
    const info = new google.maps.InfoWindow();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#111827', strokeOpacity: 0.9, strokeWeight: 5 }
    });

    const addMarker = (position: LatLng, title: string, color: string, label?: string, content?: string) => {
      const marker = new google.maps.Marker({
        map,
        position,
        title,
        label: label ? { text: label, color: '#ffffff', fontWeight: '700' } : undefined,
        icon: pinIcon(google, color)
      });
      marker.addListener('click', () => {
        info.setContent(content || `<strong>${title}</strong>`);
        info.open({ map, anchor: marker });
      });
      markers.push(marker);
      return marker;
    };

    if (from) addMarker(from, route?.from || 'Boarding point', '#16a34a', 'B', `<strong>${route?.from || 'Boarding point'}</strong><br/>Selected boarding stop`);
    if (to) addMarker(to, route?.to || 'Destination', '#dc2626', 'D', `<strong>${route?.to || 'Destination'}</strong><br/>Selected drop-off stop`);
    if (userLocation) addMarker(userLocation, 'Your location', '#2563eb', 'Y', '<strong>Your location</strong>');

    stops.forEach((stop, index) => {
      const position = stopPosition(stop);
      if (!position) return;
      const selected = stop.name === selectedStopName || stop.name === route?.from || stop.name === route?.to;
      addMarker(
        position,
        stop.name,
        selected ? '#7c3aed' : '#0891b2',
        selected ? 'S' : undefined,
        `<strong>${stop.name}</strong><br/>Estimated arrival: ${arrivalEstimate(index)}`
      );
    });

    if (routePath.length) {
      const line = new google.maps.Polyline({
        path: routePath,
        map,
        strokeColor: route?.routeColor || '#111827',
        strokeOpacity: 0.9,
        strokeWeight: 5
      });
      polylines.push(line);
      fitToPoints(google, map, [...routePath, from, to, userLocation].filter(Boolean) as LatLng[]);
    } else if (from && to) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: from,
          destination: to,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);
            const leg = result.routes[0]?.legs[0];
            setDirectionsSummary({
              distance: leg?.distance?.text || formatDistance(route?.distanceKm || distanceKm(from, to)),
              duration: leg?.duration?.text || route?.estimatedTime || formatDuration(route?.durationMinutes)
            });
            const path = result.routes[0]?.overview_path?.map((point) => ({ lat: point.lat(), lng: point.lng() })) || [];
            fitToPoints(google, map, [...path, userLocation].filter(Boolean) as LatLng[]);
          } else {
            const line = new google.maps.Polyline({
              path: [from, to],
              map,
              strokeColor: route?.routeColor || '#111827',
              strokeOpacity: 0.8,
              strokeWeight: 4
            });
            polylines.push(line);
            fitToPoints(google, map, [from, to, userLocation].filter(Boolean) as LatLng[]);
          }
        }
      );
    } else {
      fitToPoints(google, map, [from, to, userLocation].filter(Boolean) as LatLng[]);
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      polylines.forEach((line) => line.setMap(null));
      directionsRenderer.setMap(null);
      info.close();
    };
  }, [from, route, routePath, selectedStopName, setDirectionsSummary, stops, to, userLocation]);

  return (
    <MapView className={className} center={from || to || userLocation || defaultCenter} onReady={handleReady} fallback={fallback}>
      <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl bg-white/95 p-3 text-sm shadow">
        <p className="font-semibold text-zinc-950">{route ? `${route.from} to ${route.to}` : 'Route map'}</p>
        <p className="mt-1 text-zinc-600">{summary.distance} · {summary.duration} · {route?.fare ? formatCurrency(route.fare) : 'Fare unavailable'}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }));
        }}
        className="absolute bottom-3 right-3 rounded-full bg-white p-3 text-zinc-800 shadow"
        aria-label="Use current location"
      >
        <LocateFixed size={18} />
      </button>
    </MapView>
  );
}

function animateMarker(marker: MapMarker, next: LatLng) {
  const current = marker.getPosition();
  if (!current) {
    marker.setPosition(next);
    return;
  }
  const start = { lat: current.lat(), lng: current.lng() };
  const duration = 900;
  const startedAt = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress * (2 - progress);
    marker.setPosition({
      lat: start.lat + (next.lat - start.lat) * eased,
      lng: start.lng + (next.lng - start.lng) * eased
    });
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function TripTrackerMap({
  trip,
  location,
  events = [],
  route,
  stops = [],
  className = 'h-96'
}: {
  trip?: TripItem | null;
  location?: GPSLocation | null;
  events?: TripEvent[];
  route?: RouteItem | null;
  stops?: (StopItem | RouteStop)[];
  className?: string;
}) {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const busPosition = asLatLng(location || trip?.liveLocation || null);
  const from = asLatLng(route?.fromCoords);
  const to = asLatLng(route?.toCoords);
  const routePath = useMemo(() => decodePolyline(route?.polyline), [route?.polyline]);
  const stopNames = stops.map((stop) => stop.name);
  const currentStop = events.find((event) => event.type.toLowerCase().includes('stop'))?.message || stopNames[0] || 'Boarding pending';
  const nextStop = stopNames[1] || route?.to || 'Destination';
  const remainingStops = Math.max(0, stopNames.length - 2);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 }
    );
  }, []);

  const fallback = (
    <MapFallback>
      <div className="space-y-3">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="font-medium">Bus:</span> {String(trip?.busId || 'Unassigned')}</p>
          <p><span className="font-medium">Route:</span> {String(trip?.tripCode || route?.routeCode || 'Route pending')}</p>
          <p><span className="font-medium">Current stop:</span> {currentStop}</p>
          <p><span className="font-medium">Next stop:</span> {nextStop}</p>
        </div>
        <ol className="space-y-2 text-sm">
          {(stopNames.length ? stopNames : [currentStop, nextStop]).map((stop, index) => (
            <li key={`${stop}-${index}`} className="rounded-xl border border-zinc-200 p-3">
              <span className="font-medium">{stop}</span>
              <span className="ml-2 text-zinc-500">ETA {arrivalEstimate(index)}</span>
            </li>
          ))}
        </ol>
      </div>
    </MapFallback>
  );

  const handleReady = useCallback(({ google, map }: { google: GoogleApi; map: MapInstance }) => {
    const markers: MapMarker[] = [];
    const polylines: PolylineInstance[] = [];
    const info = new google.maps.InfoWindow();
    let busMarker: MapMarker | null = null;

    const addMarker = (position: LatLng, title: string, color: string, label?: string, content?: string) => {
      const marker = new google.maps.Marker({
        map,
        position,
        title,
        label: label ? { text: label, color: '#ffffff', fontWeight: '700' } : undefined,
        icon: pinIcon(google, color)
      });
      marker.addListener('click', () => {
        info.setContent(content || `<strong>${title}</strong>`);
        info.open({ map, anchor: marker });
      });
      markers.push(marker);
      return marker;
    };

    if (from) addMarker(from, route?.from || 'Boarding point', '#16a34a', 'B');
    if (to) addMarker(to, route?.to || 'Destination', '#dc2626', 'D');
    if (userLocation) addMarker(userLocation, 'Your location', '#2563eb', 'Y');
    stops.forEach((stop, index) => {
      const position = stopPosition(stop);
      if (!position) return;
      addMarker(position, stop.name, index === 0 || index === stops.length - 1 ? '#7c3aed' : '#0891b2', undefined, `<strong>${stop.name}</strong><br/>ETA ${arrivalEstimate(index)}`);
    });

    if (busPosition) {
      busMarker = new google.maps.Marker({
        map,
        position: busPosition,
        title: 'Live bus',
        icon: busIcon(google)
      });
      busMarker.addListener('click', () => {
        info.setContent(`<strong>${trip?.tripCode || 'Live bus'}</strong><br/>Occupancy: ${trip?.occupancy ?? 'Unavailable'}<br/>ETA: ${trip?.estimatedArrival ? new Date(trip.estimatedArrival).toLocaleTimeString() : 'Pending'}`);
        if (busMarker) info.open({ map, anchor: busMarker });
      });
      busMarkerRef.current = busMarker;
      markers.push(busMarker);
    }

    if (routePath.length) {
      const line = new google.maps.Polyline({ path: routePath, map, strokeColor: route?.routeColor || '#111827', strokeOpacity: 0.9, strokeWeight: 5 });
      polylines.push(line);
      fitToPoints(google, map, [...routePath, busPosition, userLocation].filter(Boolean) as LatLng[]);
    } else {
      const path = [from, busPosition, to].filter(Boolean) as LatLng[];
      if (path.length >= 2) {
        const line = new google.maps.Polyline({ path, map, strokeColor: route?.routeColor || '#111827', strokeOpacity: 0.9, strokeWeight: 5 });
        polylines.push(line);
      }
      fitToPoints(google, map, [...path, userLocation].filter(Boolean) as LatLng[]);
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      polylines.forEach((line) => line.setMap(null));
      busMarkerRef.current = null;
      info.close();
    };
  }, [busPosition, from, route, routePath, stops, to, trip, userLocation]);

  const busMarkerRef = useRef<MapMarker | null>(null);
  useEffect(() => {
    if (busMarkerRef.current && busPosition) animateMarker(busMarkerRef.current, busPosition);
  }, [busPosition]);

  return (
    <MapView className={className} center={busPosition || from || to || userLocation || defaultCenter} onReady={handleReady} fallback={fallback}>
      <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl bg-white/95 p-3 text-sm shadow">
        <p className="font-semibold text-zinc-950">{trip?.tripCode || route?.routeCode || 'Active trip'}</p>
        <p className="mt-1 text-zinc-600">Current: {currentStop} · Next: {nextStop}</p>
        <p className="mt-1 text-zinc-600">{remainingStops} remaining stops · {formatDistance(trip?.remainingDistanceKm || location?.remainingDistanceKm)}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }));
        }}
        className="absolute bottom-3 right-3 rounded-full bg-white p-3 text-zinc-800 shadow"
        aria-label="Use current location"
      >
        <LocateFixed size={18} />
      </button>
    </MapView>
  );
}

export function MultiVehicleMap({
  vehicles,
  className = 'h-64'
}: {
  vehicles: Array<{ tripId: string; tripCode?: string; location?: GPSLocation | null }>;
  className?: string;
}) {
  const markersRef = useRef<Map<string, MapMarker>>(new Map());
  const positions = useMemo(() => {
    const next: Array<{ tripId: string; tripCode?: string; position: LatLng }> = [];
    for (const vehicle of vehicles) {
      const position = asLatLng(vehicle.location || null);
      if (!position) continue;
      next.push({ tripId: vehicle.tripId, tripCode: vehicle.tripCode, position });
    }
    return next;
  }, [vehicles]);

  const handleReady = useCallback(({ google, map }: { google: GoogleApi; map: MapInstance }) => {
    const local = new Map<string, MapMarker>();
    positions.forEach((item, index) => {
      const marker = new google.maps.Marker({
        map,
        position: item.position,
        title: item.tripCode || item.tripId,
        label: { text: String(index + 1), color: '#ffffff', fontWeight: '700' },
        icon: busIcon(google)
      });
      local.set(item.tripId, marker);
    });
    markersRef.current = local;
    fitToPoints(google, map, positions.map((item) => item.position));
    return () => {
      local.forEach((marker) => marker.setMap(null));
      markersRef.current = new Map();
    };
  }, [positions]);

  useEffect(() => {
    positions.forEach((item) => {
      const marker = markersRef.current.get(item.tripId);
      if (marker) animateMarker(marker, item.position);
    });
  }, [positions]);

  const fallback = (
    <MapFallback>
      <ul className="space-y-2 text-sm">
        {positions.map((item) => (
          <li key={item.tripId} className="rounded-xl border border-zinc-200 p-3">
            <strong>{item.tripCode || item.tripId}</strong>
            <span className="ml-2 text-zinc-500">{item.position.lat.toFixed(4)}, {item.position.lng.toFixed(4)}</span>
          </li>
        ))}
      </ul>
    </MapFallback>
  );

  return (
    <MapView
      className={className}
      center={positions[0]?.position || defaultCenter}
      onReady={handleReady}
      fallback={fallback}
    />
  );
}
