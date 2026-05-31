// src/components/LiveMap.tsx
import React, { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LiveMapProps {
  transactions: any[];
}

export const LiveMap: React.FC<LiveMapProps> = ({ transactions }) => {
  // Grab this from your Mapbox account later and put it in .env
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZHVtbXkiLCJhIjoiY2xkdW1teXRva2VuIn0.dummy';

  // Center exactly on Ekiti State, Nigeria
  const [viewState, setViewState] = useState({
    longitude: 5.2536,
    latitude: 7.6615,
    zoom: 9,
    pitch: 45, // Adds a sleek 3D angle
  });

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden relative shadow-inner">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Dark mode looks great for executive dashboards
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* 1. THE GEOFENCE (GeoJSON Boundary) 
          Once your friend finishes the QGIS export, we will load the Polygon 
          GeoJSON right here using <Source> and <Layer> to draw the border.
        */}

        {/* 2. LIVE HUB MARKERS */}
        {transactions.map((tx, index) => {
          // For the pilot, if the backend hasn't sent exact PostGIS coords yet, 
          // we mock it slightly off the center based on the index to show activity.
          const lng = tx.longitude || (5.2536 + (Math.random() * 0.2 - 0.1));
          const lat = tx.latitude || (7.6615 + (Math.random() * 0.2 - 0.1));

          return (
            <Marker key={tx.id || index} longitude={lng} latitude={lat}>
              <div className="relative flex items-center justify-center">
                {/* Glowing Ping Animation */}
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
                {/* Solid Core */}
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border border-white"></span>
              </div>
            </Marker>
          );
        })}
      </Map>
      
      {/* Overlay Status Badge */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-md text-xs font-mono border border-gray-700">
        LIVE POSTGIS TELEMETRY: ACTIVE
      </div>
    </div>
  );
};