import React, { useEffect, useState } from 'react';

interface UserLocationMarkerProps {
  position: { lat: number; lng: number };
  heading: number; // 0-360 degrees
  map: google.maps.Map | null;
}

export default function UserLocationMarker({ position, heading, map }: UserLocationMarkerProps) {
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create SVG for the custom marker with animated waves
    const svg = `
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <!-- Animated waves background -->
        <defs>
          <style>
            @keyframes pulse {
              0% { r: 15px; opacity: 0.8; }
              100% { r: 35px; opacity: 0; }
            }
            @keyframes pulse2 {
              0% { r: 15px; opacity: 0.6; }
              100% { r: 35px; opacity: 0; }
            }
            @keyframes pulse3 {
              0% { r: 15px; opacity: 0.4; }
              100% { r: 35px; opacity: 0; }
            }
            .wave1 { animation: pulse 2s infinite; }
            .wave2 { animation: pulse2 2.5s infinite 0.3s; }
            .wave3 { animation: pulse3 3s infinite 0.6s; }
          </style>
        </defs>
        
        <!-- Pulse waves -->
        <circle cx="30" cy="30" r="15" fill="none" stroke="#3B82F6" stroke-width="1.5" class="wave1" />
        <circle cx="30" cy="30" r="15" fill="none" stroke="#3B82F6" stroke-width="1.5" class="wave2" />
        <circle cx="30" cy="30" r="15" fill="none" stroke="#3B82F6" stroke-width="1.5" class="wave3" />
        
        <!-- Main circle -->
        <circle cx="30" cy="30" r="15" fill="#3B82F6" stroke="white" stroke-width="3" />
        
        <!-- Direction arrow (points upward, will be rotated) -->
        <path d="M 30 12 L 35 25 L 30 22 L 25 25 Z" fill="white" />
        
        <!-- Center dot -->
        <circle cx="30" cy="30" r="4" fill="white" />
      </svg>
    `;

    // Convert SVG to data URL
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    // Create or update marker
    if (marker) {
      marker.setPosition(position);
      (marker as any).rotation = heading;
    } else {
      const newMarker = new google.maps.Marker({
        position,
        map,
        icon: {
          url: svgDataUrl,
          scaledSize: new google.maps.Size(60, 60),
          anchor: new google.maps.Point(30, 30),
        },
        title: 'Your Location',
        zIndex: 1000,
      });

      // Rotate marker based on heading (using custom property)
      (newMarker as any).rotation = heading;
      setMarker(newMarker);
    }
  }, [position, heading, map, marker]);

  return null;
}
