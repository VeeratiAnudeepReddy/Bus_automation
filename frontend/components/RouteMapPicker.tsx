'use client';

import 'leaflet/dist/leaflet.css';
import type { LeafletMouseEvent } from 'leaflet';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import type { StopItem } from '@/lib/api';

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (coords: LatLng) => void }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

export default function RouteMapPicker({
  stops,
  fromCoords,
  toCoords,
  onPick
}: {
  stops: StopItem[];
  fromCoords: LatLng | null;
  toCoords: LatLng | null;
  onPick: (coords: LatLng) => void;
}) {
  const fallbackCenter: LatLng = { lat: 17.385, lng: 78.4867 };
  const center = fromCoords || toCoords || fallbackCenter;

  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-zinc-200">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={onPick} />

        {stops.map((stop) => (
          <CircleMarker
            key={stop.name}
            center={{ lat: stop.coords.lat, lng: stop.coords.lng }}
            radius={5}
            pathOptions={{ color: '#52525b', fillColor: '#71717a', fillOpacity: 0.9 }}
          >
            <Tooltip>{stop.name}</Tooltip>
          </CircleMarker>
        ))}

        {fromCoords ? (
          <CircleMarker center={fromCoords} radius={7} pathOptions={{ color: '#166534', fillColor: '#16a34a', fillOpacity: 1 }}>
            <Tooltip>From</Tooltip>
          </CircleMarker>
        ) : null}

        {toCoords ? (
          <CircleMarker center={toCoords} radius={7} pathOptions={{ color: '#1d4ed8', fillColor: '#2563eb', fillOpacity: 1 }}>
            <Tooltip>To</Tooltip>
          </CircleMarker>
        ) : null}

        {fromCoords && toCoords ? (
          <Polyline positions={[fromCoords, toCoords]} pathOptions={{ color: '#18181b', weight: 4 }} />
        ) : null}
      </MapContainer>
    </div>
  );
}
