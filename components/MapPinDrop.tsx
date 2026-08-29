'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix missing Leaflet marker icons in Next.js environment
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Event handler component to capture clicks and place user pin
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

interface MapPinDropProps {
  onPinDrop: (lat: number, lng: number) => void;
  isExpanded: boolean;
}

export default function MapPinDrop({ onPinDrop, isExpanded }: MapPinDropProps) {
  return (
    <MapContainer 
      center={[20, 0]} 
      zoom={isExpanded ? 2 : 1} 
      scrollWheelZoom={true} 
      className="w-full h-full z-0"
    >
      {/* High-definition, open-source CartoDB Voyager tiles (No API key watermarks) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        maxZoom={19}
      />
      <LocationMarker onPinDrop={onPinDrop} />
    </MapContainer>
  );
}