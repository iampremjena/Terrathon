'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapPinDropProps {
  onPinDrop: (lat: number, lng: number) => void;
  isExpanded: boolean;
}

// Automatically fixes Leaflet's internal sizing when the map container expands
function MapResizer({ isExpanded }: { isExpanded: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timeout);
  }, [isExpanded, map]);
  return null;
}

function LocationMarker({ onPinDrop }: { onPinDrop: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPinDrop(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function MapPinDrop({ onPinDrop, isExpanded }: MapPinDropProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className="h-full w-full bg-slate-800 animate-pulse rounded-2xl" />;

  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={isExpanded ? 3 : 1} 
      scrollWheelZoom={true} 
      className="h-full w-full z-0"
    >
      {/* CartoDB Voyager forces English labels globally */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">Carto</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapResizer isExpanded={isExpanded} />
      <LocationMarker onPinDrop={onPinDrop} />
    </MapContainer>
  );
}